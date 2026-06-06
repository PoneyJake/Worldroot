/** Supabase keys — local file, env vars, or /api/config on Vercel. */

export let SUPABASE_URL = '';
export let SUPABASE_ANON_KEY = '';

export function isCloudEnabled() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_URL.includes('YOUR_PROJECT') &&
      SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY'
  );
}

export async function loadRuntimeConfig() {
  if (isCloudEnabled()) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('/api/config', { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return;
    const data = await res.json();
    if (data.url && data.key) {
      SUPABASE_URL = data.url;
      SUPABASE_ANON_KEY = data.key;
    }
  } catch {
    /* offline / local without api route */
  }
}
