// Přihlášení a registrace přes Supabase Auth
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase';

WebBrowser.maybeCompleteAuthSession();

// Je poskytovatel Google v Supabase zapnutý? (aby se nezobrazovalo nefunkční tlačítko)
export async function isGoogleEnabled() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    const json = await res.json();
    return !!json?.external?.google;
  } catch (e) {
    return false;
  }
}

// Aktuální přihlášení (session) nebo null
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Sledování změn přihlášení (přihlásil/odhlásil se)
export function onAuthChange(callback: (session: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// Přihlášení Googlem. Web a nativní appka mají jiný flow:
//  - WEB: standardní redirect (prohlížeč přejde na Google a vrátí se na tuto stránku;
//    session zpracuje supabase klient přes detectSessionInUrl po návratu).
//  - NATIVNÍ: bezpečné okno prohlížeče (WebBrowser) + ruční výměna kódu za session.
export async function signInWithGoogle() {
  if (Platform.OS === 'web') {
    // Vrátit se přesně na tuto stránku (i s podadresářem /dotacnicek/app/)
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
    return null; // prohlížeč se teď přesměruje na Google; dál pokračuje po návratu
  }

  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return null;

  // Z návratové URL vytáhneme kód (robustně i pro exp:// schéma) a vyměníme ho za session
  const m = /[?&#]code=([^&]+)/.exec(res.url);
  const code = m ? decodeURIComponent(m[1]) : null;
  if (!code) throw new Error('Chybí autorizační kód z Googlu.');
  const { data: sessionData, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exErr) throw exErr;
  return sessionData.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// GDPR: smazání účtu a všech osobních dat (volá serverovou funkci, viz migration_gdpr.sql)
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  try { await supabase.auth.signOut(); } catch (e) {}
}

// Změna mého zobrazovaného jména (přepíše i jméno ve výdajích/platbách – viz migration_names.sql)
export async function setMyName(name: string) {
  // ulož i do auth metadat, ať jméno přežije odhlášení/přihlášení
  const { error: mErr } = await supabase.auth.updateUser({ data: { full_name: name } });
  if (mErr) throw mErr;
  const { error } = await supabase.rpc('set_my_name', { new_name: name });
  if (error) throw error;
}

// Zajistí, že má přihlášený uživatel záznam v tabulce profiles
export async function ensureProfile(displayName: string) {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, display_name: displayName || user.email }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
