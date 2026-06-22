// Klient pro Supabase (cloudová databáze, přihlášení, úložiště fotek)
//
// Klíče se NEpíšou sem do kódu – vyplň je v `app.json` → "extra":
//   "supabaseUrl": "https://xxxx.supabase.co",
//   "supabaseAnonKey": "eyJ..."
// (anon klíč je veřejný a bezpečný do appky – data chrání pravidla RLS v databázi.)
//
// Dokud klíče nevyplníš, appka běží v LOKÁLNÍM režimu (data jen v telefonu).

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const extra = Constants.expoConfig?.extra || {};
const SUPABASE_URL = extra.supabaseUrl || '';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || '';

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // v mobilní appce řešíme redirect ručně
        flowType: 'pkce', // bezpečný OAuth flow pro mobilní aplikace
      },
    })
  : null;
