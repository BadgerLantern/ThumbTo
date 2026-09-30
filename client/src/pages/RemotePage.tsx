import React, { useState, useEffect, useRef } from 'react';
import { HapticArcDial } from '../components/HapticArcDial.js';
import { LiveHypeGauge } from '../components/LiveHypeGauge.js';
import { LivePollWidget } from '../components/LivePollWidget.js';
import { ThumbChatDock, ChatMessage } from '../components/ThumbChatDock.js';
import { triggerHaptic } from '../utils/haptics.js';
import { Radio, ExternalLink, ShieldCheck } from 'lucide-react';

interface FloatingEmote {
  id: string;
  emote: string;
  x: number;
}

export const RemotePage: React.FC<{ handle: string }> = ({ handle }) => {
  const [creator, setCreator] = useState<any>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [hypeScore, setHypeScore] = useState<number>(45);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [viewerCount, setViewerCount] = useState<number>(1);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch creator data
  useEffect(() => {
    fetch(`/api/creators/${handle}`)
      .then((res) => res.json())
      .then((data) => {
        setCreator(data);
        setIsLiveMode(data.isLive);
      })
      .catch((err) => console.error('Failed to load creator', err));
  }, [handle]);

  // Connect to real-time WebSockets
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?handle=${handle}&role=viewer`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'initial_state':
            setHypeScore(data.hypeScore);
            setActivePoll(data.activePoll);
            setChatMessages(data.recentChat || []);
            setViewerCount(data.viewerCount || 1);
            if (data.isLive !== undefined) setIsLiveMode(data.isLive);
            break;
          case 'hype_update':
            setHypeScore(data.hypeScore);
            break;
          case 'poll_update':
            setActivePoll(data.poll);
            break;
          case 'new_chat':
            setChatMessages((prev) => [...prev, data.message]);
            break;
          case 'emote_burst':
            setFloatingEmotes((prev) => [
              ...prev,
              { id: data.id, emote: data.emote, x: data.x },
            ]);
            setTimeout(() => {
              setFloatingEmotes((prev) => prev.filter((e) => e.id !== data.id));
            }, 1600);
            break;
          case 'viewer_count_update':
            setViewerCount(data.viewerCount);
            break;
          case 'live_status_update':
            setIsLiveMode(data.isLive);
            break;
        }
      } catch (e) {
        console.error('WS message error', e);
      }
    };

    return () => {
      socket.close();
    };
  }, [handle]);

  const handleHypeTap = (intensity: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'hype_tap', intensity }));
  };

  const handleVote = (optionId: number) => {
    wsRef.current?.send(JSON.stringify({ type: 'cast_vote', optionId }));
  };

  const handleSendChat = (text: string) => {
    wsRef.current?.send(
      JSON.stringify({
        type: 'chat_message',
        sender: 'You',
        text,
      })
    );
  };

  const handleSendEmote = (emote: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'emote_burst', emote }));
  };

  const handleTipSent = (amount: number, message: string) => {
    fetch(`/api/creators/${handle}/tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountCents: amount * 100,
        supporterName: 'Thumb Supporter',
        message,
        isSuperThumb: isLiveMode,
      }),
    });
  };

  if (!creator) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading thumb remote...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Floating Emote Overlay Container */}
      <div
        style={{
          position: 'absolute',
          bottom: '220px',
          left: 0,
          right: 0,
          height: '240px',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 99,
        }}
      >
        {floatingEmotes.map((em) => (
          <div key={em.id} className="floating-emote" style={{ left: `${em.x}%`, bottom: '10px' }}>
            {em.emote}
          </div>
        ))}
      </div>

      {/* Top 40% Glance Zone */}
      <div className="glance-zone">
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '14px',
                color: 'var(--accent-primary)',
              }}
            >
              thumb.to
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/@{creator.handle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {creator.isLive ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 0, 85, 0.15)',
                  border: '1px solid rgba(255, 0, 85, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FF0055',
                }}
              >
                <Radio size={12} className="hype-meter-active" />
                LIVE ({viewerCount})
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* Creator Identity Hero */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-subtle)',
              }}
            />
            {creator.isLive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#00FF88',
                  border: '2px solid var(--bg-primary)',
                }}
              />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                {creator.displayName}
              </h1>
              <ShieldCheck size={16} color="#00F0FF" />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              {creator.bio}
            </p>
          </div>
        </div>

        {/* Mode Switcher Segmented Pill */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-surface-elevated)',
            padding: '3px',
            borderRadius: '12px',
            marginBottom: '14px',
          }}
        >
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsLiveMode(true);
            }}
            style={{
              padding: '8px 0',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              background: isLiveMode ? 'var(--accent-primary)' : 'transparent',
              color: isLiveMode ? '#FFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            ⚡ LIVE STREAM REMOTE
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsLiveMode(false);
            }}
            style={{
              padding: '8px 0',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              background: !isLiveMode ? 'var(--accent-primary)' : 'transparent',
              color: !isLiveMode ? '#FFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            BIO & LINKS
          </button>
        </div>

        {/* Content depending on Mode */}
        {isLiveMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <LivePollWidget poll={activePoll} onVote={handleVote} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {creator.links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="thumb-btn"
                style={{
                  textDecoration: 'none',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                }}
              >
                <span>{link.title}</span>
                <ExternalLink size={16} color="var(--text-muted)" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom 60% Active Thumb Zone */}
      <div className="thumb-zone">
        {isLiveMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <LiveHypeGauge score={hypeScore} onHypeTap={handleHypeTap} />
            <ThumbChatDock
              chatMessages={chatMessages}
              onSendMessage={handleSendChat}
              onSendEmote={handleSendEmote}
            />
          </div>
        ) : (
          <HapticArcDial creatorName={creator.displayName} onTipSent={handleTipSent} />
        )}
      </div>
    </div>
  );
};
