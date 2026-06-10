let deferredInstallPrompt = null;

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  return {
    isFirefox: /firefox/i.test(ua),
    isChrome: /chrome/i.test(ua) && !/edg/i.test(ua),
    isEdge: /edg/i.test(ua),
    isSafari: /safari/i.test(ua) && !/chrome/i.test(ua),
    isIOS: /iphone|ipad|ipod/i.test(ua),
    isAndroid: /android/i.test(ua),
  };
}

function installInstructions(browser) {
  if (browser.isIOS && browser.isSafari) {
    return {
      title: 'Install on iPhone / iPad',
      html: '<ol><li>Tap the <strong>Share</strong> button in Safari</li><li>Choose <strong>Add to Home Screen</strong></li><li>Tap <strong>Add</strong></li></ol>',
      showButton: false,
    };
  }
  if (browser.isFirefox && browser.isAndroid) {
    return {
      title: 'Install on Android (Firefox)',
      html: '<ol><li>Tap the <strong>menu</strong> (☰) in the top right</li><li>Tap <strong>Install</strong> or <strong>Add to Home screen</strong></li></ol>',
      showButton: false,
    };
  }
  if (browser.isFirefox) {
    return {
      title: 'Install on Firefox (desktop)',
      html: '<p>Firefox on desktop does not support installing web apps yet. For a one-click install, open this site in <strong>Chrome</strong> or <strong>Edge</strong>.</p><p>On Android Firefox, use the browser menu → <strong>Install</strong> or <strong>Add to Home screen</strong>.</p>',
      showButton: false,
    };
  }
  if (browser.isSafari) {
    return {
      title: 'Install on Mac (Safari)',
      html: '<p>In Safari, use <strong>File → Add to Dock</strong> (macOS Sonoma or later), or bookmark this page for quick access.</p>',
      showButton: false,
    };
  }
  if (browser.isChrome || browser.isEdge) {
    return {
      title: 'Install Worldroot',
      html: '<p>Click <strong>Install app</strong> below, or use the install icon in your browser address bar.</p>',
      showButton: true,
    };
  }
  return {
    title: 'Install Worldroot',
    html: '<p>Use your browser menu to <strong>Install app</strong> or <strong>Add to Home screen</strong>. Chrome and Edge on desktop support one-click install.</p>',
    showButton: false,
  };
}

export function setupInstallPanel(panelId = 'install-app-panel') {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  if (isStandalone()) {
    panel.classList.add('hidden');
    return;
  }

  const titleEl = panel.querySelector('[data-install-title]');
  const stepsEl = panel.querySelector('[data-install-steps]');
  const btn = panel.querySelector('[data-install-app]');
  const browser = detectBrowser();
  const info = installInstructions(browser);

  if (titleEl) titleEl.textContent = info.title;
  if (stepsEl) stepsEl.innerHTML = info.html;

  const hideButton = () => btn?.classList.add('hidden');
  const showButton = () => btn?.classList.remove('hidden');

  if (!info.showButton) hideButton();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (titleEl) titleEl.textContent = 'Install Worldroot';
    if (stepsEl) {
      stepsEl.innerHTML = '<p>Click <strong>Install app</strong> to add Worldroot to your device.</p>';
    }
    showButton();
  });

  btn?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    hideButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    panel.classList.add('hidden');
  });
}

/** @deprecated use setupInstallPanel */
export function setupInstallPrompt(selector = '[data-install-app]') {
  setupInstallPanel();
}
