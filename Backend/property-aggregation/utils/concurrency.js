/**
 * Concurrency limiter (p-limit style).
 * Use to bound how many sources run in parallel during a scrape cycle.
 *
 * Example:
 *   const limit = createLimiter(4);
 *   await Promise.all(items.map(item => limit(() => doWork(item))));
 */
function createLimiter(concurrency = 4) {
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    concurrency = 1;
  }

  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= concurrency) return;
    const job = queue.shift();
    if (!job) return;
    active += 1;
    Promise.resolve()
      .then(job.fn)
      .then((res) => {
        active -= 1;
        job.resolve(res);
        next();
      })
      .catch((err) => {
        active -= 1;
        job.reject(err);
        next();
      });
  };

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

/**
 * Per-source semaphore. Each key gets at most `perKeyConcurrency` slots
 * in flight at the same time, on top of a global cap.
 *
 * Example:
 *   const sem = createSourceSemaphore({ global: 4, perKey: 1 });
 *   await sem.run('jiji', () => scrape());
 */
function createSourceSemaphore({ global = 4, perKey = 1 } = {}) {
  const globalLimiter = createLimiter(global);
  const perKeyLimiters = new Map();

  const getKeyLimiter = (key) => {
    let l = perKeyLimiters.get(key);
    if (!l) {
      l = createLimiter(perKey);
      perKeyLimiters.set(key, l);
    }
    return l;
  };

  return {
    run(key, fn) {
      return globalLimiter(() => getKeyLimiter(key)(fn));
    },
    stats() {
      const out = {};
      for (const k of perKeyLimiters.keys()) out[k] = perKeyLimiters.get(k)().length;
      return out;
    },
  };
}

module.exports = { createLimiter, createSourceSemaphore };
