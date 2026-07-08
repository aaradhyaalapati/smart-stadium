import { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const CAPACITY = 5; // max tokens
const REFILL_MS = 2000; // 1 token every 2 seconds
const MAX_IP_MAP_SIZE = 1000; // Limit to prevent unbound memory growth

// Expose state for testing via a getter if needed, but keep it isolated
export const rateLimitBuckets = new Map<string, Bucket>();

export function enforceRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!rateLimitBuckets.has(ip)) {
    // If the map is getting too large, proactively prune fully-refilled buckets
    if (rateLimitBuckets.size >= MAX_IP_MAP_SIZE) {
      for (const [key, bucket] of rateLimitBuckets.entries()) {
        const timePassed = now - bucket.lastRefill;
        const tokensToRefill = Math.floor(timePassed / REFILL_MS);
        if (bucket.tokens + tokensToRefill >= CAPACITY) {
          rateLimitBuckets.delete(key);
        }
      }
      // If still too large after prune, clear it all out (drastic measure under DDoS)
      if (rateLimitBuckets.size >= MAX_IP_MAP_SIZE) {
        rateLimitBuckets.clear();
      }
    }
    rateLimitBuckets.set(ip, { tokens: CAPACITY, lastRefill: now });
  }

  const bucket = rateLimitBuckets.get(ip)!;

  // Refill tokens based on time elapsed
  const timePassed = now - bucket.lastRefill;
  const tokensToRefill = Math.floor(timePassed / REFILL_MS);

  if (tokensToRefill > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToRefill);
    // Advance lastRefill by the exact interval amount to avoid floating drift
    bucket.lastRefill += tokensToRefill * REFILL_MS;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    next();
  } else {
    res.status(429).json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again shortly.' });
  }
}
