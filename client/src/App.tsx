import React, { useState, useEffect } from 'react';
import { RemotePage } from './pages/RemotePage.js';
import { OverlayPage } from './pages/OverlayPage.js';
import { CreatorStudio } from './pages/CreatorStudio.js';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Route: /overlay/@handle or /overlay/handle
  if (currentPath.startsWith('/overlay')) {
    const parts = currentPath.split('/');
    const rawHandle = parts[2] || 'alex';
    const handle = rawHandle.replace(/^@/, '');
    return <OverlayPage handle={handle} />;
  }

  // Route: /studio
  if (currentPath.startsWith('/studio')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DemoNav currentPath={currentPath} onNavigate={navigate} />
        <CreatorStudio handle="alex" />
      </div>
    );
  }

  // Default Route: /@handle or root /
  const handleMatch = currentPath.match(/^\/@?([a-zA-Z0-9_-]+)/);
  const handle = handleMatch ? handleMatch[1] : 'alex';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DemoNav currentPath={currentPath} onNavigate={navigate} />
      <RemotePage handle={handle} />
    </div>
  );
};

const DemoNav: React.FC<{ currentPath: string; onNavigate: (path: string) => void }> = ({
  currentPath,
  onNavigate,
}) => {
  return (
    <div
      style={{
        background: '#040609',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '11px',
        zIndex: 1000,
      }}
    >
      <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>PREVIEW:</span>
      <button
        onClick={() => onNavigate('/@alex')}
        style={{
          background: !currentPath.startsWith('/studio') ? 'var(--bg-surface-elevated)' : 'transparent',
          color: !currentPath.startsWith('/studio') ? '#00FF88' : 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '3px 8px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        📱 Fan Mobile Remote
      </button>
      <button
        onClick={() => onNavigate('/studio')}
        style={{
          background: currentPath.startsWith('/studio') ? 'var(--bg-surface-elevated)' : 'transparent',
          color: currentPath.startsWith('/studio') ? '#00F0FF' : 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '3px 8px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        🎛️ Creator Studio
      </button>
      <a
        href="/overlay/@alex"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#FF0055',
          textDecoration: 'none',
          padding: '3px 8px',
          fontWeight: 700,
          border: '1px solid rgba(255, 0, 85, 0.3)',
          borderRadius: '6px',
        }}
      >
        📺 Open OBS Overlay ↗
      </a>
    </div>
  );
};
