/** Phone-only helpers: landscape lock and layout class. */

function isTouchPhone() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function initMobileGameLayout() {
  if (!isTouchPhone()) return;

  document.documentElement.classList.add('touch-phone');

  const lockLandscape = () => {
    screen.orientation?.lock?.('landscape').catch(() => {});
  };

  document.addEventListener('pointerdown', lockLandscape, { once: true });
  window.addEventListener('orientationchange', () => {
    if (window.matchMedia('(orientation: landscape)').matches) lockLandscape();
  });
}
