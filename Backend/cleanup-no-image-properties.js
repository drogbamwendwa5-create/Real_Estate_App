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

async function discoverDbName(db) {
  const admin = db.admin();
  const { databases } = await admin.listDatabases();
  for (const info of databases) {
    if (['admin', 'local', 'config'].includes(info.name)) continue;
    const names = (await db.getSiblingDB(info.name).listCollections().toArray()).map((c) => c.name);
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
    [{ $match: { $or } }, { $project: { [cfg.imageField]: 1 } }],
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

// ==== MAIN RUNNER ====
