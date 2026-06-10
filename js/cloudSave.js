import { getSupabase, getCurrentUser } from './auth.js';
import { isCloudEnabled, SUPABASE_URL, SUPABASE_ANON_KEY } from './cloudConfig.js';
import { syncLeaderboard } from './leaderboard.js';

const LOCAL_SAVE_KEYS = [
  'worldroot_save_v5',
  'worldroot_save_v4',
  'worldroot_save_offline_v5',
  'worldroot_save_offline_v4',
  'worldroot_save_v1',
];

const DEBOUNCE_MS = 500;
const MAX_WAIT_MS = 8000;
const PERIODIC_SYNC_MS = 8000;

let saveTimer = null;
let maxWaitTimer = null;
let saving = false;
let lastPushAt = 0;
let cloudDirty = false;
let listenersBound = false;
let lastSyncLabel = '';
let periodicSyncTimer = null;

function notifySyncStatus(state, message) {
  lastSyncLabel = message || state;
  window.dispatchEvent(new CustomEvent('worldroot-cloud-sync', {
    detail: { state, message: lastSyncLabel, at: Date.now() },
  }));
}

export function getCloudSyncLabel() {
  return lastSyncLabel;
}

function readRawLocalSave() {
  for (const key of LOCAL_SAVE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      /* try next key */
    }
  }
  return null;
}

export function persistGameSave() {
  const state = window.WorldrootUI?.getState?.();
  if (state && window.WorldrootState?.saveState) {
    window.WorldrootState.saveState(state, { touchCloud: false });
  }
}

function exportSaveData() {
  if (window.WorldrootUI?.getState && window.WorldrootState?.exportSaveData) {
    return window.WorldrootState.exportSaveData();
  }
  return readRawLocalSave();
}

function importSaveData(data) {
  if (!data || typeof data !== 'object') return;
  if (window.WorldrootState?.importSaveData) {
    window.WorldrootState.importSaveData(data);
    return;
  }
  localStorage.setItem('worldroot_save_v5', JSON.stringify(data));
}

export function accountLevelFromSave(save) {
  if (!save?.characters?.length) return 0;
  return save.characters.reduce((sum, char) => {
    if (!char?.skills) return sum;
    return sum + Object.values(char.skills).reduce((s, sk) => s + (sk?.level ?? 0), 0);
  }, 0);
}

function saveProgressScore(save) {
  if (!save || typeof save !== 'object') return 0;
  const chars = save.characters?.length ?? 0;
  const level = accountLevelFromSave(save);
  const gold = save.gold ?? 0;
  return level * 1_000_000 + gold * 10 + chars;
}

function saveHasProgress(save) {
  return saveProgressScore(save) > 0;
}

function localSavedAt(save) {
  return save?.savedAt ?? 0;
}

function cloudSavedAt(row) {
  if (row?.updated_at) return new Date(row.updated_at).getTime();
  return localSavedAt(row?.save_data);
}

function pickNewerSave(localPayload, cloudRow) {
  const cloudPayload = cloudRow?.save_data;
  const cloudTime = cloudSavedAt(cloudRow);
  const localTime = localSavedAt(localPayload);
  const cloudScore = saveProgressScore(cloudPayload);
  const localScore = saveProgressScore(localPayload);

  if (cloudPayload && localPayload) {
    if (cloudScore !== localScore) {
      return cloudScore > localScore
        ? { payload: cloudPayload, source: 'cloud' }
        : { payload: localPayload, source: 'local' };
    }
    if (cloudTime !== localTime) {
      return cloudTime > localTime
        ? { payload: cloudPayload, source: 'cloud' }
        : { payload: localPayload, source: 'local' };
    }
    return { payload: cloudPayload, source: 'cloud' };
  }

  if (cloudPayload) return { payload: cloudPayload, source: 'cloud' };
  if (localPayload) return { payload: localPayload, source: 'local' };
  return { payload: null, source: 'none' };
}

function reloadUiFromStorage() {
  if (!window.WorldrootState?.loadState || !window.WorldrootUI?.setState) return;
  window.WorldrootUI.setState(window.WorldrootState.loadState());
  window.WorldrootUI.render?.({ force: true });
}

async function fetchCloudRow() {
  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return null;
  const { data, error } = await sb
    .from('worldroot_saves')
    .select('save_data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('Cloud fetch failed:', error.message);
    return null;
  }
  return data;
}

async function ensureAuthSession() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.getSession();
  if (error || !data.session?.user) return null;
  return data.session;
}

export async function loadCloudSave() {
  if (!isCloudEnabled()) return { source: 'local' };

  const session = await ensureAuthSession();
  if (!session) return { source: 'local' };

  notifySyncStatus('pulling', 'Checking cloud save…');
  persistGameSave();
  const localPayload = exportSaveData();
  const data = await fetchCloudRow();
  if (!data) {
    notifySyncStatus('error', 'Could not reach cloud');
    return { source: 'local' };
  }

  const picked = pickNewerSave(localPayload, data);
  if (picked.payload) {
    importSaveData(picked.payload);
    reloadUiFromStorage();
    const cloudScore = saveProgressScore(data.save_data);
    const localScore = saveProgressScore(localPayload);
    if (picked.source === 'local' && localScore >= cloudScore) {
      await pushCloudSave(true);
    } else {
      cloudDirty = false;
    }
    notifySyncStatus('saved', picked.source === 'cloud' ? 'Loaded from cloud' : 'Saved to cloud');
    return { source: picked.source };
  }

  notifySyncStatus('idle', 'Cloud save up to date');
  return { source: 'none' };
}

/** Always apply the cloud save (for Download from cloud). */
export async function downloadCloudSave() {
  if (!isCloudEnabled()) return { ok: false, reason: 'offline' };
  if (!getCurrentUser()) return { ok: false, reason: 'auth' };

  const data = await fetchCloudRow();
  if (!data) return { ok: false, reason: 'fetch' };
  if (!data.save_data) return { ok: false, reason: 'empty' };

  importSaveData(data.save_data);
  reloadUiFromStorage();
  cloudDirty = false;
  return { ok: true };
}

/** Force-push the current local save to the cloud. */
export async function uploadCloudSave() {
  if (!isCloudEnabled()) return { ok: false, reason: 'offline' };
  if (!(await ensureAuthSession())) return { ok: false, reason: 'auth' };
  persistGameSave();
  const ok = await pushCloudSave(true);
  return ok ? { ok: true } : { ok: false, reason: 'push' };
}

/** Merge cloud/local saves before opening the game from the home page. */
export async function prepareCloudPlay() {
  if (!isCloudEnabled() || !getCurrentUser()) return;
  window.WorldrootState?.setPlayMode?.('cloud');
  await loadCloudSave();
}

async function pushCloudSaveKeepalive(payload, userId, accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !accessToken) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/worldroot_saves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        save_data: payload,
        updated_at: new Date().toISOString(),
      }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pushCloudSave(force = false) {
  if (!isCloudEnabled() || saving) return false;

  const sb = getSupabase();
  const session = await ensureAuthSession();
  if (!sb || !session) {
    notifySyncStatus('error', 'Not logged in to cloud');
    return false;
  }

  persistGameSave();
  const payload = exportSaveData();
  if (!payload) return false;

  if (!force) {
    const remote = await fetchCloudRow();
    const picked = pickNewerSave(payload, remote);
    if (picked.source === 'cloud' && picked.payload) {
      importSaveData(picked.payload);
      reloadUiFromStorage();
      cloudDirty = false;
      notifySyncStatus('saved', 'Loaded from cloud');
      return true;
    }
  }

  saving = true;
  notifySyncStatus('saving', 'Saving to cloud…');
  payload.savedAt = Date.now();
  if (window.WorldrootUI?.getState) {
    window.WorldrootUI.getState().savedAt = payload.savedAt;
    window.WorldrootState?.saveState?.(window.WorldrootUI.getState(), { touchCloud: false });
  }

  try {
    const { error } = await sb.from('worldroot_saves').upsert(
      {
        user_id: session.user.id,
        save_data: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      console.warn('Cloud save failed:', error.message);
      notifySyncStatus('error', `Cloud save failed: ${error.message}`);
      return false;
    }

    lastPushAt = Date.now();
    cloudDirty = false;
    notifySyncStatus('saved', 'Saved to cloud');
    await syncLeaderboard();
    return true;
  } finally {
    saving = false;
  }
}

function clearSaveTimers() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (maxWaitTimer) {
    clearTimeout(maxWaitTimer);
    maxWaitTimer = null;
  }
}

export function scheduleCloudSave() {
  if (!isCloudEnabled() || !getCurrentUser()) return;
  cloudDirty = true;
  notifySyncStatus('pending', 'Will save to cloud…');

  const now = Date.now();
  if (now - lastPushAt >= MAX_WAIT_MS) {
    clearSaveTimers();
    pushCloudSave();
    return;
  }

  if (!maxWaitTimer) {
    maxWaitTimer = setTimeout(() => {
      maxWaitTimer = null;
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      if (cloudDirty) pushCloudSave();
    }, Math.max(0, MAX_WAIT_MS - (now - lastPushAt)));
  }

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer);
      maxWaitTimer = null;
    }
    if (cloudDirty) pushCloudSave();
  }, DEBOUNCE_MS);
}

export function flushCloudSave() {
  clearSaveTimers();
  cloudDirty = true;
  return pushCloudSave(true);
}

export async function flushCloudSaveOnExit() {
  if (!isCloudEnabled()) return;

  const session = await ensureAuthSession();
  if (!session) return;

  persistGameSave();
  const payload = exportSaveData();
  if (!payload) return;

  const remote = await fetchCloudRow();
  if (remote?.save_data) {
    const localScore = saveProgressScore(payload);
    const cloudScore = saveProgressScore(remote.save_data);
    if (cloudScore > localScore) {
      cloudDirty = false;
      return;
    }
  }

  payload.savedAt = Date.now();
  if (window.WorldrootUI?.getState) {
    window.WorldrootUI.getState().savedAt = payload.savedAt;
    window.WorldrootState?.saveState?.(window.WorldrootUI.getState(), { touchCloud: false });
  }

  cloudDirty = true;

  if (document.visibilityState === 'visible') {
    await pushCloudSave(true);
    return;
  }

  const ok = await pushCloudSaveKeepalive(payload, session.user.id, session.access_token);
  if (ok) {
    cloudDirty = false;
    lastPushAt = Date.now();
    notifySyncStatus('saved', 'Saved to cloud');
  } else {
    notifySyncStatus('error', 'Could not save before close');
  }
}

function startPeriodicCloudSync() {
  if (periodicSyncTimer) return;
  periodicSyncTimer = setInterval(() => {
    if (!window.WorldrootSession?.isCloud || !getCurrentUser()) return;
    if (cloudDirty) pushCloudSave();
  }, PERIODIC_SYNC_MS);
}

function stopPeriodicCloudSync() {
  if (periodicSyncTimer) {
    clearInterval(periodicSyncTimer);
    periodicSyncTimer = null;
  }
}

export function initCloudSyncListeners() {
  if (listenersBound || !window.WorldrootSession?.isCloud) return;
  listenersBound = true;

  const onHide = () => { flushCloudSaveOnExit(); };
  const onShow = () => { loadCloudSave(); };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide();
    else onShow();
  });
  window.addEventListener('pagehide', onHide);
  window.addEventListener('blur', onHide);
  document.addEventListener('freeze', onHide);

  startPeriodicCloudSync();
}

export function stopCloudSyncListeners() {
  listenersBound = false;
  stopPeriodicCloudSync();
  clearSaveTimers();
}
