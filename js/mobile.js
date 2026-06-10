/** Phone-only helpers: forced landscape when held upright + optional orientation lock. */

function isTouchPhone() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function syncPhoneViewport() {
  const root = document.documentElement;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const portrait = h > w;
  const longSide = Math.max(w, h);
  const shortSide = Math.min(w, h);

  root.style.setProperty('--phone-long', `${longSide}px`);
  root.style.setProperty('--phone-short', `${shortSide}px`);
  root.classList.toggle('force-landscape', portrait);
}

export function initMobileGameLayout() {
  if (!isTouchPhone()) return;

  document.documentElement.classList.add('touch-phone');
  syncPhoneViewport();

  const lockLandscape = () => {
    screen.orientation?.lock?.('landscape').catch(() => {});
  };

  const onViewportChange = () => {
    syncPhoneViewport();
    if (window.innerWidth > window.innerHeight) lockLandscape();
  };

  document.addEventListener('pointerdown', lockLandscape, { once: true });
  window.addEventListener('orientationchange', () => setTimeout(onViewportChange, 50));
  window.addEventListener('resize', onViewportChange);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportChange);
  }
}
