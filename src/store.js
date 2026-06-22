// Globální stav aplikace (kontext). Dva režimy:
//  - CLOUD_MODE: data čte/zapisuje do Supabase (sdílené mezi zařízeními i členy)
//  - lokální: data jen v telefonu (AsyncStorage), když nejsou klíče
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { INITIAL_GROUPS, INITIAL_EXPENSES } from './data';
import { bubbleFor, pick } from './logic';
import { isSupabaseConfigured, supabase } from './supabase';
import * as api from './api';

export const CLOUD_MODE = isSupabaseConfigured;
export { api };

const STORAGE_KEY = '@babisovnik/state-v2';
const AppContext = createContext(null);

// Mapování "Já" (přihlášený) <-> reálné jméno uložené v databázi
const denorm = (name, myName) => (name === 'Já' ? myName : name);
const norm = (name, myName) => (name === myName ? 'Já' : name);

function makeInitialState() {
  return {
    screen: 'onboarding',
    selectedGroup: null,
    selectedExpense: null,
    bubble: 'Čau lidi!',
    bubbleKey: 1,
    toast: null,
    coins: false,
    busy: false, // probíhá síťová operace
    googleEnabled: false, // zda je Google login v Supabase zapnutý
    meUid: null,
    myName: 'Já',
    userTheme: 'zluta',
    toggles: { notif: true, sound: false },
    regEmail: '', regPassword: '',
    loginEmail: '', loginPassword: '',
    addDesc: '', addAmount: '', addPayer: 'Já', addParts: [], addPhoto: null,
    newGroupName: '', newGroupMembers: ['Já'], newMemberInput: '',
    shareCode: null,
    joinCodeInput: '',
    groups: INITIAL_GROUPS,
    expenses: INITIAL_EXPENSES,
    payments: {},
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useState(makeInitialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const toastTimer = useRef(null);
  const coinsTimer = useRef(null);
  const loaded = useRef(false);
  const meRef = useRef(null);        // {uid, myName} – spolehlivé čtení v async akcích
  const pendingJoin = useRef(null);  // kód pozvánky čekající na přihlášení

  // ---------- start: nastavení / přihlášení ----------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setState((s) => ({
            ...s,
            userTheme: saved.userTheme || s.userTheme,
            toggles: saved.toggles || s.toggles,
            // lokální data se obnoví jen v lokálním režimu
            groups: CLOUD_MODE ? s.groups : (saved.groups || s.groups),
            expenses: CLOUD_MODE ? s.expenses : (saved.expenses || s.expenses),
            payments: CLOUD_MODE ? s.payments : (saved.payments || s.payments),
          }));
        }
      } catch (e) {}
      loaded.current = true;

      // Pozvánka z odkazu (capidluh://join/KÓD) – zachytíme i při startu
      try {
        const initialUrl = await Linking.getInitialURL();
        const code = parseJoinCode(initialUrl);
        if (code) pendingJoin.current = code;
      } catch (e) {}

      if (CLOUD_MODE) {
        try {
          const ge = await api.authApi.isGoogleEnabled();
          setState((s) => ({ ...s, googleEnabled: ge }));
        } catch (e) {}
        try {
          const session = await api.authApi.getSession();
          if (session) await finishLogin();
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

  function parseJoinCode(url) {
    if (!url) return null;
    const m = /join\/([A-Za-z0-9]+)/.exec(url);
    return m ? m[1].toUpperCase() : null;
  }

  // ukládání perzistentní části
  useEffect(() => {
    if (!loaded.current) return;
    const slice = CLOUD_MODE
      ? { userTheme: state.userTheme, toggles: state.toggles }
      : { userTheme: state.userTheme, toggles: state.toggles, groups: state.groups, expenses: state.expenses, payments: state.payments };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(slice)).catch(() => {});
  }, [state.groups, state.expenses, state.payments, state.userTheme, state.toggles]);

  // ---------- pomocné ----------
  function patch(p) { setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })); }

  function showToast(text) {
    setState((s) => ({ ...s, toast: text }));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: null })), 2200);
  }

  function navigate(screen) {
    setState((s) => ({ ...s, screen, bubble: bubbleFor(s, screen), bubbleKey: s.bubbleKey + 1 }));
    if (CLOUD_MODE && screen === 'overview') refreshAll();
  }

  async function getMe() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const myName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Já');
    return { uid: user.id, myName };
  }

  // Načte vše z cloudu a převede jména na "Já" perspektivu
  async function fetchEverything(uid, myName) {
    const rawGroups = await api.groupsApi.fetchGroups();
    const groups = rawGroups.map((g) => ({
      id: g.id, name: g.name, shareCode: g.shareCode,
      members: g.members.map((m) => (m.userId === uid ? 'Já' : m.name)),
    }));
    const expenses = {};
    const payments = {};
    await Promise.all(rawGroups.map(async (g) => {
      const ex = await api.expensesApi.fetchExpenses(g.id);
      expenses[g.id] = ex.map((e) => ({ ...e, payer: norm(e.payer, myName), parts: (e.parts || []).map((p) => norm(p, myName)) }));
      const pays = await api.expensesApi.fetchPayments(g.id);
      payments[g.id] = pays.map((p) => ({ id: p.id, from: norm(p.from_name, myName), to: norm(p.to_name, myName), amt: Number(p.amount) }));
    }));
    return { groups, expenses, payments };
  }

  async function finishLogin() {
    const me = await getMe();
    meRef.current = me;
    await api.authApi.ensureProfile(me.myName);
    const data = await fetchEverything(me.uid, me.myName);
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

  async function refreshAll() {
    const { meUid, myName } = stateRef.current;
    if (!meUid) return;
    try {
      const data = await fetchEverything(meUid, myName);
      setState((s) => ({ ...s, ...data }));
    } catch (e) {}
  }

  async function reloadGroup(id) {
    const { myName } = stateRef.current;
    const ex = await api.expensesApi.fetchExpenses(id);
    const expensesG = ex.map((e) => ({ ...e, payer: norm(e.payer, myName), parts: (e.parts || []).map((p) => norm(p, myName)) }));
    const pays = await api.expensesApi.fetchPayments(id);
    const paymentsG = pays.map((p) => ({ id: p.id, from: norm(p.from_name, myName), to: norm(p.to_name, myName), amt: Number(p.amount) }));
    setState((s) => ({ ...s, expenses: { ...s.expenses, [id]: expensesG }, payments: { ...s.payments, [id]: paymentsG } }));
  }

  // ---------- navigace ke skupinám ----------
  function openGroup(id) {
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
        ...s, screen: 'add', selectedGroup: g.id, addDesc: '', addAmount: '', addPayer: 'Já',
        addParts: g.members.slice(), addPhoto: null, bubble: bubbleFor(s, 'add'), bubbleKey: s.bubbleKey + 1,
      };
    });
  }

  // ---------- výdaje ----------
  async function submitExpense() {
    const s = stateRef.current;
    const amt = Number(s.addAmount);
    if (!s.addDesc || !amt || amt <= 0 || !s.addParts.length) return;
    const line = pick(['Sorry jako, zapsáno!', 'Já jsem to nečet, ale zapsal jsem to.', 'Přidáno. Jsme premianti.']);

    if (CLOUD_MODE) {
      setState((x) => ({ ...x, busy: true }));
      try {
        let photoUrl = null;
        if (s.addPhoto) photoUrl = await api.storageApi.uploadReceipt(s.addPhoto, s.selectedGroup);
        await api.expensesApi.addExpense({
          groupId: s.selectedGroup, description: s.addDesc, amount: amt,
          payer: denorm(s.addPayer, s.myName), parts: s.addParts.map((p) => denorm(p, s.myName)), photo: photoUrl,
        });
        await reloadGroup(s.selectedGroup);
        setState((x) => ({ ...x, busy: false, screen: 'group', bubble: line, bubbleKey: x.bubbleKey + 1 }));
        showToast('Výdaj přidán');
      } catch (e) {
        setState((x) => ({ ...x, busy: false }));
        showToast('Výdaj se nepodařilo uložit');
      }
      return;
    }

    setState((x) => {
      const expenses = { ...x.expenses };
      const newEx = { id: 'x' + Date.now(), desc: x.addDesc, payer: x.addPayer, amount: amt, parts: x.addParts.slice(), photo: x.addPhoto || null };
      expenses[x.selectedGroup] = [newEx].concat(expenses[x.selectedGroup] || []);
      return { ...x, expenses, screen: 'group', bubble: line, bubbleKey: x.bubbleKey + 1 };
    });
    showToast('Výdaj přidán');
  }

  function openExpense(id) {
    setState((s) => ({ ...s, screen: 'expense', selectedExpense: id, bubble: bubbleFor(s, 'group'), bubbleKey: s.bubbleKey + 1 }));
  }

  async function deleteExpense(id) {
    const s = stateRef.current;
    if (CLOUD_MODE) {
      try {
        await api.expensesApi.deleteExpense(id);
        await reloadGroup(s.selectedGroup);
        setState((x) => ({ ...x, screen: 'group' }));
        showToast('Výdaj smazán');
      } catch (e) { showToast('Smazání selhalo'); }
      return;
    }
    setState((x) => {
      const expenses = { ...x.expenses };
      expenses[x.selectedGroup] = (expenses[x.selectedGroup] || []).filter((e) => e.id !== id);
      return { ...x, expenses, screen: 'group' };
    });
    showToast('Výdaj smazán');
  }

  // ---------- platby / vyrovnání ----------
  async function payDebt(d) {
    const line = pick(['Zaplaceno. Jsme premianti!', 'Bude líp, o korunu míň.', 'Sorry jako, zaplaceno.']);
    if (CLOUD_MODE) {
      try {
        const s = stateRef.current;
        await api.expensesApi.addPayment({ groupId: d.groupId, fromName: denorm(d.from, s.myName), toName: denorm(d.to, s.myName), amount: d.amt });
        await reloadGroup(d.groupId);
        setState((x) => ({ ...x, coins: true, bubble: line, bubbleKey: x.bubbleKey + 1 }));
      } catch (e) { showToast('Platba selhala'); return; }
    } else {
      setState((s) => {
        const list = (s.payments[d.groupId] || []).concat([{ id: 'pay' + Date.now(), from: d.from, to: d.to, amt: d.amt }]);
        return { ...s, payments: { ...s.payments, [d.groupId]: list }, coins: true, bubble: line, bubbleKey: s.bubbleKey + 1 };
      });
    }
    showToast('Zaplaceno');
    clearTimeout(coinsTimer.current);
    coinsTimer.current = setTimeout(() => setState((s) => ({ ...s, coins: false })), 1500);
  }

  // ---------- nastavení ----------
  function setTheme(t) { patch({ userTheme: t }); }
  function toggleSet(k) { setState((s) => ({ ...s, toggles: { ...s.toggles, [k]: !s.toggles[k] } })); }
  function setPayer(n) { patch({ addPayer: n }); }
  function togglePart(n) {
    setState((s) => {
      const has = s.addParts.indexOf(n) >= 0;
      return { ...s, addParts: has ? s.addParts.filter((x) => x !== n) : s.addParts.concat([n]) };
    });
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
      } catch (e) {
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
    if (CLOUD_MODE) { try { await api.authApi.signOut(); } catch (e) {} }
    meRef.current = null;
    setState((s) => ({ ...makeInitialState(), userTheme: s.userTheme, toggles: s.toggles, googleEnabled: s.googleEnabled }));
  }

  async function deleteAccount() {
    if (CLOUD_MODE) {
      try { await api.authApi.deleteAccount(); }
      catch (e) { showToast('Smazání účtu selhalo'); return; }
    }
    meRef.current = null;
    setState((s) => ({ ...makeInitialState(), userTheme: s.userTheme, toggles: s.toggles, googleEnabled: s.googleEnabled }));
    showToast('Účet smazán');
  }

  // ---------- připojení do skupiny přes kód / odkaz ----------
  function startJoin() {
    setState((s) => ({ ...s, screen: 'join', joinCodeInput: '', bubble: bubbleFor(s, 'join'), bubbleKey: s.bubbleKey + 1 }));
  }

  function submitJoin() {
    joinByCode(stateRef.current.joinCodeInput);
  }

  async function joinByCode(rawCode) {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) return;
    if (!CLOUD_MODE) { showToast('Sdílení funguje jen s přihlášením'); return; }
    const me = meRef.current || (stateRef.current.meUid ? { uid: stateRef.current.meUid, myName: stateRef.current.myName } : null);
    if (!me) { pendingJoin.current = code; navigate('onboarding'); showToast('Přihlas se a hned tě připojím'); return; }
    setState((x) => ({ ...x, busy: true }));
    try {
      const gid = await api.groupsApi.joinGroupByCode(code);
      const data = await fetchEverything(me.uid, me.myName);
      setState((x) => ({ ...x, ...data, busy: false, joinCodeInput: '', screen: 'group', selectedGroup: gid, bubble: bubbleFor({ ...x, ...data }, 'group'), bubbleKey: x.bubbleKey + 1 }));
      showToast('Připojeno do skupiny!');
    } catch (e) {
      setState((x) => ({ ...x, busy: false }));
      showToast('Skupina s tímto kódem nenalezena');
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

  function removeMember(name) {
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
        const realMembers = members.map((m) => denorm(m, s.myName));
        const g = await api.groupsApi.createGroup(name, realMembers, s.myName);
        const data = await fetchEverything(s.meUid, s.myName);
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

  const actions = {
    patch, showToast, navigate, openGroup, startAdd, submitExpense, payDebt,
    setTheme, toggleSet, setPayer, togglePart, doRegister, doLogin, enterGoogle, logout,
    startCreateGroup, addMember, removeMember, createGroup, openExpense, deleteExpense,
    deleteAccount, startJoin, submitJoin, joinByCode,
  };

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp musí být uvnitř AppProvider');
  return ctx;
}
