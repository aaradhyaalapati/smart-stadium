import { useState } from 'react';
import { useChat, type UserProfile } from './hooks/useChat';
import { ProfileSelector } from './components/ProfileSelector';
import { ChatWindow } from './components/ChatWindow';
import { ModeIndicator } from './components/ModeIndicator';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>({
    language: 'en',
    needs: [],
    venueId: ''
  });

  const chat = useChat();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Smart Stadium Assistant</h1>
        <ModeIndicator mode={chat.mode} />
      </header>
      
      <main className="main-content">
        <aside className="sidebar">
          <ProfileSelector profile={profile} onChange={setProfile} />
        </aside>
        
        <div className="chat-area">
          <ChatWindow chat={chat} profile={profile} />
        </div>
      </main>
    </div>
  );
}
