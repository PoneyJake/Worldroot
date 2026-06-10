import { getSupabase, getCurrentUser, getDisplayName } from './auth.js';
import { isCloudEnabled } from './cloudConfig.js';

export async function fetchLeaderboardTop(limit = 10) {
  if (!isCloudEnabled()) {
    return {
      entries: [],
      cloud: false,
      error: 'Cloud is not configured. Leaderboard needs Play Worldroot with a logged-in account.',
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return { entries: [], cloud: false, error: 'Could not connect to cloud services.' };
  }

  const { data, error } = await sb
    .from('worldroot_leaderboard')
    .select('user_id, username, total_level, character_count')
    .order('total_level', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Leaderboard fetch failed:', error.message);
    return { entries: [], cloud: true, error: error.message };
  }

  return { entries: data ?? [], cloud: true };
}

export async function syncLeaderboard() {
  if (!isCloudEnabled()) return;

  const sb = getSupabase();
  const user = getCurrentUser();
  if (!sb || !user) return;

  const state = window.WorldrootUI?.getState?.();
  const totalLevel = window.WorldrootState?.accountTotalLevel?.(state) ?? 0;
  const characterCount = state?.characters?.length ?? 0;

  const { error } = await sb.from('worldroot_leaderboard').upsert(
    {
      user_id: user.id,
      username: getDisplayName(),
      total_level: totalLevel,
      character_count: characterCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) console.warn('Leaderboard sync failed:', error.message);
}
