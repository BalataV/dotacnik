// Centrální typy doménového modelu + globálního stavu a akcí.

export type CurrencyCode = 'CZK' | 'EUR' | 'USD';
export type SplitType = 'equal' | 'ratio' | 'exact';
export type ThemeName = 'zluta' | 'modra' | 'tmava';
export type ContentSize = 'small' | 'medium' | 'large';
export type MascotMood = 'neutral' | 'happy' | 'sad';

export type ScreenName =
  | 'onboarding' | 'register_email' | 'login' | 'reset_password' | 'overview' | 'create_group'
  | 'share_group' | 'join' | 'choose_identity' | 'group' | 'add' | 'expense'
  | 'settle' | 'profile' | 'privacy' | 'audit' | 'smlouva' | 'activity';

export interface GroupMember {
  id: string;
  name: string;       // reálné jméno v DB
  userId: string | null;
}

export interface Group {
  id: string;
  name: string;
  members: string[];  // zobrazovaná jména ("Já" pro mě), odvozená z memberList
  memberList?: GroupMember[]; // raw členové s id – pro překlad id <-> jméno (cloud)
  shareCode?: string | null;
  currency?: string;
}

export interface Expense {
  id: string;
  desc: string;
  amount: number;
  payer: string;
  parts: string[];
  photo: string | null;
  currency: CurrencyCode;
  shares: number[] | null;
  splitType: SplitType;
  category: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  amt: number;
  currency: CurrencyCode;
  createdAt?: string;
}

export interface Transfer {
  id: string;
  groupId: string;
  currency: CurrencyCode;
  from: string;
  to: string;
  amt: number;
}

export type MoneyMap = Record<string, number>; // { CZK: 1200, EUR: 30 }

export interface JoinPreviewMember { name: string; claimed: boolean; isMe: boolean; }
export interface JoinPreview { code: string; groupId: string; groupName: string; members: JoinPreviewMember[]; }

export interface Toggles { notif: boolean; sound: boolean; }

export interface ThemeColors {
  bg: string; bg2: string; card: string; ink: string; muted: string;
  accent: string; accent2: string; good: string; bad: string; onbg: string;
}

export interface AppState {
  screen: ScreenName;
  selectedGroup: string | null;
  selectedExpense: string | null;
  selectedDebt: Transfer | null;
  bubble: string;
  bubbleKey: number;
  mascotMood: MascotMood;
  toast: string | null;
  coins: boolean;
  busy: boolean;
  googleEnabled: boolean;
  meUid: string | null;
  myName: string;
  userTheme: ThemeName;
  contentSize: ContentSize;
  toggles: Toggles;
  regEmail: string;
  regPassword: string;
  loginEmail: string;
  loginPassword: string;
  resetPass: string;     // nové heslo na obrazovce reset_password
  addDesc: string;
  addAmount: string;
  addPayer: string;
  addParts: string[];
  addPhoto: string | null;
  addCurrency: CurrencyCode;
  addSplitType: SplitType;
  addShares: Record<string, string>;
  addCategory: string;
  editingExpenseId: string | null;
  newGroupName: string;
  newGroupMembers: string[];
  newMemberInput: string;
  shareCode: string | null;
  joinCodeInput: string;
  joinPreview: JoinPreview | null;
  groups: Group[];
  expenses: Record<string, Expense[]>;
  payments: Record<string, Payment[]>;
  fxRates: Record<string, number> | null; // kurzy měn (CZK=1) pro orientační přepočet
}

export type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState>);

export interface Actions {
  patch: (p: Patch) => void;
  showToast: (text: string) => void;
  navigate: (screen: ScreenName) => void;
  goBack: () => boolean;
  openGroup: (id: string) => void;
  startAdd: () => void;
  startEdit: (id: string) => void;
  submitExpense: () => void;
  payDebt: (d: Transfer) => void;
  openContract: (d: Transfer) => void;
  pokeMascot: () => void;
  setTheme: (t: ThemeName) => void;
  setContentSize: (s: ContentSize) => void;
  toggleSet: (k: keyof Toggles) => void;
  setPayer: (n: string) => void;
  togglePart: (n: string) => void;
  setCurrency: (cur: CurrencyCode) => void;
  setSplitType: (t: SplitType) => void;
  setCategory: (k: string) => void;
  setShare: (name: string, value: string) => void;
  doRegister: () => void;
  doLogin: () => void;
  sendPasswordReset: () => void;
  submitNewPassword: () => void;
  enterGoogle: () => void;
  logout: () => void;
  startCreateGroup: () => void;
  addMember: () => void;
  removeMember: (name: string) => void;
  createGroup: () => void;
  openExpense: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteGroup: (id: string) => void;
  deleteAccount: () => void;
  startJoin: () => void;
  submitJoin: (code?: string) => void;
  joinByCode: (rawCode: string) => void;
  finishJoin: (opts: { claimName?: string; newName?: string }) => void;
  setMyName: (rawName: string) => void;
  refreshAll: (force?: boolean) => void;
  refreshGroup: (id: string) => Promise<unknown>;
}

export interface AppContextValue {
  state: AppState;
  actions: Actions;
}
