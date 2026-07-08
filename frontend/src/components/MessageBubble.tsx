import { type ChatMessage } from '../hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const text = message.parts.map(p => p.text).join('');

  return (
    <div className={`message-bubble-container ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-bubble">
        {text}
      </div>
    </div>
  );
}
