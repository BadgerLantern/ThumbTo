import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import { Flame, Zap } from 'lucide-react';

interface LiveHypeGaugeProps {
  score: number;
  onHypeTap: (intensity: number) => void;
}

export const LiveHypeGauge: React.FC<LiveHypeGaugeProps> = ({ score, onHypeTap }) => {
  const [combo, setCombo] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  const handleTap = () => {
    triggerHaptic('heavy');
    setCombo((c) => Math.min(c + 1, 99));
    onHypeTap(combo > 5 ? 3 : 1);

    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);
  };

  const getHypeColor = (s: number) => {
    if (s > 80) return '#FF0055';
    if (s > 50) return '#FF8800';
    if (s > 25) return '#00F0FF';
    return '#00FF88';
  };

  const color = getHypeColor(score);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={18} color={color} />
          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Stream Hype
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          {combo > 0 ? `🔥 ${combo}x Combo` : 'Tap to Pump'}
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div
        style={{
          width: '100%',
          height: '14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(score, 5), 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, #00FF88, ${color})`,
            borderRadius: '10px',
            transition: 'width 0.25s ease-out, background 0.3s ease',
            boxShadow: `0 0 16px ${color}`,
          }}
        />
      </div>

      {/* Giant Tactile Hype Button */}
      <button
        onClick={handleTap}
        className="thumb-btn"
        style={{
          width: '100%',
          minHeight: '64px',
          borderRadius: '18px',
          background: isPressing
            ? `radial-gradient(circle, ${color} 0%, rgba(22, 28, 40, 0.9) 100%)`
            : 'var(--bg-surface-elevated)',
          border: `2px solid ${isPressing ? color : 'var(--border-subtle)'}`,
          transform: isPressing ? 'scale(0.96)' : 'scale(1)',
          boxShadow: score > 75 ? `0 0 24px ${color}55` : 'none',
        }}
      >
        <Zap size={22} color={color} fill={score > 50 ? color : 'none'} />
        <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
          PUMP THE HYPE ({score}%)
        </span>
      </button>
    </div>
  );
};
