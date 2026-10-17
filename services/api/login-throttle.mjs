import { createHash } from 'node:crypto';
import { deployedRouting } from './routing.mjs';

// Single API process in the approved runtime. A multi-process deployment needs a shared store.
export function loginThrottle() {
  const buckets = new Map();
  return (req, email) => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (now - bucket.start >= 60_000) buckets.delete(key);
    const address = deployedRouting() ? req.ingressClientAddress : req.socket.remoteAddress;
    if (!address)
      throw Object.assign(new Error('Trusted client address required'), { status: 421 });
    const route = req.serviceRoute?.hostname ?? req.baseUrl + req.path;
    const identity = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
    const keys = [
      JSON.stringify([route, 'client', address]),
      JSON.stringify([route, 'identity', identity]),
    ];
    // Reject new buckets at capacity rather than evicting a live limit under attacker churn.
    if (buckets.size + keys.filter((key) => !buckets.has(key)).length > 10000)
      throw Object.assign(new Error('Sign-in temporarily unavailable'), { status: 503 });
    const values = keys.map((key) => {
      const bucket = buckets.get(key) ?? { start: now, count: 0 };
      buckets.set(key, bucket);
      return bucket;
    });
    if (values.some((bucket) => bucket.count >= 20))
      throw Object.assign(new Error('Too many sign-in attempts. Try again in a minute.'), {
        status: 429,
      });
    for (const bucket of values) bucket.count++;
  };
}
