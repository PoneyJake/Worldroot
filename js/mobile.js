/** Phone-only helpers: forced landscape layout and optional orientation lock. */

function isTouchPhone() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function syncPhoneOrientationClass() {
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  document.documentElement.classList.toggle('touch-phone-portrait', portrait);
}

export function initMobileGameLayout() {
  if (!isTouchPhone()) return;

  document.documentElement.classList.add('touch-phone');
  syncPhoneOrientationClass();

  const lockLandscape = () => {
    screen.orientation?.lock?.('landscape').catch(() => {});
  };

  document.addEventListener('pointerdown', lockLandscape, { once: true });
  window.addEventListener('orientationchange', () => {
    syncPhoneOrientationClass();
    if (window.matchMedia('(orientation: landscape)').matches) lockLandscape();
  });
  window.addEventListener('resize', syncPhoneOrientationClass);
}
