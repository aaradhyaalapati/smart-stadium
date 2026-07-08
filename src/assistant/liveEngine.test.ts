import { runLiveLoop } from './liveEngine';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
  SchemaType: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    ARRAY: 'ARRAY'
  }
}));

// Mock the execution of local tools
jest.mock('../tools/executeTool', () => ({
  executeTool: jest.fn().mockReturnValue({ test: 'data' })
}));

describe('liveEngine iteration loop', () => {
  it('resolves text when no function calls are returned', async () => {
    // Mock the GoogleGenerativeAI client
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        functionCalls: () => [],
        text: () => 'Final Answer',
        candidates: [{ content: { parts: [{ text: 'Final Answer' }] } }]
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    const res = await runLiveLoop('dummy-key', 'hello');
    expect(res).toBe('Final Answer');
  });

  it('executes tools and loops until text is returned', async () => {
    // Setup a sequence: First call returns a function call, Second returns text.
    let callCount = 0;
    const mockGenerateContent = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          response: {
            functionCalls: () => [{ name: 'getVenueInfo', args: { venueId: 'v-metlife' } }],
            text: () => '',
            candidates: [{ content: { parts: [{ functionCall: { name: 'getVenueInfo', args: { venueId: 'v-metlife' } } }] } }]
          }
        });
      } else {
        return Promise.resolve({
          response: {
            functionCalls: () => [],
            text: () => 'Final Answer after tool',
            candidates: [{ content: { parts: [{ text: 'Final Answer after tool' }] } }]
          }
        });
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    const res = await runLiveLoop('dummy-key', 'hello');
    expect(res).toBe('Final Answer after tool');
    expect(callCount).toBe(2);
  });

  it('throws ITERATION_CAP_EXCEEDED when returning functions indefinitely', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        functionCalls: () => [{ name: 'getVenueInfo', args: {} }],
        text: () => '',
        candidates: [{ content: { parts: [{ functionCall: { name: 'getVenueInfo', args: {} } }] } }]
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    await expect(runLiveLoop('dummy-key', 'hello')).rejects.toThrow('ITERATION_CAP_EXCEEDED');
  });
});
