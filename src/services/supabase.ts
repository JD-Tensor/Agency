import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'agency_supabase_url';
const STORAGE_KEY_KEY = 'agency_supabase_anon_key';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = (localStorage.getItem(STORAGE_URL_KEY) || '').trim();
    storedKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  } catch (e) {
    // ignore
  }

  const url = envUrl || storedUrl;
  const anonKey = envKey || storedKey;

  return { url, anonKey, isFromEnv: Boolean(envUrl && envKey) };
};

export const setSupabaseConfig = (url: string, anonKey: string): void => {
  try {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
};

export const clearSupabaseConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  } catch (e) {
    console.error('Failed to clear Supabase config', e);
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    anonKey.length > 20 &&
    url !== 'https://your-project-ref.supabase.co' &&
    anonKey !== 'your-anon-key'
  );
};

const { url, anonKey } = getSupabaseConfig();

export const supabase: SupabaseClient | null = isSupabaseConfigured() && url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;
