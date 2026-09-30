import React, { useState } from 'react';
import { triggerHaptic } from '../utils/haptics.js';
import {
  Tv,
  MessageSquare,
  Play,
  ShoppingBag,
  Music,
  Radio,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface RadialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  description?: string;
  badge?: string;
}

interface RadialThumbMenuProps {
  links: RadialLink[];
  creatorName: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  tv: <Tv size={22} />,
  'message-square': <MessageSquare size={22} />,
  play: <Play size={22} />,
  'shopping-bag': <ShoppingBag size={22} />,
  music: <Music size={22} />,
  radio: <Radio size={22} />,
  globe: <Globe size={22} />,
};

export const RadialThumbMenu: React.FC<RadialThumbMenuProps> = ({ links, creatorName }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [handMode, setHandMode] = useState<'right' | 'center' | 'left'>('right');

  const activeLink = links[activeIndex] || links[0];

  const handleSelect = (index: number) => {
    if (index !== activeIndex) {
      triggerHaptic('light');
      setActiveIndex(index);
    }
  };

  const handleOpenLink = (url: string) => {
    triggerHaptic('medium');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Calculate coordinates along an ergonomic thumb arc
  // Radius ~125px from pivot
  const getCoordinates = (index: number, total: number) => {
    const radius = 120;
    let startAngle = 0;
    let endAngle = 0;

    if (handMode === 'right') {
      // Arc sweeps from top to left (bottom-right origin)
      startAngle = Math.PI * 0.95; // ~170 deg (pointing left)
      endAngle = Math.PI * 1.55;  // ~280 deg (pointing up)
    } else if (handMode === 'left') {
      // Arc sweeps from top to right (bottom-left origin)
      startAngle = Math.PI * 1.45; // ~260 deg (pointing up)
      endAngle = Math.PI * 2.05;  // ~370 deg (pointing right)
    } else {
      // Centered fan (pointing upward)
      startAngle = Math.PI * 1.15;
      endAngle = Math.PI * 1.85;
    }

    const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
    const angle = startAngle + index * step;

    // Origin offset depending on handMode
    const originX = handMode === 'right' ? 240 : handMode === 'left' ? 60 : 150;
    const originY = 190;

    const x = originX + radius * Math.cos(angle);
    const y = originY + radius * Math.sin(angle);

    return { x, y };
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Handedness Switcher Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 4px',
          borderRadius: '20px',
          marginBottom: '10px',
        }}
      >
        <button
          onClick={() => {
            triggerHaptic('light');
            setHandMode('left');
          }}
          style={{
            background: handMode === 'left' ? 'var(--accent-primary)' : 'transparent',
            color: handMode === 'left' ? '#FFF' : 'var(--text-dim)',
            border: 'none',
            borderRadius: '16px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          👈 Left Thumb
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setHandMode('center');
          }}
          style={{
            background: handMode === 'center' ? 'var(--accent-primary)' : 'transparent',
            color: handMode === 'center' ? '#FFF' : 'var(--text-dim)',
            border: 'none',
            borderRadius: '16px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🎯 Fan
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setHandMode('right');
          }}
          style={{
            background: handMode === 'right' ? 'var(--accent-primary)' : 'transparent',
            color: handMode === 'right' ? '#FFF' : 'var(--text-dim)',
            border: 'none',
            borderRadius: '16px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Right Thumb 👉
        </button>
      </div>

      {/* Active Destination Preview Card */}
      {activeLink && (
        <div
          onClick={() => handleOpenLink(activeLink.url)}
          className="glass-panel"
          style={{
            width: '100%',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '1.5px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 240, 255, 0.15)',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, rgba(22, 28, 40, 0.9), rgba(15, 19, 28, 0.95))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
              }}
            >
              {ICON_MAP[activeLink.icon] || <Globe size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
                {activeLink.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Tap center to open · Curated by {creatorName}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            <span>GO</span>
            <ExternalLink size={14} />
          </div>
        </div>
      )}

      {/* The Radial Arc Stage */}
      <div
        style={{
          width: '300px',
          height: '210px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* SVG Arc Guide Track */}
        <svg
          width="300"
          height="210"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.2 }}
        >
          <path
            d={
              handMode === 'right'
                ? 'M 120 190 A 120 120 0 0 1 240 70'
                : handMode === 'left'
                ? 'M 60 70 A 120 120 0 0 1 180 190'
                : 'M 40 160 A 120 120 0 0 1 260 160'
            }
            fill="none"
            stroke="#00F0FF"
            strokeWidth="3"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Central Thumb Pivot Hub */}
        <div
          onClick={() => handleOpenLink(activeLink.url)}
          style={{
            position: 'absolute',
            left: handMode === 'right' ? '210px' : handMode === 'left' ? '30px' : '120px',
            top: '145px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF3366 0%, #FF0055 100%)',
            boxShadow: '0 0 24px rgba(255, 51, 102, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Sparkles size={20} color="#FFF" />
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase' }}>
            Thumb
          </span>
        </div>

        {/* Radial Satellite Buttons */}
        {links.map((link, idx) => {
          const { x, y } = getCoordinates(idx, links.length);
          const isSelected = activeIndex === idx;

          return (
            <button
              key={link.id}
              onClick={() => handleSelect(idx)}
              onPointerEnter={() => handleSelect(idx)}
              style={{
                position: 'absolute',
                left: `${x - 26}px`,
                top: `${y - 26}px`,
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isSelected
                  ? 'linear-gradient(135deg, #00F0FF 0%, #0088FF 100%)'
                  : 'var(--bg-surface-elevated)',
                border: isSelected
                  ? '2px solid #00F0FF'
                  : '1.5px solid var(--border-subtle)',
                color: isSelected ? '#000' : 'var(--text-main)',
                boxShadow: isSelected
                  ? '0 0 20px rgba(0, 240, 255, 0.6)'
                  : '0 4px 12px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                zIndex: isSelected ? 8 : 5,
              }}
              title={link.title}
            >
              {ICON_MAP[link.icon] || <Globe size={20} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
