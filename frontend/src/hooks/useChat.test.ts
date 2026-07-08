import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

import { vi } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

describe('useChat hook', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mode).toBeNull();
  });

  it('sends message and updates state on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mode: 'live', reply: 'Test reply' })
    });

    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello', { language: 'en' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mode).toBe('live');
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({ role: 'user', parts: [{ text: 'Hello' }] });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', parts: [{ text: 'Test reply' }] });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"message":"Hello"')
    }));
  });

  it('handles empty message', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('   ', { language: 'en' });
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('handles API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid request' })
    });

    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello', { language: 'en' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invalid request');
    expect(result.current.messages).toHaveLength(1); // User message was added
  });

  it('handles API error with message instead of error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Different error format' })
    });

    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello', { language: 'en' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Different error format');
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello', { language: 'en' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });
});
