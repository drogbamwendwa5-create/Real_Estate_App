/**
 * Cleanup: delete properties stored WITHOUT proper images to free DB space.
 *
 * "Without proper images" mirrors the app's own rule in
 * property-aggregation/services/PropertyImportService.js#ensureImages /
 * images/ImageValidationService.js: a document has NO proper image when every
 * entry in its image list either has an empty/null url, points to the
 * placeholder fallback (via.placeholder.com / "No Image"), or is flagged
 * isValid === false (AggregatedProperty images only).
 *
 * Targets both collections:
 *   - properties           (Models/Property.js -> images)
 *   - aggregatedproperties (property-aggregation/database/AggregatedProperty.js
 *                          -> propertyImages)
 *
 * Usage (from Backend/):
 *   node cleanup-no-image-properties.js                        # dry-run analysis
 *   node cleanup-no-image-properties.js --execute              # back up + delete ALL candidates
 *   node cleanup-no-image-properties.js --execute --target-mb 100    # stop at ~100MB reclaimed
 *   node cleanup-no-image-properties.js --rebuild [coll ...]   # reclaim churn bloat via
 *                              export -> drop -> re-import -> identical reindex
 *                              (default: aggregatedproperties; compact is not allowed on Atlas M0/M2/M5)
 *
 * Deleted docs are backed up to Backend/backups/no-image-cleanup/<timestamp>/.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Placeholder patterns used by scrapers/import services in this repo
const PLACEHOLDER_RE = /via\.placeholder\.com|placeholder\.(?:com|co)|no[+\-_ ]?image|screenshot/i;
const TARGETS = [
  {
    key: 'Property (main app listings)',
    collection: 'properties',
    imageField: 'images',
    supportsIsValidFlag: false,
  },
  {
    key: 'AggregatedProperty (scraped listings)',
    collection: 'aggregatedproperties',
    imageField: 'propertyImages',
    supportsIsValidFlag: true,
  },
];

const args = process.argv.slice(2);
const EXECUTE = args.includes('--execute');
const targetIdx = args.indexOf('--target-mb');
const TARGET_MB = targetIdx !== -1 ? parseFloat(args[targetIdx + 1]) : Infinity;

const fmtMB = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/** An image entry is "proper" when it has a real, non-placeholder, valid URL. */
function isProperImage(entry, supportsIsValidFlag) {
  let url = null;
  if (typeof entry === 'string') url = entry.trim();
  else if (entry && typeof entry === 'object') {
    url = String(entry.url || entry.src || '').trim();
    if (supportsIsValidFlag && entry.isValid === false) return false;
  }
  return !!url && !PLACEHOLDER_RE.test(url);
}

/** Classify a doc; returns breakdown key or null when it should be kept. */
function classify(doc, cfg) {
  const raw = doc[cfg.imageField];
  const imgs = Array.isArray(raw) ? raw : [];
  if (!raw) return 'missing';
  if (imgs.length === 0) return 'empty';
  const properCount = imgs.filter((i) => isProperImage(i, cfg.supportsIsValidFlag)).length;
  if (properCount > 0) return null; // keeps at least one proper image
  const flaggedInvalid = cfg.supportsIsValidFlag && imgs.some((i) => i && i.isValid === false);
  return flaggedInvalid ? 'all-invalid-flagged' : 'placeholder-only';
}

async function discoverDbName(client) {
  const { databases } = await client.db().admin().listDatabases();
  for (const info of databases) {
    if (['admin', 'local', 'config'].includes(info.name)) continue;
    const names = (await client.db(info.name).listCollections().toArray()).map((c) => c.name);
    if (TARGETS.every((t) => names.includes(t.collection))) return info.name;
  }
  return null;
}

async function getStats(coll) {
  try {
    const s = await coll.stats();
    return { count: s.count ?? 0, size: s.size ?? 0 };
  } catch (_err) {
    const [r] = await coll
      .aggregate([{ $group: { _id: null, n: { $sum: 1 }, b: { $sum: { $bsonSize: '$$ROOT' } } } }])
      .toArray();
    return { count: r?.n ?? 0, size: r?.b ?? 0 };
  }
}

async function collectCandidates(db, cfg) {
  const coll = db.collection(cfg.collection);
  const stats = await getStats(coll);

  // Cheap server-side pre-filter for docs that are *possibly* image-less,
  // then classify precisely in JS (scrapers store mixed image shapes).
  const or = [
    { [cfg.imageField]: { $exists: false } },
    { [cfg.imageField]: null },
    { [cfg.imageField]: [] },
    { [`${cfg.imageField}.url`]: PLACEHOLDER_RE },
    { [`${cfg.imageField}.url`]: { $in: [null, ''] } },
  ];
  if (cfg.supportsIsValidFlag) or.push({ [`${cfg.imageField}.isValid`]: false });

  const breakdownCounts = { missing: 0, empty: 0, 'placeholder-only': 0, 'all-invalid-flagged': 0 };
  const candidateIds = [];

  for await (const d of coll.aggregate(
    [{ $match: { $or: or } }, { $project: { [cfg.imageField]: 1 } }],
    { allowDiskUse: true }
  )) {
    const cat = classify(d, cfg);
    if (cat) {
      breakdownCounts[cat] += 1;
      candidateIds.push(d._id);
    }
  }

  let candidateBytesExact = 0;
  if (candidateIds.length > 0) {
    const [sz] = await coll
      .aggregate([
        { $match: { _id: { $in: candidateIds } } },
        { $group: { _id: null, bytes: { $sum: { $bsonSize: '$$ROOT' } } } },
      ])
      .toArray();
    candidateBytesExact = sz?.bytes ?? 0;
  }

  return { coll, stats, candidateIds, candidateBytesExact, breakdownCounts };
}

async function backupDocs(coll, ids, backupDir, label) {
  const out = [];
  const BATCH = 500;
  for (let i = 0; i < ids.length; i += BATCH) {
    const docs = await coll.find({ _id: { $in: ids.slice(i, i + BATCH) } }).toArray();
    out.push(...docs);
  }
  const file = path.join(backupDir, `${label}-deleted.json`);
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(`   Backup written: ${file} (${out.length} docs, ${fmtMB(fs.statSync(file).size)} on disk)`);
}

/**
 * Rebuild a collection to reclaim WiredTiger churn bloat (compact is
 * CMD_NOT_ALLOWED on Atlas shared tiers): export -> drop -> re-import ->
 * recreate the exact same index set. Fresh files are sized to actual data.
 */
async function rebuildCollection(db, collName, backupDir) {
  const coll = db.collection(collName);
  const [before] = await coll.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
  const bss = before.storageStats;
  console.log(`\n=== REBUILD "${collName}" ===`);
  console.log(`Before: ${bss.count} docs | ${(bss.size / 1048576).toFixed(2)} MB data | ${(bss.storageSize / 1048576).toFixed(2)} MB storage | ${Object.keys(bss.indexSizes || {}).length} indexes`);

  fs.mkdirSync(backupDir, { recursive: true });

  // 1. Snapshot documents AND index specs (kept in native form for re-insert)
  const docs = await coll.find({}).toArray();
  let indexSpecs;
  try {
    const idxList = await coll.listIndexes().toArray();
    indexSpecs = idxList.filter((i) => i.name !== '_id_');
  } catch (_e) {
    indexSpecs = [];
  }
  if (!docs.length) throw new Error(`Refusing to rebuild "${collName}": 0 documents found (unexpected)`);

  // Human-readable safety copy (best-effort EJSON to preserve types)
  try {
    const { EJSON } = require('mongodb');
    fs.writeFileSync(path.join(backupDir, `${collName}-snapshot.ejson`), EJSON.stringify(docs));
    fs.writeFileSync(path.join(backupDir, `${collName}-indexes.json`), JSON.stringify(indexSpecs, null, 2));
  } catch (_e) {
    fs.writeFileSync(path.join(backupDir, `${collName}-snapshot.json`), JSON.stringify(docs));
    fs.writeFileSync(path.join(backupDir, `${collName}-indexes.json`), JSON.stringify(indexSpecs, null, 2));
  }
  console.log(`   Snapshot: ${docs.length} docs + ${indexSpecs.length} index specs -> ${backupDir}`);

  // 2. Drop and 3. re-import preserving _id and every field exactly
  await coll.drop();
  console.log(`   Dropped collection. Re-inserting...`);
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    await coll.insertMany(docs.slice(i, i + BATCH), { ordered: false });
    inserted += Math.min(BATCH, docs.length - i);
    process.stdout.write(`   Inserted ~${Math.min(inserted, docs.length)}/${docs.length}\r`);
  }
  process.stdout.write('\n');

  // 4. Recreate identical indexes
  for (const spec of indexSpecs) {
    const opts = {};
    for (const k of ['unique', 'sparse', 'expireAfterSeconds', 'partialFilterExpression', 'name', 'default_language', 'weights', 'collation', 'wildcardProjection']) {
      if (spec[k] !== undefined) opts[k] = spec[k];
    }
    await coll.createIndex(spec.key, opts);
  }

  // Verify
  const finalCount = await coll.countDocuments({});
  const [after] = await coll.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
  const ass = after.storageStats;
  console.log(`After : ${finalCount}/${docs.length} docs verified | ${(ass.size / 1048576).toFixed(2)} MB data | ${(ass.storageSize / 1048576).toFixed(2)} MB storage | ${Object.keys(ass.indexSizes || {}).length} indexes rebuilt`);
  const saved = ((bss.storageSize - ass.storageSize) / 1048576).toFixed(2);
  console.log(`Reclaimed ≈ ${saved} MB`);
  return { before: bss.storageSize, after: ass.storageSize };
}

/** Revive BSON-ish values that JSON.stringify flattened (dates, ObjectIds). */
function reviveTypes(obj) {
  const OID_RE = /^[0-9a-f]{24}$/i;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  const OID_KEYS = new Set(['_id', 'mergedFrom', 'canonicalPropertyId']);
  const walk = (node, key) => {
    if (Array.isArray(node)) return node.map((v) => walk(v, key));
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) out[k] = walk(v, k);
      return out;
    }
    // Strings under known reference keys become ObjectIds
    if (typeof node === 'string') {
      if (OID_KEYS.has(key)) {
        if (OID_RE.test(node)) return new mongoose.Types.ObjectId(node);
        return null; // explicit null refs were serialized away; empty strings shouldn't be ids
      }
      if ((key.endsWith('At') || key.endsWith('Date') || key.endsWith('Updated')) && DATE_RE.test(node)) {
        return new Date(node);
      }
    }
    return node;
  };
  return walk(obj, '');
}

/**
 * Recover from an interrupted --rebuild: load snapshot dir produced by this
 * script ({coll}-snapshot.json + {coll}-indexes.json), drop the target
 * collection and restore ALL documents + identical indexes.
 */
async function restoreFromSnapshot(db, backupDir) {
  const snapFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith('-snapshot.json'));
  if (!snapFiles.length) throw new Error(`No *-snapshot.json found in ${backupDir}`);
  for (const snapName of snapFiles) {
    const collName = snapName.replace('-snapshot.json', '');
    console.log(`Restoring "${collName}" from ${snapName}`);
    const raw = JSON.parse(fs.readFileSync(path.join(backupDir, snapName), 'utf8'));
    const docs = raw.map((d) => reviveTypes(d));
    let indexSpecs = [];
    const idxPath = path.join(backupDir, `${collName}-indexes.json`);
    if (fs.existsSync(idxPath)) indexSpecs = JSON.parse(fs.readFileSync(idxPath, 'utf8'));

    const coll = db.collection(collName);
    await coll.drop().catch((e) => {
      if (e.codeName !== 'NamespaceNotFound') throw e;
      console.log('   Collection did not exist yet — fresh restore');
    });

    const BATCH = 500;
    for (let i = 0; i < docs.length; i += BATCH) {
      await coll.insertMany(docs.slice(i, i + BATCH), { ordered: false });
      process.stdout.write(`   Inserted ${Math.min(i + BATCH, docs.length)}/${docs.length}\r`);
    }
    process.stdout.write('\n');

    for (const spec of indexSpecs) {
      const opts = {};
      for (const k of ['unique', 'sparse', 'expireAfterSeconds', 'partialFilterExpression', 'name', 'default_language', 'weights', 'collation', 'wildcardProjection']) {
        if (spec[k] !== undefined) opts[k] = spec[k];
      }
      await coll.createIndex(spec.key, opts);
    }
    const finalCount = await coll.countDocuments({});
    if (finalCount !== docs.length) throw new Error(`Count mismatch after restore: ${finalCount}/${docs.length}`);
    console.log(`   Verified ${finalCount} docs | recreated ${indexSpecs.length} secondary indexes`);
  }
}

function loadSnapshot(dir, collName) {
  const snapPath = path.join(dir, `${collName}-snapshot.json`);
  const raw = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
  const idxPath = path.join(dir, `${collName}-indexes.json`);
  const indexSpecs = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : [];
  return { docs: raw.map((d) => reviveTypes(d)), indexSpecs };
}

/**
 * Resumable restore: insert ONE small chunk of snapshot docs whose _id is not
 * yet in the collection. Designed to always finish well under ~30s so it can
 * be driven safely from constrained runners, one call at a time.
 */
async function resumeRestoreChunk(db, backupDir, chunkSize) {
  const { docs } = loadSnapshot(backupDir, 'aggregatedproperties');
  const coll = db.collection('aggregatedproperties');
  const existingRows = await coll.find({}, { projection: { _id: 1 } }).toArray();
  const existing = new Set(existingRows.map((r) => String(r._id)));
  const missing = docs.filter((d) => !existing.has(String(d._id)));
  console.log(`Snapshot=${docs.length} | alreadyRestored=${existing.size} | missing=${missing.length}`);
  if (!missing.length) return { done: true, missing: 0 };

  const batch = missing.slice(0, chunkSize);
  await coll.insertMany(batch, { ordered: false });
  const remaining = Math.max(0, missing.length - batch.length);
  console.log(`Inserted ${batch.length} chunk | remaining=${remaining}`);
  return { done: remaining === 0, missing: remaining };
}

/** Idempotent finisher: recreate any missing secondary indexes + verify totals. */
async function finalizeRestore(db, backupDir) {
  const { docs, indexSpecs } = loadSnapshot(backupDir, 'aggregatedproperties');
  const coll = db.collection('aggregatedproperties');
  const have = new Set((await coll.listIndexes().toArray()).map((i) => i.name));
  let created = 0;
  for (const spec of indexSpecs) {
    if (have.has(spec.name)) continue;
    const opts = {};
    for (const k of ['unique', 'sparse', 'expireAfterSeconds', 'partialFilterExpression', 'name', 'default_language', 'weights', 'collation', 'wildcardProjection']) {
      if (spec[k] !== undefined) opts[k] = spec[k];
    }
    await coll.createIndex(spec.key, opts);
    created += 1;
  }
  const finalCount = await coll.countDocuments({});
  const [after] = await coll.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
  const ss = after.storageStats;
  console.log(`Docs verified: ${finalCount}/${docs.length}`);
  console.log(`Secondary indexes: ${Object.keys(ss.indexSizes || {}).length} total (${created} newly created this run)`);
  console.log(`Storage: ${(ss.size / 1048576).toFixed(2)} MB data | ${(ss.storageSize / 1048576).toFixed(2)} MB storage`);
  if (finalCount !== docs.length) throw new Error(`Final verification FAILED: ${finalCount}/${docs.length}`);
  console.log('FINAL VERIFICATION PASSED');
}




(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI missing in Backend/.env');
    process.exit(1);
  }

  const SPECIAL_MODE = args.some((a) =>
    ['--resume-restore', '--finalize-restore', '--restore-snapshot', '--rebuild'].includes(a)
  );
  if (!SPECIAL_MODE) {
    console.log(
      `Mode: ${EXECUTE ? (Number.isFinite(TARGET_MB) ? `EXECUTE (target ~${TARGET_MB} MB)` : 'EXECUTE (delete all candidates)') : 'ANALYZE (dry-run)'}`
    );
  }
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const conn = mongoose.connection;
  console.log(`MongoDB Connected: ${conn.host}`);

  const dbName = await discoverDbName(conn.client);
  if (!dbName) {
    console.error('Could not locate a database containing both target collections.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Using database: "${dbName}"`);
  const db = conn.useDb(dbName);

  const summary = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', 'no-image-cleanup', timestamp);
  let totalFreed = 0;
  let totalDeleted = 0;

  // ---- Resumable chunked restore (runner-safe, one small chunk per call) ----
  if (args.includes('--resume-restore')) {
    const rsIdx = args.indexOf('--resume-restore');
    const dir = args[rsIdx + 1];
    if (!dir || !fs.existsSync(dir)) throw new Error('Pass an existing snapshot dir');
    const chunkArg = args.find((a) => a.startsWith('--chunk='));
    const chunkSize = chunkArg ? parseInt(chunkArg.split('=')[1], 10) : 200;
    const r = await resumeRestoreChunk(db, dir, chunkSize);
    console.log(r.done ? 'RESTORE COMPLETE — run --finalize-restore next' : `MORE CHUNKS NEEDED (${r.missing} missing)`);
    await mongoose.disconnect();
    return;
  }
  if (args.includes('--finalize-restore')) {
    const rsIdx = args.indexOf('--finalize-restore');
    const dir = args[rsIdx + 1];
    if (!dir || !fs.existsSync(dir)) throw new Error('Pass an existing snapshot dir');
    await finalizeRestore(db, dir);
    await mongoose.disconnect();
    return;
  }

  // ---- Restore mode: recover docs+indexes after an interrupted rebuild ----
  if (args.includes('--restore-snapshot')) {
    const rsIdx = args.indexOf('--restore-snapshot');
    const dir = args[rsIdx + 1];
    if (!dir || !fs.existsSync(dir)) throw new Error('Pass an existing snapshot dir, e.g. backups/no-image-cleanup/<ts>');
    await restoreFromSnapshot(db, dir);
    console.log('\nRestore complete.');
    await mongoose.disconnect();
    return;
  }

  // ---- Rebuild mode: reclaim WiredTiger churn bloat (see README notes above) ----
  if (args.includes('--rebuild')) {
    let names = [];
    const rbIdx = args.indexOf('--rebuild');
    for (let i = rbIdx + 1; i < args.length && !args[i].startsWith('--'); i++) names.push(args[i]);
    if (!names.length) names = ['aggregatedproperties'];
    const report = [];
    for (const name of names) {
      const r = await rebuildCollection(db, name, backupDir);
      report.push(`   ${name}: ${(r.before / 1048576).toFixed(2)} MB -> ${(r.after / 1048576).toFixed(2)} MB`);
      totalFreed += r.before - r.after;
    }
    console.log('\n================ REBUILD SUMMARY ================');
    report.forEach((s) => console.log(s));
    console.log(`Total storage reclaimed ≈ ${fmtMB(totalFreed)} | snapshots in ${backupDir}`);
    await mongoose.disconnect();
    return;
  }

  for (const cfg of TARGETS) {
    console.log(`\n=== ${cfg.key} ("${cfg.collection}") ===`);
    const r = await collectCandidates(db, cfg);
    const avgAll = r.stats.count ? r.stats.size / r.stats.count : 0;
    console.log(`Collection: ${r.stats.count} docs | ${fmtMB(r.stats.size)} total | avg ${fmtKB(avgAll)} per doc`);

    if (!r.candidateIds.length) {
      console.log('Candidates WITHOUT proper images: 0 docs — nothing to do.');
      continue;
    }
    console.log(`Candidates WITHOUT proper images: ${r.candidateIds.length} docs | exact data size ${fmtMB(r.candidateBytesExact)}`);
    for (const [k, v] of Object.entries(r.breakdownCounts)) if (v) console.log(`   - ${k}: ${v}`);

    let toDelete = r.candidateIds;
    let toDeleteBytes = r.candidateBytesExact;

    if (!EXECUTE) {
      summary.push(`${cfg.collection}: would delete ${r.candidateIds.length} (~${fmtMB(r.candidateBytesExact)})`);
      continue;
    }

    fs.mkdirSync(backupDir, { recursive: true });

    // When a specific MB target is set, delete largest docs first and stop there
    if (Number.isFinite(TARGET_MB)) {
      const sized = new Map();
      for await (const d of r.coll.aggregate([
        { $match: { _id: { $in: toDelete } } },
        { $project: { bsonSize: { $bsonSize: '$$ROOT' } } },
      ])) {
        sized.set(String(d._id), d.bsonSize ?? 0);
      }
      toDelete.sort((a, b) => (sized.get(String(b)) ?? 0) - (sized.get(String(a)) ?? 0));
      const limitBytes = Math.max(0, TARGET_MB * 1024 * 1024 - totalFreed);
      const acc = [];
      let accBytes = 0;
      for (const id of toDelete) {
        if (accBytes >= limitBytes) break;
        acc.push(id);
        accBytes += sized.get(String(id)) ?? 0;
      }
      toDelete = acc;
      toDeleteBytes = accBytes;
      console.log(`Trimmed deletion set to ${toDelete.length} docs (~${fmtMB(toDeleteBytes)}) to approach ~${TARGET_MB} MB goal`);
    }

    if (!toDelete.length) continue;

    await backupDocs(r.coll, toDelete, backupDir, cfg.collection);

    let deleted = 0;
    const BATCH = 500;
    for (let i = 0; i < toDelete.length; i += BATCH) {
      const res = await r.coll.deleteMany({ _id: { $in: toDelete.slice(i, i + BATCH) } });
      deleted += res.deletedCount ?? 0;
      process.stdout.write(`   Deleting... ${deleted}/${toDelete.length}\r`);
    }
    process.stdout.write('\n');

    const after = await getStats(r.coll);
    console.log(`Deleted ${deleted} docs | collection now: ${after.count} docs, ${fmtMB(after.size)}`);
    totalFreed += toDeleteBytes;
    totalDeleted += deleted;
    summary.push(`${cfg.collection}: deleted ${deleted}/${r.candidateIds.length} candidates (~${fmtMB(toDeleteBytes)})`);
  }

  console.log('\n================ SUMMARY ================');
  summary.forEach((s) => console.log(` • ${s}`));
  if (EXECUTE) {
    console.log(`Total: ${totalDeleted} docs deleted | logical data removed ≈ ${fmtMB(totalFreed)}`);
    console.log(`Backups saved in: ${backupDir}`);
    console.log('Note: WiredTiger reuses freed space internally; OS disk usage may shrink only after compaction.');
  } else {
    console.log('Dry run only — nothing was modified. Re-run with --execute to apply.');
  }

  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  try {
    await mongoose.disconnect();
  } catch (_e) {}
  process.exit(1);
});

