import request from 'supertest';
import express from 'express';
import { apiRouter } from './routes';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => {
  return {
    SchemaType: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    },
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async ({ contents }) => {
            const userText = contents[contents.length - 1]?.parts[0]?.text || '';
            
            if (userText.includes('simulate failure')) {
              throw new Error('Simulated Gemini Failure [500]');
            }

            return {
              response: {
                functionCalls: () => [],
                text: () => 'Live response to: ' + userText,
                candidates: [{ content: { parts: [{ text: 'Live response to: ' + userText }] } }]
              }
            };
          })
        })
      };
    })
  };
});

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

describe('End-to-End API Path', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('End-to-end: offline fallback when API key missing', async () => {
    delete process.env.GEMINI_API_KEY;
    
    const payload = {
      message: 'Where is the bathroom?',
      profile: { venueId: 'v-metlife' }
    };
    
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('offline');
    expect(res.body.reply).toBeDefined();
  });

  it('End-to-end: offline fallback when AI fails', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const payload = {
      message: 'simulate failure',
      profile: { venueId: 'v-metlife' }
    };
    
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('offline');
    expect(res.body.reply).toContain('I am not sure how to help with that');
  });

  it('End-to-end: live success path with mocked Gemini client', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const payload = {
      message: 'Hello AI',
      profile: { venueId: 'v-metlife' }
    };
    
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('live');
    expect(res.body.reply).toBe('Live response to: Hello AI');
  });
});
