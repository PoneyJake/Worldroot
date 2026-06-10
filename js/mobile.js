/** Phone-only helpers: forced landscape when held upright + optional orientation lock. */

const FLIP_KEY = 'worldroot_landscape_flip';

function isTouchPhone() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function getLandscapeFlip() {
  const v = localStorage.getItem(FLIP_KEY);
  return v === 'cw' ? 'cw' : 'ccw';
}

export function setLandscapeFlip(mode) {
  localStorage.setItem(FLIP_KEY, mode === 'cw' ? 'cw' : 'ccw');
  syncPhoneViewport();
}

export function isTouchPhoneDevice() {
  return isTouchPhone();
}

function syncPhoneViewport() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const vw = Math.round(vv?.width ?? window.innerWidth);
  const vh = Math.round(vv?.height ?? window.innerHeight);
  const portrait = vh > vw;
  const flip = getLandscapeFlip();

  root.classList.toggle('force-landscape', portrait);
  root.classList.toggle('flip-cw', flip === 'cw');
  root.classList.toggle('flip-ccw', flip === 'ccw');

  if (portrait) {
    root.style.setProperty('--game-w', `${vh}px`);
    root.style.setProperty('--game-h', `${vw}px`);
    root.style.setProperty('--game-rotate', flip === 'cw' ? '90deg' : '-90deg');
  } else {
    root.style.setProperty('--game-w', `${vw}px`);
    root.style.setProperty('--game-h', `${vh}px`);
    root.style.setProperty('--game-rotate', '0deg');
  }
}

export function initMobileGameLayout() {
  if (!isTouchPhone()) return;

  document.documentElement.classList.add('touch-phone');
  syncPhoneViewport();

  window.WorldrootMobile = {
    getLandscapeFlip,
    setLandscapeFlip,
    isTouchPhoneDevice,
    syncPhoneViewport,
  };

  const lockLandscape = () => {
    const flip = getLandscapeFlip();
    const type = flip === 'cw' ? 'landscape-primary' : 'landscape-secondary';
    screen.orientation?.lock?.(type).catch(() => {
      screen.orientation?.lock?.('landscape').catch(() => {});
    });
  };

  const onViewportChange = () => {
    syncPhoneViewport();
    if (window.innerWidth > window.innerHeight) lockLandscape();
  };

  document.addEventListener('pointerdown', lockLandscape, { once: true });
  window.addEventListener('orientationchange', () => setTimeout(onViewportChange, 100));
  window.addEventListener('resize', onViewportChange);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportChange);
    window.visualViewport.addEventListener('scroll', onViewportChange);
  }
}
