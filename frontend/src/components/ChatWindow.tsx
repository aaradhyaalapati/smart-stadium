import React, { useState } from 'react';
import { type UseChatResult } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  chat: UseChatResult;
  profile: any;
}

export function ChatWindow({ chat, profile }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !chat.loading) {
      chat.sendMessage(inputText, profile);
      setInputText('');
    }
  };

  return (
    <section className="chat-window" aria-label="Chat Interface">
      <div 
        className="message-list" 
        role="status" 
        aria-live="polite" 
        aria-atomic="false"
        aria-relevant="additions"
      >
        {chat.messages.length === 0 && (
          <p className="empty-state">Start a conversation with the Smart Stadium Assistant.</p>
        )}
        {chat.messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {chat.loading && (
          <div className="message-bubble-container assistant loading">
            <div className="message-bubble" aria-label="Assistant is typing...">
              <span className="dot-typing" aria-hidden="true"></span>
            </div>
          </div>
        )}
        {chat.error && (
          <div className="error-message" role="alert">
            Error: {chat.error}
          </div>
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">Type your message</label>
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask about navigation, food, or assistance..."
          disabled={chat.loading}
          autoComplete="off"
        />
        <button type="submit" disabled={chat.loading || !inputText.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
