import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HapticArcDialProps {
  creatorName: string;
  onTipSent?: (amount: number, message: string) => void;
}

const PRESET_AMOUNTS = [2, 5, 10, 25, 50];

export const HapticArcDial: React.FC<HapticArcDialProps> = ({ creatorName, onTipSent }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [supporterMessage, setSupporterMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tipSuccess, setTipSuccess] = useState<boolean>(false);

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    triggerHaptic('light');
  };

  const handleConfirmTip = () => {
    triggerHaptic('heavy');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setTipSuccess(true);
      triggerHaptic('success');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FF3366', '#00F0FF', '#00FF88', '#FFD700'],
      });

      onTipSent?.(selectedAmount, supporterMessage);

      setTimeout(() => {
        setTipSuccess(false);
        setSupporterMessage('');
      }, 4000);
    }, 700);
  };

  return (
    <div className="glass-panel" style={{ padding: '18px 16px', marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={18} color="#FF3366" fill="#FF3366" />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.2px' }}>
            Thumb to Tip
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Direct to {creatorName}
        </span>
      </div>

      {tipSuccess ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 0',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={44} color="#00FF88" />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#00FF88' }}>
            Tip Sent!
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Thank you for supporting {creatorName} ❤️
          </span>
        </div>
      ) : (
        <>
          {/* Preset Buttons arranged for effortless thumb reach */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt;
              return (
                <button
                  key={amt}
                  onClick={() => handleSelectAmount(amt)}
                  className="thumb-btn"
                  style={{
                    minHeight: '48px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 800,
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    border: isSelected ? '1px solid #FF3366' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? '0 4px 16px var(--accent-glow)' : 'none',
                  }}
                >
                  ${amt}
                </button>
              );
            })}
          </div>

          {/* Optional Message input */}
          <input
            type="text"
            placeholder="Add an encouraging note (optional)..."
            value={supporterMessage}
            onChange={(e) => setSupporterMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              marginBottom: '12px',
              outline: 'none',
            }}
          />

          {/* Big Thumb Action Button */}
          <button
            onClick={handleConfirmTip}
            disabled={isProcessing}
            className="thumb-btn thumb-btn-primary"
            style={{ width: '100%', fontSize: '16px' }}
          >
            <Sparkles size={18} />
            <span>
              {isProcessing ? 'Processing Apple/Google Pay...' : `Thumb to Tip $${selectedAmount}`}
            </span>
          </button>
        </>
      )}
    </div>
  );
};
