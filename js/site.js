import {
  initAuth,
  signIn,
  signUp,
  signOut,
  getDisplayName,
  consumeAuthUrlErrors,
} from './auth.js';
import { isCloudEnabled } from './cloudConfig.js';
import { flushCloudSave } from './cloudSave.js';
import { registerServiceWorker, setupInstallPrompt } from './pwa.js';

const PLAY_MODE_KEY = 'worldroot_play_mode';

const SCREENS = ['home', 'login', 'register'];

function showScreen(name) {
  for (const id of SCREENS) {
    document.getElementById(`screen-${id}`)?.classList.toggle('hidden', id !== name);
  }
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

function hideErrors() {
  showError('login-error', '');
  showError('register-error', '');
  document.getElementById('register-success')?.classList.add('hidden');
}

function updateAuthUi({ user, cloud }) {
  const statusEl = document.getElementById('auth-status');
  const loggedOut = document.getElementById('menu-logged-out');
  const loggedIn = document.getElementById('menu-logged-in');
  const usernameEl = document.getElementById('menu-username');

  if (statusEl) {
    statusEl.classList.remove('hidden', 'cloud-on', 'cloud-off');
    if (!cloud) {
      statusEl.textContent = 'Cloud saves not configured — use Play offline, or add Supabase keys.';
      statusEl.classList.add('cloud-off');
    } else {
      statusEl.textContent = 'Cloud saves enabled — log in to sync progress.';
      statusEl.classList.add('cloud-on');
    }
  }

  if (user) {
    loggedOut?.classList.add('hidden');
    loggedIn?.classList.remove('hidden');
    if (usernameEl) usernameEl.textContent = getDisplayName();
  } else {
    loggedOut?.classList.remove('hidden');
    loggedIn?.classList.add('hidden');
  }
}

async function goToGame(mode) {
  sessionStorage.setItem(PLAY_MODE_KEY, mode);
  window.location.href = 'game.html';
}

async function boot() {
  registerServiceWorker();
  setupInstallPrompt();
  hideErrors();
  showScreen('home');

  const { user, cloud, urlError } = await initAuth();
  updateAuthUi({ user, cloud });

  if (urlError) {
    showScreen('login');
    showError('login-error', urlError);
  }

  document.getElementById('btn-login')?.addEventListener('click', () => {
    hideErrors();
    showScreen('login');
  });

  document.getElementById('btn-register')?.addEventListener('click', () => {
    hideErrors();
    showScreen('register');
  });

  document.getElementById('btn-login-back')?.addEventListener('click', () => {
    hideErrors();
    showScreen('home');
  });

  document.getElementById('btn-register-back')?.addEventListener('click', () => {
    hideErrors();
    showScreen('home');
  });

  document.getElementById('btn-play-offline')?.addEventListener('click', () => {
    goToGame('offline');
  });

  document.getElementById('btn-play')?.addEventListener('click', () => {
    goToGame('cloud');
  });

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await flushCloudSave();
    await signOut();
    sessionStorage.removeItem(PLAY_MODE_KEY);
    updateAuthUi({ user: null, cloud: isCloudEnabled() });
    showScreen('home');
  });

  document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErrors();
    const id = document.getElementById('login-identifier')?.value ?? '';
    const pw = document.getElementById('login-password')?.value ?? '';
    try {
      await signIn(id, pw);
      sessionStorage.setItem(PLAY_MODE_KEY, 'cloud');
      updateAuthUi({ user: (await initAuth()).user, cloud: isCloudEnabled() });
      showScreen('home');
    } catch (err) {
      showError('login-error', err.message || 'Login failed.');
    }
  });

  document.getElementById('form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErrors();
    const email = document.getElementById('register-email')?.value ?? '';
    const username = document.getElementById('register-username')?.value ?? '';
    const pw = document.getElementById('register-password')?.value ?? '';
    const pw2 = document.getElementById('register-password2')?.value ?? '';

    if (pw !== pw2) {
      showError('register-error', 'Passwords do not match.');
      return;
    }

    try {
      const result = await signUp(email, username, pw);
      if (result.needsEmailConfirm) {
        const ok = document.getElementById('register-success');
        if (ok) {
          ok.textContent = result.message;
          ok.classList.remove('hidden');
        }
        return;
      }
      sessionStorage.setItem(PLAY_MODE_KEY, 'cloud');
      updateAuthUi({ user: result.user, cloud: isCloudEnabled() });
      showScreen('home');
    } catch (err) {
      showError('register-error', err.message || 'Registration failed.');
    }
  });
}

boot();
