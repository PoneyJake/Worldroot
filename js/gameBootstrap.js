import { initAuth, getCurrentUser, getDisplayName, signOut } from './auth.js';
import { loadCloudSave, scheduleCloudSave, flushCloudSave } from './cloudSave.js';

const PLAY_MODE_KEY = 'worldroot_play_mode';

function patchSaveForCloud() {
  const orig = window.WorldrootState.saveState;
  window.WorldrootState.saveState = (state) => {
    orig(state);
    if (window.WorldrootSession?.isCloud) {
      scheduleCloudSave();
    }
  };
}

function startGameLoop() {
  const C = window.WorldrootConfig;
  const S = window.WorldrootState;
  const E = window.WorldrootEngine;
  const UI = window.WorldrootUI;

  const state = S.loadState();
  UI.init(state);

  if (window.WorldrootSession) {
    UI.setSessionBadge(window.WorldrootSession);
  }

  if (!state.characters.length) {
    UI.addLog('Welcome to Worldroot. Choose your first class.');
  } else {
    UI.addLog('Welcome back to Worldroot.');
  }

  setInterval(() => {
    E.tick(UI.getState());
    S.refreshPendingSlot(UI.getState());
    UI.refresh();
  }, C.TICK_MS);

  window.addEventListener('beforeunload', () => {
    S.saveState(UI.getState());
    if (window.WorldrootSession?.isCloud) {
      flushCloudSave();
    }
  });
}

async function boot() {
  const mode = sessionStorage.getItem(PLAY_MODE_KEY);
  const { user } = await initAuth();

  if (!mode && !user) {
    window.location.href = 'index.html';
    return;
  }

  if (mode === 'cloud' && !user) {
    window.location.href = 'index.html';
    return;
  }

  const isCloud = Boolean(user) && mode !== 'offline';
  window.WorldrootSession = {
    isCloud,
    isOffline: !isCloud,
    displayName: isCloud ? getDisplayName() : 'Offline',
  };

  window.WorldrootState.setPlayMode(isCloud ? 'cloud' : 'offline');

  if (isCloud) {
    await loadCloudSave();
    patchSaveForCloud();
  }

  window.WorldrootCloud = { scheduleCloudSave, flushCloudSave, flush: flushCloudSave };

  startGameLoop();
}

window.WorldrootGoMenu = async () => {
  if (window.WorldrootSession?.isCloud) {
    await flushCloudSave();
    await signOut();
  }
  sessionStorage.removeItem(PLAY_MODE_KEY);
  window.location.href = 'index.html';
};

boot();
