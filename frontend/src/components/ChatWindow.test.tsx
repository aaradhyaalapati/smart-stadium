import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from './ChatWindow';
import { vi } from 'vitest';

describe('ChatWindow', () => {
  it('renders empty state initially', () => {
    const chat = {
      messages: [],
      sendMessage: vi.fn(),
      loading: false,
      error: null,
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{}} />);
    expect(screen.getByText('Start a conversation with the Smart Stadium Assistant.')).toBeInTheDocument();
  });

  it('renders messages and does not show empty state', () => {
    const chat = {
      messages: [{ role: 'user', parts: [{ text: 'Hello' }] } as any],
      sendMessage: vi.fn(),
      loading: false,
      error: null,
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{}} />);
    expect(screen.queryByText('Start a conversation with the Smart Stadium Assistant.')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders loading indicator when loading', () => {
    const chat = {
      messages: [],
      sendMessage: vi.fn(),
      loading: true,
      error: null,
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{}} />);
    expect(screen.getByLabelText('Assistant is typing...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders error message when error exists', () => {
    const chat = {
      messages: [],
      sendMessage: vi.fn(),
      loading: false,
      error: 'Network error',
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error: Network error');
  });

  it('calls sendMessage when form is submitted with text', async () => {
    const sendMessage = vi.fn();
    const chat = {
      messages: [],
      sendMessage,
      loading: false,
      error: null,
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{ language: 'en' }} />);
    
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await user.type(input, 'Hello world');
    
    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);
    
    expect(sendMessage).toHaveBeenCalledWith('Hello world', { language: 'en' });
  });

  it('does not call sendMessage if input is empty', async () => {
    const sendMessage = vi.fn();
    const chat = {
      messages: [],
      sendMessage,
      loading: false,
      error: null,
      mode: null
    };
    render(<ChatWindow chat={chat} profile={{ language: 'en' }} />);
    
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /send/i });
    
    // Button is disabled when input is empty
    expect(button).toBeDisabled();
    
    // Typing spaces shouldn't enable it or send
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await user.type(input, '   ');
    expect(button).toBeDisabled();
  });
});
