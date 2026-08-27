/**
 * Listing Queue - Queue for processing listing URLs from scrapers.
 * Uses BullMQ for Redis-backed queue management.
 * Falls back to in-memory queue if Redis is not available.
 */
let Queue = null;
let QueueScheduler = null;
let connection = null;
let listingQueue = null;

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
  console.warn('[ListingQueue] BullMQ not available, using in-memory fallback');
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
    return {
      waiting: this.jobs.length,
      active: 0,
      completed: this.processed,
      failed: this.failed,
      delayed: 0
    };
  }

  async close() {
    this.jobs = [];
    this.processors = [];
  }

  async obliterate() {
    this.jobs = [];
    this.processed = 0;
    this.failed = 0;
  }
}

async function getQueue() {
  if (listingQueue) return listingQueue;

  if (Queue && connection) {
    try {
      listingQueue = new Queue('listing-queue', { connection });
      // BullMQ v5 removed QueueScheduler; guard for API compatibility
      if (typeof QueueScheduler === 'function') {
        const scheduler = new QueueScheduler('listing-queue', { connection });
        void scheduler;
      }
      console.log('[ListingQueue] BullMQ queue initialized');
      return listingQueue;
    } catch (e) {
      console.warn('[ListingQueue] Failed to connect to Redis, using in-memory:', e.message);
    }
  }

  listingQueue = new InMemoryQueue('listing-queue');
  console.log('[ListingQueue] Using in-memory queue');
  return listingQueue;
}

async function addJob(data, opts = {}) {
  const queue = await getQueue();
  return await queue.add('process-listing', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
    ...opts
  });
}

async function getJobCounts() {
  const queue = await getQueue();
  return await queue.getJobCounts();
}

async function close() {
  if (listingQueue) {
    await listingQueue.close();
    listingQueue = null;
  }
}

module.exports = {
  getQueue,
  addJob,
  getJobCounts,
  close
};