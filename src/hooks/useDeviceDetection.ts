/**
 * Simple device detection function that doesn't use React hooks
 * to avoid hooks rules violations on mobile devices
 */
export const detectDevice = () => {
  // Server-side rendering check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth || screen.width;

  // Check for mobile devices via user agent
  const mobilePatterns = [
    /android/,
    /webos/,
    /iphone/,
    /ipod/,
    /blackberry/,
    /windows phone/,
    /mobile/,
    /opera mini/,
    /iemobile/
  ];

  // Check for tablet-specific patterns
  const tabletPatterns = [
    /ipad/,
    /android(?!.*mobile)/,
    /tablet/,
    /kindle/,
    /silk/,
    /playbook/
  ];

  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  const isTabletUA = tabletPatterns.some(pattern => pattern.test(userAgent));

  // Screen size checks
  const isMobileScreen = screenWidth <= 768;
  const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;

  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  // Final determination
  const isMobile = isMobileUA || (isMobileScreen && isTouchDevice);
  const isTablet = isTabletUA || (isTabletScreen && isTouchDevice && !isMobile);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};