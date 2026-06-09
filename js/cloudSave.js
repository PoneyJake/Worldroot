import { getSupabase, getCurrentUser } from './auth.js';
import { isCloudEnabled } from './cloudConfig.js';
import { syncLeaderboard } from './leaderboard.js';

const CLOUD_SAVE_KEY = 'worldroot_save_v1';

let saveTimer = null;
let saving = false;

function exportSaveData() {
  if (window.WorldrootState?.exportSaveData) {
    return window.WorldrootState.exportSaveData();
  }
  try {
    const raw = localStorage.getItem(CLOUD_SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function importSaveData(data) {
  if (!data || typeof data !== 'object') return;
  if (window.WorldrootState?.importSaveData) {
    window.WorldrootState.importSaveData(data);
    return;
  }
  localStorage.setItem(CLOUD_SAVE_KEY, JSON.stringify(data));
}

export async function loadCloudSave() {
  if (!isCloudEnabled()) return false;

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return false;

  const { data, error } = await sb
    .from('worldroot_saves')
    .select('save_data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('Cloud load failed:', error.message);
    return false;
  }

  if (data?.save_data && Object.keys(data.save_data).length > 0) {
    importSaveData(data.save_data);
    return true;
  }

  return false;
}

export async function pushCloudSave() {
  if (!isCloudEnabled() || saving) return;

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return;

  const payload = exportSaveData();
  if (!payload) return;

  saving = true;

  try {
    const { error } = await sb.from('worldroot_saves').upsert(
      {
        user_id: user.id,
        save_data: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
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
