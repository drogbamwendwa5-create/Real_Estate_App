/**
 * Detail Queue - Queue for processing property detail scraping.
 * Processes listing URLs to extract full property details.
 */
let Queue = null;
let QueueScheduler = null;
let connection = null;
let detailQueue = null;

try {
  const bull = require('bullmq');
  Queue = bull.Queue;
  QueueScheduler = bull.QueueScheduler;
  
  if (process.env.REDIS_URL) {
    connection = { url: process.env.REDIS_URL };
  } else if (process.env.REDIS_HOST) {
    connection = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    };
  }
} catch (e) {
  console.warn('[DetailQueue] BullMQ not available, using in-memory fallback');
}

class InMemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.processors = [];
    this.processed = 0;
    this.failed = 0;
  }

  async add(name, data, opts = {}) {
    this.jobs.push({ name, data, opts, id: Date.now().toString() });
    return { id: Date.now().toString() };
  }

  async process(processor) {
    this.processors.push(processor);
    this._startProcessing();
  }

  async _startProcessing() {
    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      try {
        for (const processor of this.processors) {
          await processor(job);
        }
        this.processed++;
      } catch (error) {
        this.failed++;
        console.error(`[InMemoryQueue:${this.name}] Job failed:`, error.message);
      }
    }
  }

  async getJobCounts() {
    return { waiting: this.jobs.length, active: 0, completed: this.processed, failed: this.failed, delayed: 0 };
  }

  async close() { this.jobs = []; this.processors = []; }
  async obliterate() { this.jobs = []; this.processed = 0; this.failed = 0; }
}

async function getQueue() {
  if (detailQueue) return detailQueue;
  if (Queue && connection) {
    try {
      detailQueue = new Queue('detail-queue', { connection });
      new QueueScheduler('detail-queue', { connection });
      return detailQueue;
    } catch (e) { console.warn('[DetailQueue] Redis unavailable, using in-memory'); }
  }
  detailQueue = new InMemoryQueue('detail-queue');
  return detailQueue;
}

async function addJob(data, opts = {}) {
  const queue = await getQueue();
  return await queue.add('process-detail', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, ...opts });
}

async function getJobCounts() { const q = await getQueue(); return await q.getJobCounts(); }
async function close() { if (detailQueue) { await detailQueue.close(); detailQueue = null; } }

module.exports = { getQueue, addJob, getJobCounts, close };