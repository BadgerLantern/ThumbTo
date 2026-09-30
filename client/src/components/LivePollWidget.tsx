import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import { BarChart3, Check } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
}

interface LivePollWidgetProps {
  poll: PollData | null;
  onVote: (optionId: number) => void;
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = ({ poll, onVote }) => {
  const [votedOptionId, setVotedOptionId] = useState<number | null>(null);

  if (!poll) {
    return (
      <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <BarChart3 size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
        <div style={{ fontSize: '14px', fontWeight: 600 }}>No Active Poll Right Now</div>
        <div style={{ fontSize: '12px' }}>The creator will launch flash polls live on stream!</div>
      </div>
    );
  }

  const handleVote = (optionId: number) => {
    if (votedOptionId !== null) return; // Prevent double voting
    setVotedOptionId(optionId);
    triggerHaptic('success');
    onVote(optionId);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 8px #00FF88',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#00FF88' }}>
            Live Flash Poll
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {poll.totalVotes} votes
        </span>
      </div>

      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', lineHeight: 1.35 }}>
        {poll.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {poll.options.map((opt) => {
          const isVoted = votedOptionId === opt.id;
          const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={votedOptionId !== null}
              className="thumb-btn"
              style={{
                position: 'relative',
                justifyContent: 'space-between',
                padding: '0 16px',
                minHeight: '52px',
                overflow: 'hidden',
                border: isVoted ? '1.5px solid #00F0FF' : '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
              }}
            >
              {/* Percentage bar fill */}
              {votedOptionId !== null && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    background: isVoted ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    zIndex: 1,
                  }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                {isVoted && <Check size={16} color="#00F0FF" />}
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{opt.text}</span>
              </div>

              {votedOptionId !== null && (
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    zIndex: 2,
                    color: isVoted ? '#00F0FF' : 'var(--text-muted)',
                  }}
                >
                  {percentage}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
