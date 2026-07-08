import request from 'supertest';
import express from 'express';
import { enforceRateLimit, rateLimitBuckets } from './rateLimit';

const app = express();
app.use(express.json());
app.post('/test', enforceRateLimit, (req, res) => {
  res.json({ ok: true });
});

describe('rateLimit middleware', () => {
  beforeEach(() => {
    rateLimitBuckets.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows requests within capacity and returns 429 when exhausted', async () => {
    // Capacity is 5
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/test');
      expect(res.status).toBe(200);
    }
    // 6th request should fail
    const failRes = await request(app).post('/test');
    expect(failRes.status).toBe(429);
    expect(failRes.body.error).toBe('Too Many Requests');
  });

  it('refills tokens over time', async () => {
    // Exhaust tokens
    for (let i = 0; i < 5; i++) {
      await request(app).post('/test');
    }
    
    // Attempt fails
    let res = await request(app).post('/test');
    expect(res.status).toBe(429);

    // Advance time by 2.1 seconds (should refill 1 token)
    jest.advanceTimersByTime(2100);

    // One attempt should succeed now
    res = await request(app).post('/test');
    expect(res.status).toBe(200);

    // Immediately after, it should fail again
    res = await request(app).post('/test');
    expect(res.status).toBe(429);
  });

  it('prunes fully refilled buckets when map exceeds max size', async () => {
    // Simulate map exceeding threshold
    for (let i = 0; i < 1000; i++) {
      rateLimitBuckets.set(`ip-${i}`, { tokens: 5, lastRefill: Date.now() - 50000 }); // Very old, fully refilled
    }
    expect(rateLimitBuckets.size).toBe(1000);

    // Trigger prune with a new request
    await request(app).post('/test');

    // Expected: the old fully refilled ones were pruned, leaving only the newly added request's IP
    expect(rateLimitBuckets.size).toBe(1);
  });
  
  it('clears all buckets if pruning fails to reduce size under threshold', async () => {
    for (let i = 0; i < 1000; i++) {
      // These have 0 tokens and were refilled just now, so they won't be pruned in the first pass
      rateLimitBuckets.set(`ip-${i}`, { tokens: 0, lastRefill: Date.now() }); 
    }
    
    await request(app).post('/test');
    
    // Since none could be pruned gently, it does a hard clear and adds the new one
    expect(rateLimitBuckets.size).toBe(1);
  });

  it('handles missing ip gracefully', () => {
    const req = { connection: {} } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn();
    enforceRateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(rateLimitBuckets.has('unknown')).toBe(true);
  });
});
