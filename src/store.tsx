// Globální stav aplikace (kontext). Dva režimy:
//  - CLOUD_MODE: data čte/zapisuje do Supabase (sdílené mezi zařízeními i členy)
//  - lokální: data jen v telefonu (AsyncStorage), když nejsou klíče
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { BackHandler, AppState as RNAppState } from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { INITIAL_GROUPS, INITIAL_EXPENSES } from './data';
import { bubbleFor, pick } from './logic';
import { QUIPS_EGG } from './quips';
import { isSupabaseConfigured, supabase } from './supabase';
import { tapSuccess } from './haptics';
import { dispMember, idForMember } from './members';
import { setGlobalFontScale, CONTENT_SCALE } from './textScale';
import { loadRates } from './fx';
import { registerForPush, sendPush } from './notifications';
import { fmtMoney } from './money';
import * as api from './api';
import type { AppState, Actions, AppContextValue, ScreenName, Transfer, GroupMember } from './types';

export const CLOUD_MODE = isSupabaseConfigured;
export { api };

const STORAGE_KEY = '@babisovnik/state-v2';
const cacheKey = (uid: string) => '@babisovnik/cache-' + uid; // offline cache dat pro daný účet
const AppContext = createContext<AppContextValue | null>(null);

// Mapování "Já" (přihlášený) <-> reálné jméno uložené v databázi
const denorm = (name: string, myName: string) => (name === 'Já' ? myName : name);
const norm = (name: string, myName: string) => (name === myName ? 'Já' : name);
// Překlad člen <-> zobrazované jméno řeší ./members (dispMember, idForMember).

function makeInitialState(): AppState {
  return {
    screen: 'onboarding',
    selectedGroup: null,
    selectedExpense: null,
    selectedDebt: null,
    bubble: 'Čau lidi!',
    bubbleKey: 1,
    mascotMood: 'neutral',
    toast: null,
    coins: false,
    busy: false, // probíhá síťová operace
    googleEnabled: false, // zda je Google login v Supabase zapnutý
    meUid: null,
    myName: 'Já',
    userTheme: 'zluta',
    contentSize: 'medium',
    toggles: { notif: true, sound: false },
    bioAvailable: false,
    bioLock: false,
    locked: false,
    regEmail: '', regPassword: '',
    loginEmail: '', loginPassword: '',
    addDesc: '', addAmount: '', addPayer: 'Já', addParts: [], addPhoto: null,
    addCurrency: 'CZK',          // měna výdaje (CZK/EUR/USD)
    addSplitType: 'equal',       // equal | ratio | exact
    addShares: {},               // { jméno: hodnota } – váha (ratio) nebo částka (exact), jako string
    addCategory: 'ostatni',      // kategorie výdaje
    editingExpenseId: null, // null = přidávám nový; jinak id upravovaného výdaje
    newGroupName: '', newGroupMembers: ['Já'], newMemberInput: '',
    shareCode: null,
    joinCodeInput: '',
    joinPreview: null, // { code, groupId, groupName, members:[{name,claimed,isMe}] } – výběr "kdo jsem"
    groups: INITIAL_GROUPS,
    expenses: INITIAL_EXPENSES,
    payments: {},
    fxRates: null,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(makeInitialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const toastTimer = useRef<any>(null);
  const coinsTimer = useRef<any>(null);
  const moodTimer = useRef<any>(null);
  const pokeCount = useRef(0);       // easter egg: počítadlo šťouchnutí do maskota
  const pokeTimer = useRef<any>(null);
  const loaded = useRef(false);
  const meRef = useRef<{ uid: string; myName: string } | null>(null); // spolehlivé čtení v async akcích
  const pendingJoin = useRef<string | null>(null);  // kód pozvánky čekající na přihlášení
  const lastFetch = useRef(0);       // throttle automatického obnovení na Přehledu
  const rtDebounce = useRef<any>(null);   // debounce realtime změn

  // Uloží snímek dat do offline cache pro daný účet
  function saveCache(uid: string | null | undefined, data: { groups: AppState['groups']; expenses: AppState['expenses']; payments: AppState['payments'] }) {
    if (!CLOUD_MODE || !uid || !data) return;
    AsyncStorage.setItem(cacheKey(uid), JSON.stringify({ groups: data.groups, expenses: data.expenses, payments: data.payments })).catch(() => {});
  }

  // ---------- start: nastavení / přihlášení ----------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.contentSize) setGlobalFontScale(CONTENT_SCALE[saved.contentSize as keyof typeof CONTENT_SCALE] || 1);
          setState((s) => ({
            ...s,
            userTheme: saved.userTheme || s.userTheme,
            contentSize: saved.contentSize || s.contentSize,
            toggles: saved.toggles || s.toggles,
            bioLock: !!saved.bioLock,
            // lokální data se obnoví jen v lokálním režimu
            groups: CLOUD_MODE ? s.groups : (saved.groups || s.groups),
            expenses: CLOUD_MODE ? s.expenses : (saved.expenses || s.expenses),
            payments: CLOUD_MODE ? s.payments : (saved.payments || s.payments),
          }));
        }
      } catch (e) {}
      loaded.current = true;

      // Je na zařízení biometrika (a má ji uživatel nastavenou)?
      (async () => {
        try {
          const hw = await LocalAuth.hasHardwareAsync();
          const enrolled = hw && (await LocalAuth.isEnrolledAsync());
          if (hw && enrolled) setState((s) => ({ ...s, bioAvailable: true }));
        } catch (e) {}
      })();

      // Kurzy měn pro orientační přepočet (cache + čerstvé na pozadí)
      loadRates().then((r) => { if (r) setState((s) => ({ ...s, fxRates: r })); }).catch(() => {});

      // Pozvánka z odkazu (dotacnik://join/KÓD) – zachytíme i při startu
      try {
        const initialUrl = await Linking.getInitialURL();
        const code = parseJoinCode(initialUrl);
        if (code) pendingJoin.current = code;
      } catch (e) {}

      if (CLOUD_MODE) {
        api.authApi.isGoogleEnabled().then((ge) => setState((s) => ({ ...s, googleEnabled: ge }))).catch(() => {});
        try {
          const session = await api.authApi.getSession(); // čte se lokálně, rychlé
          if (session) {
            // Zapnutý biometrický zámek → appka startuje zamčená
            setState((s) => (s.bioLock ? { ...s, locked: true } : s));
            // Okamžitě ukážeme poslední data z offline cache (než dojede síť)
            const u = session.user;
            const myName0 = u.user_metadata?.full_name || (u.email ? u.email.split('@')[0] : 'Já');
            meRef.current = { uid: u.id, myName: myName0 };
            try {
              const cachedRaw = await AsyncStorage.getItem(cacheKey(u.id));
              if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                setState((s) => ({ ...s, ...cached, meUid: u.id, myName: myName0, screen: 'overview', bubble: bubbleFor(s, 'overview'), bubbleKey: s.bubbleKey + 1 }));
              }
            } catch (e) {}
            await finishLogin(); // čerstvá data ze sítě (přepíšou cache)
          }
        } catch (e) {}
      }
    })();

    // Pozvánka z odkazu za běhu appky
    const sub = Linking.addEventListener('url', (e) => {
      const code = parseJoinCode(e.url);
      if (!code) return;
      if (meRef.current) joinByCode(code);
      else pendingJoin.current = code;
    });
    return () => sub.remove();
  }, []);

  // Realtime: živé promítnutí cizích změn výdajů/plateb (po přihlášení)
  useEffect(() => {
    if (!CLOUD_MODE || !state.meUid) return;
    const onRemote = (payload: any) => {
      const gid = payload.new?.group_id || payload.old?.group_id;
      clearTimeout(rtDebounce.current);
      rtDebounce.current = setTimeout(() => {
        const groups = stateRef.current.groups || [];
        if (gid && groups.some((g) => g.id === gid)) reloadGroup(gid).catch(() => {});
        else refreshAll(true);
      }, 350);
    };
    const ch = supabase
      .channel('rt-' + state.meUid)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'expenses' }, onRemote)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'payments' }, onRemote)
      .subscribe();
    return () => { clearTimeout(rtDebounce.current); supabase.removeChannel(ch); };
  }, [state.meUid]);

  function parseJoinCode(url: string | null): string | null {
    if (!url) return null;
    const m = /join\/([A-Za-z0-9]+)/.exec(url);
    return m ? m[1].toUpperCase() : null;
  }

  // Systémové "zpět" (hardwarové tlačítko i gesto přejetím prstu na Androidu).
  // Vrátíme true = obsloužili jsme to sami (appka se nevypne); false = nech systém
  // udělat výchozí akci (na úvodní obrazovce = zavřít appku, což je správně).
  function goBack() {
    const sc = stateRef.current.screen;
    const targets: Partial<Record<ScreenName, ScreenName>> = {
      group: 'overview',
      audit: 'group',
      activity: 'group',
      smlouva: 'settle',
      add: stateRef.current.editingExpenseId ? 'expense' : 'group',
      expense: 'group',
      settle: 'overview',
      choose_identity: 'overview',
      profile: 'overview',
      privacy: 'profile',
      create_group: 'overview',
      share_group: 'overview',
      join: 'overview',
      register_email: 'onboarding',
      login: 'onboarding',
    };
    const target = targets[sc];
    if (!target) return false; // overview / onboarding → necháme appku zavřít
    if (sc === 'add') setState((s) => ({ ...s, editingExpenseId: null }));
    navigate(target);
    return true;
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => sub.remove();
  }, []);

  // Biometrický zámek: při odchodu do pozadí se appka zamkne (odemyká se při návratu)
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (st) => {
      if (st === 'background' && stateRef.current.bioLock && stateRef.current.meUid) {
        setState((s) => ({ ...s, locked: true }));
      }
    });
    return () => sub.remove();
  }, []);

  // ukládání perzistentní části
  useEffect(() => {
    if (!loaded.current) return;
    const slice = CLOUD_MODE
      ? { userTheme: state.userTheme, contentSize: state.contentSize, toggles: state.toggles, bioLock: state.bioLock }
      : { userTheme: state.userTheme, contentSize: state.contentSize, toggles: state.toggles, bioLock: state.bioLock, groups: state.groups, expenses: state.expenses, payments: state.payments };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slice)).catch(() => {});
  }, [state.groups, state.expenses, state.payments, state.userTheme, state.contentSize, state.toggles, state.bioLock]);

  // ---------- pomocné ----------
  function patch(p: Partial<AppState> | ((s: AppState) => Partial<AppState>)) { setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })); }

  // Přechodná nálada maskota (reakce na akci). Sama se po chvíli vrátí na neutral.
  function flashMood(m: AppState['mascotMood'], ms = 2200) {
    setState((s) => ({ ...s, mascotMood: m }));
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setState((s) => ({ ...s, mascotMood: 'neutral' })), ms);
  }

  function showToast(text: string) {
    setState((s) => ({ ...s, toast: text }));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200);
  }

  function navigate(screen: ScreenName) {
    setState((s) => {
      if (s.screen === screen) return s; // už jsem na téhle obrazovce → neměň hlášku
      return { ...s, screen, bubble: bubbleFor(s, screen), bubbleKey: s.bubbleKey + 1 };
    });
    if (CLOUD_MODE && screen === 'overview') refreshAll(); // throttlované – viz refreshAll
  }

  async function getMe(): Promise<{ uid: string; myName: string }> {
    const { data } = await supabase.auth.getUser();
    const user = data.user!;
    const myName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Já');
    return { uid: user.id, myName };
  }

  // Načte vše z cloudu. Členové se z DB čtou jako ID a tady se překládají na aktuální
  // jména ("Já" pro mě) – proto přejmenování nevyžaduje přepis historie.
  async function fetchEverything(uid: string, myName: string) {
    const rawGroups = await api.groupsApi.fetchGroups();
    const groups = rawGroups.map((g) => ({
      id: g.id, name: g.name, shareCode: g.shareCode,
      memberList: g.members as GroupMember[],
      members: g.members.map((m: GroupMember) => (m.userId === uid ? 'Já' : m.name)),
    }));
    // Hromadně: 2 dotazy pro všechny skupiny místo 2× pro každou (N+1)
    const ids = rawGroups.map((g) => g.id);
    const [exByGroup, payByGroup] = await Promise.all([
      api.expensesApi.fetchExpensesForGroups(ids),
      api.expensesApi.fetchPaymentsForGroups(ids),
    ]);
    const expenses: AppState['expenses'] = {};
    const payments: AppState['payments'] = {};
    rawGroups.forEach((g) => {
      const ml = g.members as GroupMember[];
      expenses[g.id] = (exByGroup[g.id] || []).map((e) => ({
        id: e.id, desc: e.desc, amount: e.amount, photo: e.photo, currency: e.currency, shares: e.shares, splitType: e.splitType, category: e.category, createdAt: e.createdAt || undefined,
        payer: dispMember(ml, e.payerId, uid, myName, e.payerName),
        parts: (e.partIds && e.partIds.length)
          ? e.partIds.map((pid, i) => dispMember(ml, pid, uid, myName, e.partNames[i]))
          : (e.partNames || []).map((n) => norm(n, myName)),
      }));
      payments[g.id] = (payByGroup[g.id] || []).map((p: any) => ({
        id: p.id, amt: Number(p.amount), currency: (p.currency || 'CZK') as Transfer['currency'], createdAt: p.created_at || undefined,
        from: dispMember(ml, p.from_id || null, uid, myName, p.from_name),
        to: dispMember(ml, p.to_id || null, uid, myName, p.to_name),
      }));
    });
    return { groups, expenses, payments };
  }

  // Registrace push tokenu (best-effort, neblokuje a nikdy nehodí chybu)
  function registerPushBestEffort() {
    registerForPush().then((t) => { if (t) api.pushApi.savePushToken(t).catch(() => {}); }).catch(() => {});
  }

  async function finishLogin() {
    const me = await getMe();
    meRef.current = me;
    await api.authApi.ensureProfile(me.myName);
    registerPushBestEffort();
    const data = await fetchEverything(me.uid, me.myName);
    lastFetch.current = Date.now();
    saveCache(me.uid, data);
    setState((s) => ({ ...s, ...data, meUid: me.uid, myName: me.myName, screen: 'overview', bubble: bubbleFor({ ...s, ...data }, 'overview'), bubbleKey: s.bubbleKey + 1 }));
    // Čekající pozvánka z odkazu → rovnou připojit
    if (pendingJoin.current) {
      const code = pendingJoin.current;
      pendingJoin.current = null;
      joinByCode(code);
    } else {
      showToast('Vítej, motýle!');
    }
  }

  // force=true obejde throttle (pull-to-refresh, realtime). Jinak nečerpá data častěji než po 4 s.
  async function refreshAll(force?: boolean) {
    const { meUid, myName } = stateRef.current;
    if (!meUid) return;
    if (!force && Date.now() - lastFetch.current < 4000) return;
    lastFetch.current = Date.now();
    try {
      const data = await fetchEverything(meUid, myName);
      saveCache(meUid, data);
      setState((s) => ({ ...s, ...data }));
    } catch (e) {}
  }

  async function reloadGroup(id: string) {
    const { myName, meUid } = stateRef.current;
    const ml = stateRef.current.groups.find((g) => g.id === id)?.memberList;
    const ex = await api.expensesApi.fetchExpenses(id);
    const expensesG = ex.map((e) => ({
      id: e.id, desc: e.desc, amount: e.amount, photo: e.photo, currency: e.currency, shares: e.shares, splitType: e.splitType, category: e.category, createdAt: e.createdAt || undefined,
      payer: dispMember(ml, e.payerId, meUid, myName, e.payerName),
      parts: (e.partIds && e.partIds.length)
        ? e.partIds.map((pid, i) => dispMember(ml, pid, meUid, myName, e.partNames[i]))
        : (e.partNames || []).map((n) => norm(n, myName)),
    }));
    const pays = await api.expensesApi.fetchPayments(id);
    const paymentsG = pays.map((p: any) => ({
      id: p.id, amt: Number(p.amount), currency: (p.currency || 'CZK') as Transfer['currency'], createdAt: p.created_at || undefined,
      from: dispMember(ml, p.from_id || null, meUid, myName, p.from_name),
      to: dispMember(ml, p.to_id || null, meUid, myName, p.to_name),
    }));
    setState((s) => ({ ...s, expenses: { ...s.expenses, [id]: expensesG }, payments: { ...s.payments, [id]: paymentsG } }));
  }

  // Pro pull-to-refresh (stažení prstem). V lokálním režimu není co načítat.
  function refreshGroup(id: string) {
    if (!CLOUD_MODE) return Promise.resolve();
    return reloadGroup(id).catch(() => {});
  }

  // ---------- navigace ke skupinám ----------
  function openGroup(id: string) {
    setState((s) => ({ ...s, screen: 'group', selectedGroup: id, bubble: bubbleFor({ ...s, selectedGroup: id }, 'group'), bubbleKey: s.bubbleKey + 1 }));
    if (CLOUD_MODE) reloadGroup(id).catch(() => {});
  }

  function startAdd() {
    setState((s) => {
      const g = s.groups.find((x) => x.id === s.selectedGroup) || s.groups[0];
      if (!g) {
        return { ...s, screen: 'create_group', newGroupName: '', newGroupMembers: ['Já'], newMemberInput: '', bubble: bubbleFor(s, 'create_group'), bubbleKey: s.bubbleKey + 1 };
      }
      return {
        ...s, screen: 'add', selectedGroup: g.id, editingExpenseId: null, addDesc: '', addAmount: '', addPayer: 'Já',
        addParts: g.members.slice(), addPhoto: null, addCurrency: 'CZK', addSplitType: 'equal', addShares: {}, addCategory: 'ostatni',
        bubble: bubbleFor(s, 'add'), bubbleKey: s.bubbleKey + 1,
      };
    });
  }

  // Úprava existujícího výdaje – předvyplní formulář a otevře ho v "edit" režimu
  function startEdit(id: string) {
    setState((s) => {
      const e = (s.expenses[s.selectedGroup!] || []).find((x) => x.id === id);
      if (!e) return s;
      // Předvyplnění dílčích částek (u poměrově/podle cen) z uložených shares
      const shares: Record<string, string> = {};
      if (e.shares && e.shares.length === (e.parts || []).length) {
        e.parts.forEach((p, i) => { shares[p] = String(Math.round(Number(e.shares![i]))); });
      }
      return {
        ...s, screen: 'add', editingExpenseId: id,
        addDesc: e.desc, addAmount: String(e.amount), addPayer: e.payer,
        addParts: (e.parts || []).slice(), addPhoto: e.photo || null,
        addCurrency: e.currency || 'CZK', addSplitType: e.splitType || 'equal', addShares: shares, addCategory: e.category || 'ostatni',
        bubble: bubbleFor(s, 'add'), bubbleKey: s.bubbleKey + 1,
      };
    });
  }

  // ---------- výdaje ----------
  // Z formuláře spočítá účastníky (parts) a jejich částky (shares) podle režimu dělení.
  // Vrací null, když data nejsou validní (např. "podle cen" nesedí na součet).
  function resolveSplit(s: AppState, amt: number) {
    const group = s.groups.find((g) => g.id === s.selectedGroup);
    const members = group ? group.members : [];
    if (s.addSplitType === 'equal') {
      return s.addParts.length ? { parts: s.addParts.slice(), shares: null } : null;
    }
    if (s.addSplitType === 'ratio') {
      const parts = members.filter((m) => Number(s.addShares[m] || 0) > 0);
      const weights = parts.map((m) => Number(s.addShares[m]));
      const W = weights.reduce((a, b) => a + b, 0);
      if (!parts.length || W <= 0) return null;
      return { parts, shares: weights.map((w) => (amt * w) / W) };
    }
    // exact = "podle cen" – součet musí sednout na částku
    const parts = members.filter((m) => Number(s.addShares[m] || 0) > 0);
    const shares = parts.map((m) => Number(s.addShares[m]));
    const sum = shares.reduce((a, b) => a + b, 0);
    if (!parts.length || Math.round(sum) !== Math.round(amt)) return null;
    return { parts, shares };
  }

  async function submitExpense() {
    const s = stateRef.current;
    const amt = Number(s.addAmount);
    if (!s.addDesc || !amt || amt <= 0) return;
    const split = resolveSplit(s, amt);
    if (!split) return;
    const editing = s.editingExpenseId;
    const line = editing
      ? pick(['Opraveno. Jako bych se nesplet.', 'Upraveno. Chyba lávky.', 'Hotovo, přepsáno.'])
      : pick(['Sorry jako, zapsáno!', 'Já jsem to nečet, ale zapsal jsem to.', 'Přidáno. Jsme premianti.']);
    const okMsg = editing ? 'Výdaj upraven' : 'Výdaj přidán';
    // Reakce maskota: zaplatil jsem já = radost (ostatní mi dluží), jsem účastník = mračí se (dluh roste)
    const iPaid = s.addPayer === 'Já';
    const involvesMe = split.parts.indexOf('Já') >= 0;
    const newMood: AppState['mascotMood'] = editing ? 'neutral' : (iPaid ? 'happy' : (involvesMe ? 'sad' : 'neutral'));

    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        // Nahrát foto jen když je nové (lokální soubor). Existující URL (http…) necháme být.
        let photoUrl = s.addPhoto;
        if (s.addPhoto && !/^https?:\/\//.test(s.addPhoto)) {
          photoUrl = await api.storageApi.uploadReceipt(s.addPhoto, s.selectedGroup!);
        }
        const ml = s.groups.find((g) => g.id === s.selectedGroup)?.memberList;
        const payload = {
          description: s.addDesc, amount: amt,
          payer: denorm(s.addPayer, s.myName), parts: split.parts.map((p) => denorm(p, s.myName)),
          payerId: idForMember(ml, s.addPayer, s.meUid), partIds: split.parts.map((p) => idForMember(ml, p, s.meUid)),
          photo: photoUrl, currency: s.addCurrency, shares: split.shares, splitType: s.addSplitType, category: s.addCategory,
        };
        if (editing) await api.expensesApi.updateExpense(editing, payload);
        else await api.expensesApi.addExpense({ groupId: s.selectedGroup!, ...payload });
        await reloadGroup(s.selectedGroup!);
        setState((x) => ({ ...x, busy: false, editingExpenseId: null, screen: 'group', bubble: line, bubbleKey: x.bubbleKey + 1 }));
        tapSuccess();
        if (newMood !== 'neutral') flashMood(newMood);
        showToast(okMsg);
        // Notifikace ostatním členům (jen u nového výdaje)
        if (!editing) {
          const actor = s.addPayer === 'Já' ? s.myName : s.addPayer;
          const gname = s.groups.find((g) => g.id === s.selectedGroup)?.name || 'skupině';
          api.pushApi.groupPushTokens(s.selectedGroup!)
            .then((toks) => sendPush(toks, 'Nový výdaj v ' + gname, actor + ' přidal „' + s.addDesc + '" · ' + fmtMoney(amt, s.addCurrency)))
            .catch(() => {});
        }
      } catch (e) {
        setState((x) => ({ ...x, busy: false }));
        showToast('Výdaj se nepodařilo uložit');
      }
      return;
    }

    setState((x) => {
      const expenses = { ...x.expenses };
      const gid = x.selectedGroup!;
      const listG = expenses[gid] || [];
      const fields = { desc: x.addDesc, payer: x.addPayer, amount: amt, parts: split.parts.slice(), photo: x.addPhoto || null, currency: x.addCurrency, shares: split.shares, splitType: x.addSplitType, category: x.addCategory };
      if (editing) {
        expenses[gid] = listG.map((e) => (e.id === editing ? { ...e, ...fields } : e));
      } else {
        expenses[gid] = [{ id: 'x' + Date.now(), ...fields }].concat(listG);
      }
      return { ...x, expenses, editingExpenseId: null, screen: 'group', bubble: line, bubbleKey: x.bubbleKey + 1 };
    });
    tapSuccess();
    if (newMood !== 'neutral') flashMood(newMood);
    showToast(okMsg);
  }

  function openExpense(id: string) {
    setState((s) => ({ ...s, screen: 'expense', selectedExpense: id, bubble: bubbleFor(s, 'group'), bubbleKey: s.bubbleKey + 1 }));
  }

  async function deleteExpense(id: string) {
    const s = stateRef.current;
    if (CLOUD_MODE) {
      try {
        await api.expensesApi.deleteExpense(id);
        await reloadGroup(s.selectedGroup!);
        setState((x) => ({ ...x, screen: 'group' }));
        showToast('Výdaj smazán');
      } catch (e) { showToast('Smazání selhalo'); }
      return;
    }
    setState((x) => {
      const expenses = { ...x.expenses };
      const gid = x.selectedGroup!;
      expenses[gid] = (expenses[gid] || []).filter((e) => e.id !== id);
      return { ...x, expenses, screen: 'group' };
    });
    showToast('Výdaj smazán');
  }

  // Smazání skupiny – v cloudu řešeno archivací (zmizí všem členům i z přehledu)
  async function deleteGroup(id: string) {
    const s = stateRef.current;
    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        await api.groupsApi.archiveGroup(id);
      } catch (e) {
        setState((x) => ({ ...x, busy: false }));
        showToast('Smazání skupiny selhalo');
        return;
      }
      try {
        const data = await fetchEverything(s.meUid!, s.myName);
        setState((x) => ({ ...x, ...data, busy: false, selectedGroup: null, screen: 'overview', bubble: bubbleFor({ ...x, ...data }, 'overview'), bubbleKey: x.bubbleKey + 1 }));
      } catch (e) {
        setState((x) => ({ ...x, busy: false, selectedGroup: null, screen: 'overview' }));
      }
      showToast('Skupina smazána');
      return;
    }
    setState((x) => {
      const groups = x.groups.filter((g) => g.id !== id);
      const expenses = { ...x.expenses }; delete expenses[id];
      const payments = { ...x.payments }; delete payments[id];
      return { ...x, groups, expenses, payments, selectedGroup: null, screen: 'overview', bubble: bubbleFor(x, 'overview'), bubbleKey: x.bubbleKey + 1 };
    });
    showToast('Skupina smazána');
  }

  // Změna mého zobrazovaného jména (i v historických výdajích – řeší serverová funkce)
  async function setMyName(rawName: string) {
    const name = (rawName || '').trim();
    const s = stateRef.current;
    if (!name || name === s.myName) return;
    if (!CLOUD_MODE) { showToast('Jméno se nastaví až po přihlášení'); return; }
    setState((x) => ({ ...x, busy: true }));
    try {
      await api.authApi.setMyName(name);
      if (meRef.current) meRef.current = { ...meRef.current, myName: name };
      const data = await fetchEverything(s.meUid!, name);
      setState((x) => ({ ...x, ...data, myName: name, busy: false, bubble: bubbleFor(x, 'profile'), bubbleKey: x.bubbleKey + 1 }));
      showToast('Jméno změněno na ' + name);
    } catch (e: any) {
      setState((x) => ({ ...x, busy: false }));
      showToast(/unique|duplicate/i.test(e.message || '') ? 'To jméno už ve skupině někdo má' : 'Změna jména selhala');
    }
  }

  // ---------- platby / vyrovnání ----------
  async function payDebt(d: Transfer) {
    const line = pick(['Zaplaceno. Jsme premianti!', 'Bude líp, o korunu míň.', 'Sorry jako, zaplaceno.']);
    if (CLOUD_MODE) {
      try {
        const s = stateRef.current;
        const ml = s.groups.find((g) => g.id === d.groupId)?.memberList;
        await api.expensesApi.addPayment({
          groupId: d.groupId, fromName: denorm(d.from, s.myName), toName: denorm(d.to, s.myName),
          fromId: idForMember(ml, d.from, s.meUid), toId: idForMember(ml, d.to, s.meUid),
          amount: d.amt, currency: d.currency || 'CZK',
        });
        await reloadGroup(d.groupId);
        setState((x) => ({ ...x, coins: true, bubble: line, bubbleKey: x.bubbleKey + 1 }));
        // Notifikace ostatním členům o vyrovnání
        const actor = d.from === 'Já' ? s.myName : d.from;
        api.pushApi.groupPushTokens(d.groupId)
          .then((toks) => sendPush(toks, 'Vyrovnání dluhu', actor + ' → ' + d.to + ': ' + fmtMoney(d.amt, d.currency || 'CZK')))
          .catch(() => {});
      } catch (e) { showToast('Platba selhala'); return; }
    } else {
      setState((s) => {
        const list = (s.payments[d.groupId] || []).concat([{ id: 'pay' + Date.now(), from: d.from, to: d.to, amt: d.amt, currency: d.currency || 'CZK' }]);
        return { ...s, payments: { ...s.payments, [d.groupId]: list }, coins: true, bubble: line, bubbleKey: s.bubbleKey + 1 };
      });
    }
    tapSuccess();
    flashMood('happy');
    showToast('Zaplaceno');
    clearTimeout(coinsTimer.current);
    coinsTimer.current = setTimeout(() => setState((s) => ({ ...s, coins: false })), 1500);
  }

  // Easter egg: 5 rychlých šťouchnutí do maskota → speciální hláška + déšť mincí
  function pokeMascot() {
    pokeCount.current += 1;
    clearTimeout(pokeTimer.current);
    pokeTimer.current = setTimeout(() => { pokeCount.current = 0; }, 2500);
    if (pokeCount.current < 5) return;
    pokeCount.current = 0;
    const line = pick(QUIPS_EGG);
    setState((s) => ({ ...s, coins: true, bubble: line, bubbleKey: s.bubbleKey + 1 }));
    flashMood('happy');
    clearTimeout(coinsTimer.current);
    coinsTimer.current = setTimeout(() => setState((s) => ({ ...s, coins: false })), 1500);
  }

  // Otevře parodickou „dotační smlouvu" pro daný dluh
  function openContract(d: Transfer) {
    setState((s) => ({ ...s, selectedDebt: d, screen: 'smlouva', bubble: bubbleFor(s, 'smlouva'), bubbleKey: s.bubbleKey + 1 }));
  }

  // ---------- nastavení ----------
  function setTheme(t: AppState['userTheme']) { patch({ userTheme: t }); }
  // Změna velikosti obsahu: nastav globální násobič a vynuť překreslení (změna stavu).
  function setContentSize(cs: AppState['contentSize']) {
    setGlobalFontScale(CONTENT_SCALE[cs] || 1);
    setState((s) => ({ ...s, contentSize: cs, bubbleKey: s.bubbleKey + 1 }));
  }

  // Zapnutí/vypnutí biometrického zámku. Zapnutí si vyžádá ověření (ať se
  // nikdo nezamkne omylem na zařízení, kde biometrika nefunguje).
  async function setBioLock(v: boolean) {
    if (v) {
      try {
        const hw = await LocalAuth.hasHardwareAsync();
        const enrolled = hw && (await LocalAuth.isEnrolledAsync());
        if (!hw || !enrolled) { showToast('Biometrika není na zařízení nastavená'); return; }
        const res = await LocalAuth.authenticateAsync({ promptMessage: 'Potvrď zapnutí zámku', cancelLabel: 'Zrušit' });
        if (!res.success) return;
      } catch (e) { return; }
    }
    patch({ bioLock: v });
    showToast(v ? 'Zámek zapnut' : 'Zámek vypnut');
  }

  // Odemknutí zamčené appky biometrikou (s fallbackem na PIN zařízení)
  async function unlockApp() {
    try {
      const res = await LocalAuth.authenticateAsync({ promptMessage: 'Odemkni Dotačník', cancelLabel: 'Zrušit' });
      if (res.success) setState((s) => ({ ...s, locked: false }));
    } catch (e) {}
  }
  function toggleSet(k: keyof AppState['toggles']) { setState((s) => ({ ...s, toggles: { ...s.toggles, [k]: !s.toggles[k] } })); }
  function setPayer(n: string) { patch({ addPayer: n }); }
  function togglePart(n: string) {
    setState((s) => {
      const has = s.addParts.indexOf(n) >= 0;
      return { ...s, addParts: has ? s.addParts.filter((x) => x !== n) : s.addParts.concat([n]) };
    });
  }
  function setCurrency(cur: AppState['addCurrency']) { patch({ addCurrency: cur }); }
  function setSplitType(t: AppState['addSplitType']) { patch({ addSplitType: t }); }
  function setCategory(k: string) { patch({ addCategory: k }); }
  function setShare(name: string, value: string) {
    const v = (value || '').replace(/[^0-9]/g, '');
    setState((s) => ({ ...s, addShares: { ...s.addShares, [name]: v } }));
  }

  // ---------- přihlášení ----------
  async function doRegister() {
    const s = stateRef.current;
    if (!s.regEmail || s.regPassword.length < 6) return;
    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        await api.authApi.signUpWithEmail(s.regEmail, s.regPassword);
        const session = await api.authApi.getSession();
        setState((x) => ({ ...x, busy: false }));
        if (session) await finishLogin();
        else showToast('Zkontroluj e-mail pro potvrzení');
      } catch (e: any) {
        setState((x) => ({ ...x, busy: false }));
        showToast(e.message?.includes('registered') ? 'Účet už existuje' : 'Registrace selhala');
      }
      return;
    }
    setState((x) => ({ ...x, screen: 'overview', bubble: bubbleFor(x, 'overview'), bubbleKey: x.bubbleKey + 1 }));
    showToast('Vítej, motýle!');
  }

  async function doLogin() {
    const s = stateRef.current;
    if (!s.loginEmail || !s.loginPassword) return;
    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        await api.authApi.signInWithEmail(s.loginEmail, s.loginPassword);
        setState((x) => ({ ...x, busy: false }));
        await finishLogin();
      } catch (e) {
        setState((x) => ({ ...x, busy: false }));
        showToast('Špatný e-mail nebo heslo');
      }
      return;
    }
    setState((x) => ({ ...x, screen: 'overview', bubble: bubbleFor(x, 'overview'), bubbleKey: x.bubbleKey + 1 }));
    showToast('Přihlášení úspěšné');
  }

  async function enterGoogle() {
    if (CLOUD_MODE) {
      try {
        const session = await api.authApi.signInWithGoogle();
        if (session) await finishLogin();
      } catch (e) { showToast('Přihlášení Googlem selhalo'); }
      return;
    }
    navigate('overview');
  }

  async function logout() {
    const uid = stateRef.current.meUid;
    if (CLOUD_MODE) { try { await api.authApi.signOut(); } catch (e) {} }
    if (uid) AsyncStorage.removeItem(cacheKey(uid)).catch(() => {});
    meRef.current = null;
    // bioLock se po odhlášení vypíná (chránil data přihlášeného uživatele)
    setState((s) => ({ ...makeInitialState(), userTheme: s.userTheme, contentSize: s.contentSize, toggles: s.toggles, googleEnabled: s.googleEnabled, bioAvailable: s.bioAvailable }));
  }

  async function deleteAccount() {
    const uid = stateRef.current.meUid;
    if (CLOUD_MODE) {
      try { await api.authApi.deleteAccount(); }
      catch (e) { showToast('Smazání účtu selhalo'); return; }
    }
    if (uid) AsyncStorage.removeItem(cacheKey(uid)).catch(() => {});
    meRef.current = null;
    setState((s) => ({ ...makeInitialState(), userTheme: s.userTheme, contentSize: s.contentSize, toggles: s.toggles, googleEnabled: s.googleEnabled, bioAvailable: s.bioAvailable }));
    showToast('Účet smazán');
  }

  // ---------- připojení do skupiny přes kód / odkaz ----------
  function startJoin() {
    setState((s) => ({ ...s, screen: 'join', joinCodeInput: '', bubble: bubbleFor(s, 'join'), bubbleKey: s.bubbleKey + 1 }));
  }

  function submitJoin() {
    joinByCode(stateRef.current.joinCodeInput);
  }

  // Vstupní bod připojení: načte náhled skupiny a nechá vybrat "kdo jsem".
  // Když už jsem členem, otevře skupinu rovnou.
  async function joinByCode(rawCode: string) {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) return;
    if (!CLOUD_MODE) { showToast('Sdílení funguje jen s přihlášením'); return; }
    const me = meRef.current || (stateRef.current.meUid ? { uid: stateRef.current.meUid, myName: stateRef.current.myName } : null);
    if (!me) { pendingJoin.current = code; navigate('onboarding'); showToast('Přihlas se a hned tě připojím'); return; }
    setState((x) => ({ ...x, busy: true }));
    try {
      const preview = await api.groupsApi.groupPreview(code);
      if (!preview) throw new Error('not found');
      // Už jsem členem → rovnou do skupiny
      if (preview.members.some((m: any) => m.isMe)) {
        const data = await fetchEverything(me.uid, me.myName);
        setState((x) => ({ ...x, ...data, busy: false, joinCodeInput: '', screen: 'group', selectedGroup: preview.groupId, bubble: bubbleFor({ ...x, ...data }, 'group'), bubbleKey: x.bubbleKey + 1 }));
        showToast('Vítej zpátky!');
        return;
      }
      setState((x) => ({
        ...x, busy: false, joinCodeInput: '', screen: 'choose_identity',
        joinPreview: { code, groupId: preview.groupId, groupName: preview.groupName, members: preview.members },
        bubble: bubbleFor(x, 'choose_identity'), bubbleKey: x.bubbleKey + 1,
      }));
    } catch (e) {
      setState((x) => ({ ...x, busy: false }));
      showToast('Skupina s tímto kódem nenalezena');
    }
  }

  // Dokončení připojení – buď zaberu existující jméno (claimName), nebo přidám nové (newName)
  async function finishJoin({ claimName, newName }: { claimName?: string; newName?: string }) {
    const s = stateRef.current;
    const p = s.joinPreview;
    if (!p) return;
    const me = meRef.current || { uid: s.meUid, myName: s.myName };
    setState((x) => ({ ...x, busy: true }));
    try {
      const gid = await api.groupsApi.joinGroupChoose(p.code, claimName || null, newName || null);
      const data = await fetchEverything(me.uid!, me.myName);
      setState((x) => ({ ...x, ...data, busy: false, joinPreview: null, screen: 'group', selectedGroup: gid, bubble: bubbleFor({ ...x, ...data }, 'group'), bubbleKey: x.bubbleKey + 1 }));
      showToast('Připojeno do skupiny!');
    } catch (e: any) {
      setState((x) => ({ ...x, busy: false }));
      showToast(e.message === 'Tohle jméno už někdo zabral' ? 'To jméno už někdo zabral' : 'Připojení selhalo');
    }
  }

  // ---------- skupiny ----------
  function startCreateGroup() {
    setState((s) => ({ ...s, screen: 'create_group', newGroupName: '', newGroupMembers: ['Já'], newMemberInput: '', bubble: bubbleFor(s, 'create_group'), bubbleKey: s.bubbleKey + 1 }));
  }

  function addMember() {
    setState((s) => {
      const name = s.newMemberInput.trim();
      if (!name || s.newGroupMembers.indexOf(name) >= 0) return s;
      return { ...s, newGroupMembers: s.newGroupMembers.concat([name]), newMemberInput: '' };
    });
  }

  function removeMember(name: string) {
    if (name === 'Já') return;
    setState((s) => ({ ...s, newGroupMembers: s.newGroupMembers.filter((m) => m !== name) }));
  }

  async function createGroup() {
    const s = stateRef.current;
    const name = s.newGroupName.trim();
    const members = s.newGroupMembers;
    if (!name || members.length < 2) return;

    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        const realMembers = members.map((m: string) => denorm(m, s.myName));
        const g = await api.groupsApi.createGroup(name, realMembers, s.myName);
        const data = await fetchEverything(s.meUid!, s.myName);
        setState((x) => ({ ...x, ...data, busy: false, selectedGroup: g.id, shareCode: g.shareCode, screen: 'share_group', bubble: bubbleFor({ ...x, ...data }, 'share_group'), bubbleKey: x.bubbleKey + 1 }));
      } catch (e) {
        setState((x) => ({ ...x, busy: false }));
        showToast('Skupinu se nepodařilo vytvořit');
      }
      return;
    }

    const id = 'g' + Date.now();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setState((x) => ({
      ...x, groups: x.groups.concat([{ id, name, members: members.slice() }]),
      expenses: { ...x.expenses, [id]: [] }, selectedGroup: id, shareCode: code,
      screen: 'share_group', bubble: bubbleFor(x, 'share_group'), bubbleKey: x.bubbleKey + 1,
    }));
  }

  const actions: Actions = {
    patch, showToast, navigate, goBack, openGroup, startAdd, startEdit, submitExpense, payDebt,
    openContract, pokeMascot, setTheme, setContentSize, setBioLock, unlockApp, toggleSet, setPayer, togglePart, setCurrency, setSplitType, setCategory, setShare, doRegister, doLogin, enterGoogle, logout,
    startCreateGroup, addMember, removeMember, createGroup, openExpense, deleteExpense, deleteGroup,
    deleteAccount, startJoin, submitJoin, joinByCode, finishJoin, setMyName,
    refreshAll, refreshGroup,
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp musí být uvnitř AppProvider');
  return ctx;
}
