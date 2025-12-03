import React from 'react';

/**
 * Mobile Blocker component that displays a fullscreen message
 * preventing mobile and tablet users from accessing the desktop-only game
 */
const MobileBlocker: React.FC = () => {
  const blockerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d1117 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  };

  const contentStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '500px',
    width: '90%',
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '80px',
    marginBottom: '30px',
    display: 'block',
  };

  const titleStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: 700,
    margin: '0 0 20px 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  };

  const messageStyles: React.CSSProperties = {
    color: '#e6e6e6',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.6,
    margin: 0,
    opacity: 0.9,
  };

  return (
    <div style={blockerStyles}>
      <div style={contentStyles}>
        <div style={iconStyles}>🚫</div>
        <h1 style={titleStyles}>Desktop Only</h1>
        <p style={messageStyles}>
          This game version is only available on Desktop. Please open it on a PC or Laptop to play.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;