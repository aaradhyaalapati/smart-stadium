import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('renders user message', () => {
    render(<MessageBubble message={{ role: 'user', parts: [{ text: 'Hello' }] }} />);
    const bubble = screen.getByText('Hello');
    expect(bubble).toBeInTheDocument();
    expect(bubble.parentElement).toHaveClass('user');
  });

  it('renders assistant message', () => {
    render(<MessageBubble message={{ role: 'assistant', parts: [{ text: 'Hi there' }] }} />);
    const bubble = screen.getByText('Hi there');
    expect(bubble).toBeInTheDocument();
    expect(bubble.parentElement).toHaveClass('assistant');
  });
});
