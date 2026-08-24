/**
 * Per-source circuit breaker.
 *
 * Tracks consecutive failures per source. After `failureThreshold` consecutive
 * failures the breaker opens and rejects calls for `cooldownMs`. After cooldown
 * a single trial request is allowed (HALF_OPEN). Success closes it again.
 *
 * State transitions:
 *   CLOSED    -> failures >= threshold       -> OPEN
 *   OPEN      -> cooldownMs elapsed          -> HALF_OPEN
 *   HALF_OPEN -> next request fails          -> OPEN (reset cooldown)
 *   HALF_OPEN -> next request succeeds       -> CLOSED (reset counters)
 *
 * Use:
 *   const breakers = createBreakerRegistry({ failureThreshold: 5, cooldownMs: 5*60_000 });
 *   try {
 *     await breakers.run('property24', () => fetch(...));
 *   } catch (e) {
 *     // breaker open OR underlying error
 *   }
 */
function createBreaker({
  failureThreshold = 5,
  cooldownMs = 5 * 60 * 1000,
  isFailure = defaultIsFailure,
  now = Date.now,
} = {}) {
  let state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
  let consecutiveFailures = 0;
  let openedAt = 0;

  const canRequest = () => {
    if (state === 'CLOSED') return true;
    if (state === 'OPEN') {
      if (now() - openedAt >= cooldownMs) {
        state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    // HALF_OPEN: allow exactly one trial at a time
    return true;
  };

  const recordSuccess = () => {
    state = 'CLOSED';
    consecutiveFailures = 0;
  };

  const recordFailure = () => {
    consecutiveFailures += 1;
    if (state === 'HALF_OPEN' || consecutiveFailures >= failureThreshold) {
      state = 'OPEN';
      openedAt = now();
    }
  };

  return {
    get state() {
      return state;
    },
    get consecutiveFailures() {
      return consecutiveFailures;
    },
    async run(fn) {
      if (!canRequest()) {
        const err = new Error('Circuit breaker is OPEN');
        err.code = 'CIRCUIT_OPEN';
        throw err;
      }
      try {
        const res = await fn();
        recordSuccess();
        return res;
      } catch (err) {
        if (isFailure(err)) recordFailure();
        else recordSuccess();
        throw err;
      }
    },
    reset() {
      state = 'CLOSED';
      consecutiveFailures = 0;
      openedAt = 0;
    },
    snapshot() {
      return {
        state,
        consecutiveFailures,
        openedAt: openedAt ? new Date(openedAt).toISOString() : null,
      };
    },
  };
}

function defaultIsFailure(err) {
  // Only count real failures, not user-input/parsing issues
  if (!err) return false;
  if (err.code === 'CIRCUIT_OPEN') return false;
  if (err.code === 'PARSER_ERROR') return false;
  if (err.code === 'VALIDATION_ERROR') return false;
  return true;
}

function createBreakerRegistry(opts = {}) {
  const breakers = new Map();

  const get = (key) => {
    let b = breakers.get(key);
    if (!b) {
      b = createBreaker(opts);
      breakers.set(key, b);
    }
    return b;
  };

  return {
    run(key, fn) {
      return get(key).run(fn);
    },
    get,
    snapshot() {
      const out = {};
      for (const [k, b] of breakers.entries()) out[k] = b.snapshot();
      return out;
    },
    reset(key) {
      const b = breakers.get(key);
      if (b) b.reset();
    },
  };
}

module.exports = { createBreaker, createBreakerRegistry };
