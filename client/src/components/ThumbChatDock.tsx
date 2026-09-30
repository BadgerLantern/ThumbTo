import React, { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import { Send } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSuperThumb?: boolean;
  amountCents?: number;
}

interface ThumbChatDockProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
}

const QUICK_EMOTES = ['🔥', '💀', '👀', '❤️', '🎉', '⚡'];

export const ThumbChatDock: React.FC<ThumbChatDockProps> = ({
  chatMessages,
  onSendMessage,
  onSendEmote,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    triggerHaptic('medium');
    onSendMessage(inputText);
    setInputText('');
  };

  const handleEmoteClick = (emote: string) => {
    triggerHaptic('light');
    onSendEmote(emote);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Recent Chat Feed */}
      <div
        className="glass-panel"
        style={{
          maxHeight: '140px',
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {chatMessages.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
            Stream chat is quiet. Be the first to say hi! 👋
          </div>
        ) : (
          chatMessages.slice(-15).map((msg) => (
            <div
              key={msg.id}
              style={{
                fontSize: '12px',
                lineHeight: 1.4,
                padding: msg.isSuperThumb ? '6px 8px' : '2px 0',
                borderRadius: msg.isSuperThumb ? '8px' : '0',
                background: msg.isSuperThumb ? 'rgba(255, 51, 102, 0.15)' : 'transparent',
                borderLeft: msg.isSuperThumb ? '3px solid var(--accent-primary)' : 'none',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: msg.isSuperThumb ? '#FF3366' : '#94A3B8',
                  marginRight: '6px',
                }}
              >
                {msg.sender}:
              </span>
              <span style={{ color: msg.isSuperThumb ? '#FFF' : 'var(--text-main)' }}>{msg.text}</span>
              {msg.isSuperThumb && msg.amountCents && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: '#FF3366',
                    color: '#FFF',
                  }}
                >
                  ${(msg.amountCents / 100).toFixed(2)}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Emote Reactions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '6px',
        }}
      >
        {QUICK_EMOTES.map((em) => (
          <button
            key={em}
            onClick={() => handleEmoteClick(em)}
            className="thumb-btn"
            style={{
              flex: 1,
              minHeight: '44px',
              fontSize: '20px',
              borderRadius: '12px',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            {em}
          </button>
        ))}
      </div>

      {/* Chat Input form */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a thumb message..."
          style={{
            flex: 1,
            minHeight: '48px',
            padding: '0 16px',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="thumb-btn thumb-btn-primary"
          style={{ minHeight: '48px', minWidth: '48px', padding: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
