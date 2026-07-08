import request from 'supertest';
import express from 'express';
import { apiRouter } from './routes';
import { securityHeaders } from '../middleware/securityHeaders';
import { answer } from '../assistant';

// Mock the assistant answer so we don't call real AI/tools
jest.mock('../assistant', () => ({
  answer: jest.fn()
}));

const app = express();
app.use(express.json());
app.use(securityHeaders);
app.use('/api', apiRouter);

describe('API Routes', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (answer as jest.Mock).mockResolvedValue({ mode: 'live', answer: 'Mock reply' });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('GET /api/healthz returns live when key is present', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    expect(res.body.llm).toBe('live');
    expect(res.body.status).toBe('ok');
    expect(res.headers['content-security-policy']).toBeDefined(); // verify headers
  });

  it('GET /api/healthz returns offline when key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    expect(res.body.llm).toBe('offline');
  });

  it('GET /api/venues lists all venues', async () => {
    const res = await request(app).get('/api/venues');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/venues/search finds venues by query', async () => {
    const res = await request(app).get('/api/venues/search?q=metlife');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toContain('MetLife');
  });

  it('GET /api/venues/search returns empty for no query', async () => {
    const res = await request(app).get('/api/venues/search');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/venues/:id returns venue by id', async () => {
    const res = await request(app).get('/api/venues/v-azteca');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Estadio Azteca');
  });

  it('GET /api/venues/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/venues/v-fake');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Venue not found');
  });

  it('POST /api/chat responds successfully with valid payload', async () => {
    const payload = {
      message: 'Hello',
      profile: { venueId: 'v-metlife' }
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Mock reply');
    expect(res.body.mode).toBe('live');
    expect(res.body.venueId).toBe('v-metlife');
  });

  it('POST /api/chat rejects unknown fields via strict schema', async () => {
    const payload = {
      message: 'Hello',
      profile: { venueId: 'v-metlife' },
      maliciousField: 'exploit'
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(400);
    console.log(res.body);
    expect(res.body.error).toBe('Invalid request payload');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
    expect(res.body.details[0]).toContain('maliciousField');
  });

  it('POST /api/chat rejects empty message', async () => {
    const payload = {
      message: '',
      profile: { venueId: 'v-metlife' }
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toContain('message');
  });

  it('POST /api/chat handles custom error with errors array', async () => {
    (answer as jest.Mock).mockRejectedValueOnce({ 
      errors: [
        { message: 'Custom error without path' },
        { path: ['my', 'field'], message: 'Custom error with path' }
      ] 
    });
    
    const payload = {
      message: 'Crash',
      profile: {}
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toBe('unknown: Custom error without path');
    expect(res.body.details[1]).toBe('my.field: Custom error with path');
  });

  it('POST /api/chat handles generic backend errors cleanly', async () => {
    (answer as jest.Mock).mockRejectedValueOnce(new Error('Internal explosion'));
    
    const payload = {
      message: 'Crash',
      profile: {}
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});
