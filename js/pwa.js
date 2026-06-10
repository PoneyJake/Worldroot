let deferredInstallPrompt = null;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

export function setupInstallPrompt(selector = '[data-install-app]') {
  const buttons = [...document.querySelectorAll(selector)];
  if (!buttons.length) return;

  const hideButtons = () => buttons.forEach((btn) => btn.classList.add('hidden'));
  const showButtons = () => buttons.forEach((btn) => btn.classList.remove('hidden'));

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showButtons();
  });

  for (const btn of buttons) {
    btn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      hideButtons();
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideButtons();
  });
}
