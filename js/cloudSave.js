import { getSupabase, getCurrentUser } from './auth.js';
import { isCloudEnabled } from './cloudConfig.js';
import { syncLeaderboard } from './leaderboard.js';

const LOCAL_SAVE_KEYS = [
  'worldroot_save_v5',
  'worldroot_save_v4',
  'worldroot_save_offline_v5',
  'worldroot_save_offline_v4',
  'worldroot_save_v1',
];

let saveTimer = null;
let saving = false;

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

function exportSaveData() {
  if (window.WorldrootState?.exportSaveData) {
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

function reloadUiFromStorage() {
  if (!window.WorldrootState?.loadState || !window.WorldrootUI?.setState) return;
  window.WorldrootUI.setState(window.WorldrootState.loadState());
  window.WorldrootUI.refresh?.();
}

export async function loadCloudSave() {
  if (!isCloudEnabled()) return { source: 'local' };

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return { source: 'local' };

  const localPayload = exportSaveData();
  const localScore = saveProgressScore(localPayload);

  const { data, error } = await sb
    .from('worldroot_saves')
    .select('save_data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('Cloud load failed:', error.message);
    return { source: 'local', error: error.message };
  }

  const cloudPayload = data?.save_data;
  const cloudScore = saveProgressScore(cloudPayload);
  const cloudHasProgress = saveHasProgress(cloudPayload);

  if (cloudHasProgress && cloudScore >= localScore) {
    importSaveData(cloudPayload);
    reloadUiFromStorage();
    return { source: 'cloud' };
  }

  if (localScore > cloudScore && saveHasProgress(localPayload)) {
    importSaveData(localPayload);
    await pushCloudSave(true);
    reloadUiFromStorage();
    return { source: 'local' };
  }

  if (cloudHasProgress) {
    importSaveData(cloudPayload);
    reloadUiFromStorage();
    return { source: 'cloud' };
  }

  return { source: 'none' };
}

/** Merge cloud/local saves before opening the game from the home page. */
export async function prepareCloudPlay() {
  if (!isCloudEnabled() || !getCurrentUser()) return;
  await loadCloudSave();
}

export async function pushCloudSave(force = false) {
  if (!isCloudEnabled() || saving) return;

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return;

  const payload = exportSaveData();
  if (!payload) return;

  if (!force) {
    const { data: remote } = await sb
      .from('worldroot_saves')
      .select('save_data')
      .eq('user_id', user.id)
      .maybeSingle();
    const remoteScore = saveProgressScore(remote?.save_data);
    const localScore = saveProgressScore(payload);
    if (remoteScore > localScore && saveHasProgress(remote?.save_data)) {
      importSaveData(remote.save_data);
      reloadUiFromStorage();
      return;
    }
  }

  saving = true;

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
      await syncLeaderboard();
    }
  } finally {
    saving = false;
  }
}

export function scheduleCloudSave() {
  if (!isCloudEnabled() || !getCurrentUser()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    pushCloudSave();
  }, 2000);
}

export function flushCloudSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  return pushCloudSave();
}
