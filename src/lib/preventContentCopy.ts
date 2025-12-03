/**
 * Content Protection Script
 * 
 * This script adds JavaScript-based protection to prevent:
 * - Right-click context menu
 * - Keyboard shortcuts for copying
 * - F12 developer tools
 * - Text selection
 * - Browser zoom
 * - Screen resizing
 */

export function setupContentProtection() {
  if (typeof window === 'undefined') return;

  // Prevent context menu (right-click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Prevent keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+S, Ctrl+U (view source), Ctrl+P (print)
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 's' || e.key === 'u' || e.key === 'p' || 
         e.key === 'c' || e.key === 'x' || e.key === 'i')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent F12 key (developer tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Prevent zoom shortcuts (Ctrl+ and Ctrl-)
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent zoom with mouse wheel
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
  
  // Prevent zoom with Ctrl+scroll on desktop
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // Disable selection on the document
  document.onselectstart = () => false;
  
  // Disable dragging of images
  document.querySelectorAll('img').forEach(img => {
    img.draggable = false;
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // Disable copy
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable cut
  document.addEventListener('cut', (e) => {
    e.preventDefault();
    return false;
  });

  // Prevent resizing
  window.addEventListener('resize', () => {
    // Force the window back to its original size if changed
    if (window.outerWidth !== window.innerWidth || 
        window.outerHeight !== window.innerHeight) {
      window.resizeTo(window.innerWidth, window.innerHeight);
    }
  });

  // Set viewport meta tag to prevent zoom
  const setViewportMeta = () => {
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
      viewportMeta = meta;
    }
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  };
  
  // Set the viewport meta when the page loads
  setViewportMeta();
  
  // Also set it after a slight delay to override any other scripts
  setTimeout(setViewportMeta, 500);

  // Warn when leaving the page
  window.addEventListener('beforeunload', (e) => {
    const message = 'Are you sure you want to leave?';
    e.returnValue = message;
    return message;
  });

  console.log('Content protection enabled with zoom prevention');
}