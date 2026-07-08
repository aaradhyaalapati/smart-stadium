import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from './App';
import * as useChatModule from './hooks/useChat';
import { vi } from 'vitest';

vi.mock('./hooks/useChat', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useChat: vi.fn()
  };
});

describe('App Accessibility and Integration', () => {
  it('should have no critical accessibility violations initially', async () => {
    vi.mocked(useChatModule.useChat).mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      loading: false,
      error: null,
      mode: null
    });

    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ModeIndicator accurately displays the mode from useChat', () => {
    vi.mocked(useChatModule.useChat).mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      loading: false,
      error: null,
      mode: 'offline'
    });

    render(<App />);
    expect(screen.getByText('Offline Fallback Mode')).toBeInTheDocument();
  });

  it('message list announces new messages via aria-live', () => {
    vi.mocked(useChatModule.useChat).mockReturnValue({
      messages: [
        { role: 'assistant', parts: [{ text: 'Hello, how can I help you?' }] }
      ],
      sendMessage: vi.fn(),
      loading: false,
      error: null,
      mode: 'live'
    });

    render(<App />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Hello, how can I help you?');
  });

  it('submitting a message calls sendMessage', async () => {
    const user = userEvent.setup();
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    
    vi.mocked(useChatModule.useChat).mockReturnValue({
      messages: [],
      sendMessage: sendMessageMock,
      loading: false,
      error: null,
      mode: null
    });

    render(<App />);
    
    // Type in chat input
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await user.type(input, 'Where is the bathroom?');
    
    // Submit form
    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);
    
    // Check if sendMessage was called with expected profile payload
    expect(sendMessageMock).toHaveBeenCalledWith('Where is the bathroom?', {
      language: 'en',
      needs: [],
      venueId: ''
    });
  });
});
