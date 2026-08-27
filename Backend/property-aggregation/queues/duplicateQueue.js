/**
 * Duplicate Queue - Queue for processing duplicate property detection.
 */
let Queue = null, QueueScheduler = null, connection = null, duplicateQueue = null;
try {
  const bull = require('bullmq');
  Queue = bull.Queue; QueueScheduler = bull.QueueScheduler;
  if (process.env.REDIS_URL) connection = { url: process.env.REDIS_URL };
  else if (process.env.REDIS_HOST) connection = { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT || '6379'), password: process.env.REDIS_PASSWORD };
} catch (e) { console.warn('[DuplicateQueue] BullMQ not available'); }
class InMemoryQueue {
  constructor(name) { this.name = name; this.jobs = []; this.processors = []; this.processed = 0; this.failed = 0; }
  async add(name, data, opts = {}) { this.jobs.push({ name, data, opts, id: Date.now().toString() }); return { id: Date.now().toString() }; }
  async process(processor) { this.processors.push(processor); this._startProcessing(); }
  async _startProcessing() { while (this.jobs.length > 0) { const job = this.jobs.shift(); try { for (const p of this.processors) await p(job); this.processed++; } catch (e) { this.failed++; } } }
  async getJobCounts() { return { waiting: this.jobs.length, active: 0, completed: this.processed, failed: this.failed, delayed: 0 }; }
  async close() { this.jobs = []; this.processors = []; }
  async obliterate() { this.jobs = []; this.processed = 0; this.failed = 0; }
}
async function getQueue() {
  if (duplicateQueue) return duplicateQueue;
  if (Queue && connection) { try { duplicateQueue = new Queue('duplicate-queue', { connection }); if (typeof QueueScheduler === 'function') new QueueScheduler('duplicate-queue', { connection }); return duplicateQueue; } catch (e) {} }
  duplicateQueue = new InMemoryQueue('duplicate-queue'); return duplicateQueue;
}
async function addJob(data, opts = {}) { const q = await getQueue(); return await q.add('process-duplicate', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, ...opts }); }
async function getJobCounts() { const q = await getQueue(); return await q.getJobCounts(); }
async function close() { if (duplicateQueue) { await duplicateQueue.close(); duplicateQueue = null; } }
module.exports = { getQueue, addJob, getJobCounts, close };