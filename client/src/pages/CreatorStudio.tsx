import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import { Radio, BarChart2, Copy, Check, ExternalLink, Zap } from 'lucide-react';

export const CreatorStudio: React.FC<{ handle: string }> = ({ handle }) => {
  const [isLive, setIsLive] = useState<boolean>(true);
  const [copiedOverlay, setCopiedOverlay] = useState<boolean>(false);
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [option1, setOption1] = useState<string>('');
  const [option2, setOption2] = useState<string>('');
  const [activePoll, setActivePoll] = useState<any>(null);
  const [hypeScore, setHypeScore] = useState<number>(50);
  const [viewerCount, setViewerCount] = useState<number>(1);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?handle=${handle}&role=creator`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'initial_state') {
          setIsLive(data.isLive);
          setActivePoll(data.activePoll);
          setHypeScore(data.hypeScore);
          setViewerCount(data.viewerCount);
        } else if (data.type === 'poll_update') {
          setActivePoll(data.poll);
        } else if (data.type === 'hype_update') {
          setHypeScore(data.hypeScore);
        } else if (data.type === 'viewer_count_update') {
          setViewerCount(data.viewerCount);
        }
      } catch (e) {
        console.error('Creator socket error', e);
      }
    };

    return () => socket.close();
  }, [handle]);

  const toggleLiveStatus = () => {
    triggerHaptic('medium');
    const next = !isLive;
    setIsLive(next);
    wsRef.current?.send(JSON.stringify({ type: 'toggle_live', isLive: next }));
  };

  const handleLaunchPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !option1.trim() || !option2.trim()) return;
    triggerHaptic('heavy');

    wsRef.current?.send(
      JSON.stringify({
        type: 'create_poll',
        question: pollQuestion,
        options: [option1, option2],
      })
    );

    setPollQuestion('');
    setOption1('');
    setOption2('');
  };

  const handleClosePoll = () => {
    triggerHaptic('medium');
    wsRef.current?.send(JSON.stringify({ type: 'close_poll' }));
  };

  const copyOverlayUrl = () => {
    triggerHaptic('success');
    const url = `${window.location.origin}/overlay/@${handle}`;
    navigator.clipboard.writeText(url);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2500);
  };

  return (
    <div className="app-container" style={{ padding: '20px 16px', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 800 }}>THUMB.TO STUDIO</span>
          <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Creator Control Cockpit</h1>
        </div>
        <a
          href={`/@${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="thumb-btn"
          style={{ minHeight: '38px', padding: '0 12px', fontSize: '12px' }}
        >
          <span>Open Remote</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Live Status Toggle Card */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderLeft: isLive ? '4px solid #FF0055' : '4px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isLive ? 'rgba(255, 0, 85, 0.15)' : 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio size={20} color={isLive ? '#FF0055' : 'var(--text-muted)'} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>
              {isLive ? 'Stream Mode is LIVE' : 'Stream Mode is OFFLINE'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isLive ? `${viewerCount} viewer(s) connected to remote` : 'Fans see your standard bio card'}
            </div>
          </div>
        </div>

        <button
          onClick={toggleLiveStatus}
          className="thumb-btn"
          style={{
            minHeight: '42px',
            padding: '0 18px',
            background: isLive ? '#FF0055' : 'var(--bg-surface-elevated)',
            color: '#FFF',
          }}
        >
          {isLive ? 'End Live' : 'Go Live'}
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Hype Meter
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#00F0FF', marginTop: '4px' }}>
            {hypeScore}%
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Live Viewers
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#00FF88', marginTop: '4px' }}>
            {viewerCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Tips Received
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FF3366', marginTop: '4px' }}>
            $45.00
          </div>
        </div>
      </div>

      {/* OBS Overlay Source Link */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>
          OBS / Streamlabs Browser Source
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
          Add as a transparent 1920x1080 browser source in OBS to show live hype meter, flash polls, and floating emotes!
        </p>

        <button
          onClick={copyOverlayUrl}
          className="thumb-btn"
          style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-surface-elevated)' }}
        >
          {copiedOverlay ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
          <span>{copiedOverlay ? 'Copied to Clipboard!' : 'Copy OBS Browser Source URL'}</span>
        </button>
      </div>

      {/* Flash Poll Launcher */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={18} color="#00F0FF" />
          <span style={{ fontSize: '15px', fontWeight: 800 }}>Launch Flash Poll</span>
        </div>

        {activePoll && activePoll.isActive ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#00FF88' }}>
              Active Poll: "{activePoll.question}"
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total votes cast: {activePoll.totalVotes}
            </div>
            <button
              onClick={handleClosePoll}
              className="thumb-btn"
              style={{ background: '#FF4B4B', color: '#FFF' }}
            >
              Close Current Poll
            </button>
          </div>
        ) : (
          <form onSubmit={handleLaunchPoll} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Poll Question (e.g. Which hero next?)"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '13px',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                placeholder="Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                }}
              />
              <input
                type="text"
                placeholder="Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                }}
              />
            </div>

            <button type="submit" className="thumb-btn thumb-btn-primary">
              <Zap size={16} />
              <span>Launch Flash Poll to All Viewers</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
