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

const DEBOUNCE_MS = 1500;
const MAX_WAIT_MS = 12000;

let saveTimer = null;
let maxWaitTimer = null;
let saving = false;
let lastPushAt = 0;
let cloudDirty = false;
let listenersBound = false;

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
    window.WorldrootState.saveState(state);
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

function reloadUiFromStorage() {
  if (!window.WorldrootState?.loadState || !window.WorldrootUI?.setState) return;
  window.WorldrootUI.setState(window.WorldrootState.loadState());
  window.WorldrootUI.refresh?.();
}

function pickNewerSave(localPayload, cloudRow) {
  const cloudPayload = cloudRow?.save_data;
  const cloudHas = saveHasProgress(cloudPayload);
  const localHas = saveHasProgress(localPayload);
  const cloudTime = cloudSavedAt(cloudRow);
  const localTime = localSavedAt(localPayload);

  if (cloudHas && !localHas) return { payload: cloudPayload, source: 'cloud' };
  if (localHas && !cloudHas) return { payload: localPayload, source: 'local' };

  if (cloudHas && localHas) {
    if (cloudTime > localTime) return { payload: cloudPayload, source: 'cloud' };
    if (localTime > cloudTime) return { payload: localPayload, source: 'local' };
    const cloudScore = saveProgressScore(cloudPayload);
    const localScore = saveProgressScore(localPayload);
    if (cloudScore >= localScore) return { payload: cloudPayload, source: 'cloud' };
    return { payload: localPayload, source: 'local' };
  }

  return { payload: null, source: 'none' };
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

export async function loadCloudSave() {
  if (!isCloudEnabled()) return { source: 'local' };

  const user = getCurrentUser();
  if (!user) return { source: 'local' };

  persistGameSave();
  const localPayload = exportSaveData();
  const data = await fetchCloudRow();
  if (!data) return { source: 'local' };

  const picked = pickNewerSave(localPayload, data);
  if (picked.payload) {
    importSaveData(picked.payload);
    reloadUiFromStorage();
    if (picked.source === 'local') await pushCloudSave(true);
    else cloudDirty = false;
    return { source: picked.source };
  }

  return { source: 'none' };
}

/** Always apply the cloud save (for Download from cloud). */
export async function downloadCloudSave() {
  if (!isCloudEnabled() || !getCurrentUser()) return false;

  const data = await fetchCloudRow();
  if (!data?.save_data || !saveHasProgress(data.save_data)) return false;

  importSaveData(data.save_data);
  reloadUiFromStorage();
  cloudDirty = false;
  return true;
}

/** Upload this device's current save to the cloud (for Upload to cloud). */
export async function uploadCloudSave() {
  if (!isCloudEnabled() || !getCurrentUser()) return false;
  persistGameSave();
  await pushCloudSave(true);
  return true;
}

/** Merge cloud/local saves before opening the game from the home page. */
export async function prepareCloudPlay() {
  if (!isCloudEnabled() || !getCurrentUser()) return;
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
  if (!isCloudEnabled() || saving) return;

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return;

  persistGameSave();
  const payload = exportSaveData();
  if (!payload) return;

  if (!force) {
    const remote = await fetchCloudRow();
    const picked = pickNewerSave(payload, remote);
    if (picked.source === 'cloud' && picked.payload && saveHasProgress(picked.payload)) {
      importSaveData(picked.payload);
      reloadUiFromStorage();
      cloudDirty = false;
      return;
    }
  }

  saving = true;
  payload.savedAt = Date.now();

  try {
    const { error } = await sb.from('worldroot_saves').upsert(
      {
        user_id: user.id,
        save_data: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      console.warn('Cloud save failed:', error.message);
    } else {
      lastPushAt = Date.now();
      cloudDirty = false;
      if (window.WorldrootUI?.getState) {
        window.WorldrootUI.getState().savedAt = payload.savedAt;
      }
      await syncLeaderboard();
    }
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
  if (!isCloudEnabled() || !getCurrentUser() || !cloudDirty) return;
  persistGameSave();
  const payload = exportSaveData();
  if (!payload) return;

  payload.savedAt = Date.now();
  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return;

  if (document.visibilityState === 'visible') {
    await pushCloudSave(true);
    return;
  }

  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData.session?.access_token;
  const ok = await pushCloudSaveKeepalive(payload, user.id, token);
  if (ok) {
    cloudDirty = false;
    lastPushAt = Date.now();
  }
}

export function initCloudSyncListeners() {
  if (listenersBound || !window.WorldrootSession?.isCloud) return;
  listenersBound = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushCloudSaveOnExit();
    } else {
      loadCloudSave();
    }
  });
  window.addEventListener('pagehide', () => flushCloudSaveOnExit());
}

export function stopCloudSyncListeners() {
  listenersBound = false;
  clearSaveTimers();
}
