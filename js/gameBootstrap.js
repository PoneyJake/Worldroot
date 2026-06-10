import { initAuth, getDisplayName, signOut } from './auth.js';
import {
  loadCloudSave, scheduleCloudSave, flushCloudSave, initCloudSyncListeners,
  flushCloudSaveOnExit, uploadCloudSave, downloadCloudSave,
} from './cloudSave.js';
import { fetchLeaderboardTop, syncLeaderboard } from './leaderboard.js';
import { registerServiceWorker } from './pwa.js';
import { initMobileGameLayout } from './mobile.js';

const PLAY_MODE_KEY = 'worldroot_play_mode';

function patchSaveForCloud() {
  const orig = window.WorldrootState.saveState;
  window.WorldrootState.saveState = (state, opts) => {
    orig(state, opts);
    if (window.WorldrootSession?.isCloud && opts?.touchCloud !== false) {
      scheduleCloudSave();
    }
  };
}

async function boot() {
  window.WorldrootLeaderboard = { fetchTop: fetchLeaderboardTop, sync: syncLeaderboard };
  registerServiceWorker();
  initMobileGameLayout();
  try {
    const mode = sessionStorage.getItem(PLAY_MODE_KEY);
    const { user } = await initAuth();

    if (!mode && !user) {
      window.__worldrootReleaseBoot?.();
      window.location.href = 'index.html';
      return;
    }
    if (mode === 'cloud' && !user) {
      window.__worldrootReleaseBoot?.();
      window.location.href = 'index.html';
      return;
    }

    const isCloud = Boolean(user) && mode !== 'offline';
    window.WorldrootSession = {
      isCloud,
      isOffline: !isCloud,
      userId: user?.id ?? null,
      displayName: isCloud ? getDisplayName() : 'Offline',
    };
    window.WorldrootState.setPlayMode(isCloud ? 'cloud' : 'offline');

    if (isCloud) {
      await loadCloudSave();
      patchSaveForCloud();
      initCloudSyncListeners();
      await syncLeaderboard();
    }

    window.WorldrootCloud = {
      scheduleCloudSave,
      flushCloudSave,
      flush: flushCloudSave,
      flushOnExit: flushCloudSaveOnExit,
      upload: uploadCloudSave,
      download: downloadCloudSave,
    };
  } catch (err) {
    console.warn('Cloud sync unavailable:', err);
  } finally {
    window.__worldrootReleaseBoot?.();
    if (window.WorldrootSession?.isCloud) {
      window.WorldrootUI?.refresh?.();
      window.WorldrootUI?.setSessionBadge?.(window.WorldrootSession);
    }
  }
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
