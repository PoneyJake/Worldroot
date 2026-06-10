import { initAuth, getDisplayName, signOut } from './auth.js';
import { loadCloudSave, scheduleCloudSave, flushCloudSave } from './cloudSave.js';
import { fetchLeaderboardTop, syncLeaderboard } from './leaderboard.js';
import { registerServiceWorker } from './pwa.js';

const PLAY_MODE_KEY = 'worldroot_play_mode';

function patchSaveForCloud() {
  const orig = window.WorldrootState.saveState;
  window.WorldrootState.saveState = (state) => {
    orig(state);
    if (window.WorldrootSession?.isCloud) scheduleCloudSave();
  };
}

async function boot() {
  registerServiceWorker();
  try {
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
      userId: user?.id ?? null,
      displayName: isCloud ? getDisplayName() : 'Offline',
    };
    window.WorldrootState.setPlayMode(isCloud ? 'cloud' : 'offline');

    if (isCloud) {
      await loadCloudSave();
      patchSaveForCloud();
      await syncLeaderboard();
      window.WorldrootUI?.refresh();
      window.WorldrootUI?.setSessionBadge(window.WorldrootSession);
    }

    window.WorldrootCloud = { scheduleCloudSave, flushCloudSave, flush: flushCloudSave };
  } catch (err) {
    console.warn('Cloud sync unavailable:', err);
  }

  window.WorldrootLeaderboard = { fetchTop: fetchLeaderboardTop, sync: syncLeaderboard };
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
