import { useState, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  parts: { text?: string }[];
}

export interface UserProfile {
  language?: string;
  needs?: string[];
  venueId?: string;
}

export interface UseChatResult {
  messages: ChatMessage[];
  sendMessage: (text: string, profile: UserProfile) => Promise<void>;
  loading: boolean;
  error: string | null;
  mode: 'live' | 'offline' | null;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'offline' | null>(null);

  const sendMessage = useCallback(async (text: string, profile: UserProfile) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile,
          // Limit history to last 20 turns
          history: messages.slice(-20)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to send message');
      }

      setMode(data.mode);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        parts: [{ text: data.reply }]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  return { messages, sendMessage, loading, error, mode };
}
