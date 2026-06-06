import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isCloudEnabled, loadRuntimeConfig } from './cloudConfig.js';

let client = null;
let currentUser = null;

export function getSupabase() {
  if (!isCloudEnabled()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export function getCurrentUser() {
  return currentUser;
}

export function getDisplayName() {
  if (!currentUser) return '';
  return currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Player';
}

export function consumeAuthUrlErrors() {
  const raw = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const error = params.get('error');
  if (!error) return null;

  const code = params.get('error_code') || '';
  const desc = (params.get('error_description') || '').replace(/\+/g, ' ').trim();

  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  if (code === 'otp_expired') {
    return 'That confirmation link expired. Log in with your email and password, or create a new account.';
  }
  if (code === 'email_not_confirmed') {
    return 'Confirm your email first, then log in. Check your inbox for the latest link.';
  }
  if (desc) return desc;
  return 'Sign-in link failed. Use Log In with your email and password instead.';
}

export async function initAuth() {
  await loadRuntimeConfig();
  const urlError = consumeAuthUrlErrors();
  const sb = getSupabase();
  if (!sb) return { user: null, cloud: false, urlError };

  const { data } = await sb.auth.getSession();
  currentUser = data.session?.user ?? null;

  sb.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
  });

  return { user: currentUser, cloud: true, urlError };
}

async function resolveEmail(identifier) {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();

  const sb = getSupabase();
  const { data, error } = await sb
    .from('profiles')
    .select('email')
    .eq('username', trimmed)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.email) throw new Error('No account found for that username.');
  return data.email;
}

export async function signUp(email, username, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Cloud saves are not configured on this server.');

  const cleanEmail = email.trim().toLowerCase();
  const cleanUser = username.trim();

  if (!cleanEmail.includes('@')) throw new Error('Enter a valid email.');
  if (cleanUser.length < 3) throw new Error('Username must be at least 3 characters.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');

  const { data, error } = await sb.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { username: cleanUser } },
  });

  if (error) throw new Error(error.message);

  if (data.user && !data.session) {
    return {
      user: data.user,
      needsEmailConfirm: true,
      message: 'Check your email to confirm your account, then log in.',
    };
  }

  currentUser = data.user;
  return { user: data.user, needsEmailConfirm: false };
}

export async function signIn(identifier, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Cloud saves are not configured on this server.');

  const email = await resolveEmail(identifier);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  currentUser = data.user;
  return data.user;
}

export async function signOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  currentUser = null;
}
