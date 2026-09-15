import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const getSupabaseUrl = (): string => url;

export const isSupabaseConfigured = (): boolean =>
  url.startsWith('https://') &&
  anonKey.length > 20 &&
  url !== 'https://your-project-ref.supabase.co';

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const requireSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart the dev server.');
  }
  return supabase;
};
