import request from 'supertest';
import express from 'express';
import { securityHeaders } from './securityHeaders';

const app = express();
app.use(securityHeaders);
app.get('/test', (req, res) => {
  res.send('ok');
});
app.get('/error', (req, res) => {
  res.status(500).send('error');
});

describe('securityHeaders middleware', () => {
  it('adds security headers to successful responses', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toBe("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['permissions-policy']).toBe('geolocation=(), microphone=(), camera=()');
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });

  it('adds security headers to error responses', async () => {
    const res = await request(app).get('/error');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
