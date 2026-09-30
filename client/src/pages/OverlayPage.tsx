import React, { useState, useEffect } from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface FloatingEmote {
  id: string;
  emote: string;
  x: number;
}

export const OverlayPage: React.FC<{ handle: string }> = ({ handle }) => {
  const [hypeScore, setHypeScore] = useState<number>(50);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [superThumbAlert, setSuperThumbAlert] = useState<any>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?handle=${handle}&role=overlay`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'initial_state':
            setHypeScore(data.hypeScore);
            setActivePoll(data.activePoll);
            break;
          case 'hype_update':
            setHypeScore(data.hypeScore);
            break;
          case 'poll_update':
            setActivePoll(data.poll);
            break;
          case 'emote_burst':
            setFloatingEmotes((prev) => [
              ...prev,
              { id: data.id, emote: data.emote, x: data.x },
            ]);
            setTimeout(() => {
              setFloatingEmotes((prev) => prev.filter((e) => e.id !== data.id));
            }, 1800);
            break;
          case 'new_chat':
            if (data.message.isSuperThumb) {
              setSuperThumbAlert(data.message);
              setTimeout(() => setSuperThumbAlert(null), 6000);
            }
            break;
        }
      } catch (e) {
        console.error('WS Overlay error', e);
      }
    };

    return () => socket.close();
  }, [handle]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'none',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Floating Emotes Layer */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: 0,
          right: 0,
          height: '400px',
        }}
      >
        {floatingEmotes.map((em) => (
          <div
            key={em.id}
            className="floating-emote"
            style={{
              left: `${em.x}%`,
              bottom: '20px',
              fontSize: '3rem',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))',
            }}
          >
            {em.emote}
          </div>
        ))}
      </div>

      {/* Super-Thumb Highlight Alert (Top Center) */}
      {superThumbAlert && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.95), rgba(255, 94, 58, 0.95))',
            boxShadow: '0 8px 32px rgba(255, 51, 102, 0.6)',
            borderRadius: '20px',
            padding: '16px 28px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            animation: 'hypePulse 0.5s ease',
            zIndex: 100,
          }}
        >
          <Sparkles size={28} />
          <div>
            <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800 }}>
              Super-Thumb (${(superThumbAlert.amountCents / 100).toFixed(2)}) from {superThumbAlert.sender}!
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
              "{superThumbAlert.text}"
            </div>
          </div>
        </div>
      )}

      {/* Live Hype Gauge on Screen (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
      >
        <Flame
          size={28}
          color="#FF0055"
          className={hypeScore > 70 ? 'hype-meter-active' : ''}
        />
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#94A3B8' }}>
            Audience Hype
          </div>
          <div
            style={{
              fontSize: '22px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: '#FFF',
            }}
          >
            {hypeScore}%
          </div>
        </div>

        {/* Mini progress bar */}
        <div
          style={{
            width: '120px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${hypeScore}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00FF88, #FF0055)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Live Poll Overlay Card (Bottom Right) */}
      {activePoll && activePoll.isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            width: '380px',
            background: 'rgba(7, 9, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00FF88',
                  boxShadow: '0 0 10px #00FF88',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#00FF88' }}>
                Live Stream Poll
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
              thumb.to/@{handle}
            </span>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: '#FFF' }}>
            {activePoll.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activePoll.options.map((opt: any) => {
              const pct = activePoll.totalVotes > 0 ? Math.round((opt.votes / activePoll.totalVotes) * 100) : 0;
              return (
                <div
                  key={opt.id}
                  style={{
                    position: 'relative',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.4), rgba(0, 240, 255, 0.6))',
                      transition: 'width 0.4s ease',
                    }}
                  />
                  <span style={{ position: 'relative', zIndex: 2, fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                    {opt.text}
                  </span>
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#00F0FF',
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
