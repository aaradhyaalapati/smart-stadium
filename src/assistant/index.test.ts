import { answer } from './index';
import * as liveEngine from './liveEngine';
import * as offlineEngine from '../offline/engine';

// Define a simple mock structure that mimics the part of GoogleGenerativeAI we use
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({})
      };
    }),
    SchemaType: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY'
    }
  };
});

describe('assistant index', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to offline if GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    expect(res.answer).toContain('Welcome to the FIFA World Cup'); // The offline engine's greeting
  });

  it('returns live answer on success', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockResolvedValue('Live response text');
    const res = await answer('hello', {});
    expect(res.mode).toBe('live');
    expect(res.answer).toBe('Live response text');
    jest.restoreAllMocks();
  });

  it('falls back on 401 error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('[401] Unauthorized'));
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });

  it('falls back on 503 error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('Server returned 503 Service Unavailable'));
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });

  it('falls back on timeout', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('TIMEOUT exceeded'));
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });
  
  it('falls back on iteration cap error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('ITERATION_CAP_EXCEEDED'));
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });

  it('re-throws on 400 error', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('[400] Bad Request'));
    await expect(answer('hello', {})).rejects.toThrow('[400] Bad Request');
    jest.restoreAllMocks();
  });

  it('re-throws on unexpected errors', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    // Use an error that does not match fallback status or timeout keywords
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(new Error('Something random blew up'));
    await expect(answer('hello', {})).rejects.toThrow('Something random blew up');
    jest.restoreAllMocks();
  });

  it('handles error.status explicitly', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const err: any = new Error('Not found');
    err.status = 404;
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue(err);
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });

  it('handles errors without a message property', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    jest.spyOn(liveEngine, 'runLiveLoop').mockRejectedValue('TIMEOUT exceeded');
    const res = await answer('hello', {});
    expect(res.mode).toBe('offline');
    jest.restoreAllMocks();
  });
});
