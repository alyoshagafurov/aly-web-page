"use client";
import { useCallback, useSyncExternalStore } from "react";

// ── helpers ──
const uid = () => crypto.randomUUID();
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const month = () => today().slice(0, 7);

// ── generic localStorage hook with cross-tab sync ──
const listeners = new Map<string, Set<() => void>>();

function subscribe(key: string, cb: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(cb);
  return () => { listeners.get(key)?.delete(cb); };
}

function notify(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeLS<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
  notify(key);
}

function useLS<T>(key: string, fallback: T): [T, (fn: (prev: T) => T) => void] {
  const data = useSyncExternalStore(
    (cb) => subscribe(key, cb),
    () => localStorage.getItem(key) ?? "null",
    () => "null",
  );
  let parsed: T;
  try { const p = JSON.parse(data); parsed = p === null ? fallback : p; }
  catch { parsed = fallback; }
  const update = useCallback((fn: (prev: T) => T) => {
    const curr = readLS(key, fallback);
    writeLS(key, fn(curr));
  }, [key, fallback]);
  return [parsed, update];
}

// ── models ──
export interface Txn { id: string; amount: number; isIncome: boolean; source: string; note: string; date: string; }
export interface Idea { id: string; title: string; details: string; category: "business" | "website" | "ai" | "thought"; pinned: boolean; createdAt: string; }
export interface Goal { id: string; amount: number; monthKey: string; }
export interface FocusTask { id: string; text: string; done: boolean; dayKey: string; order: number; }
export interface DayLog { dayKey: string; productive: boolean | null; earned: number; didToday: string; didntWork: string; planTomorrow: string; }
export interface ReadingState { bookID: string; chapterIndex: number; paragraphIndex: number; percent: number; updatedAt: string; }
export interface Highlight { bookID: string; chapterIndex: number; text: string; }
export interface AppSettings { lang: "ru" | "en"; currency: string; onboarded: boolean; readerFont: number; focusDate: string; }

export type Range = "week" | "month" | "year";

// ── domain hooks ──

export function useTxns() {
  const [txns, set] = useLS<Txn[]>("aly_txns", []);
  return {
    txns,
    add: (t: Omit<Txn, "id" | "date"> & { date?: string }) =>
      set((p) => [{ ...t, id: uid(), date: t.date || new Date().toISOString() }, ...p]),
    remove: (id: string) => set((p) => p.filter((x) => x.id !== id)),
  };
}

export function useIdeas() {
  const [ideas, set] = useLS<Idea[]>("aly_ideas", []);
  return {
    ideas,
    add: (i: Omit<Idea, "id" | "createdAt" | "pinned">) =>
      set((p) => [{ ...i, id: uid(), pinned: false, createdAt: new Date().toISOString() }, ...p]),
    update: (id: string, patch: Partial<Idea>) =>
      set((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id: string) => set((p) => p.filter((x) => x.id !== id)),
    togglePin: (id: string) =>
      set((p) => p.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x))),
  };
}

export function useGoal() {
  const [goals, set] = useLS<Goal[]>("aly_goals", []);
  const mk = month();
  return {
    goal: goals.find((g) => g.monthKey === mk),
    setGoal: (amount: number) =>
      set((p) => [...p.filter((g) => g.monthKey !== mk), { id: uid(), amount, monthKey: mk }]),
  };
}

export function useFocus() {
  const [tasks, set] = useLS<FocusTask[]>("aly_focus", []);
  const dk = today();
  let todayTasks = tasks.filter((t) => t.dayKey === dk).sort((a, b) => a.order - b.order);
  if (todayTasks.length < 3) {
    const extra: FocusTask[] = Array.from({ length: 3 - todayTasks.length }, (_, i) => ({
      id: uid(), text: "", done: false, dayKey: dk, order: todayTasks.length + i,
    }));
    todayTasks = [...todayTasks, ...extra];
    writeLS("aly_focus", [...tasks.filter((t) => t.dayKey !== dk), ...todayTasks]);
  }

  const byDay = new Map<string, FocusTask[]>();
  tasks.forEach((task) => {
    if (task.dayKey === dk) return;
    const arr = byDay.get(task.dayKey);
    if (arr) arr.push(task); else byDay.set(task.dayKey, [task]);
  });
  let fire = 0;
  byDay.forEach((dayTasks) => {
    const withText = dayTasks.filter((t) => t.text.trim());
    if (withText.length === 0) return;
    const done = withText.filter((t) => t.done).length;
    if (done >= 3) fire += 1;
    else if (done >= 2) fire += 0.5;
    else if (done === 0) fire -= 1;
  });

  return {
    tasks: todayTasks,
    fireScore: Math.max(0, fire),
    setText: (id: string, text: string) => set((p) => p.map((t) => (t.id === id ? { ...t, text } : t))),
    toggle: (id: string) => set((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
  };
}

export function useDayLog() {
  const [logs, set] = useLS<DayLog[]>("aly_logs", []);
  const dk = today();
  const log = logs.find((l) => l.dayKey === dk);
  const upsert = (patch: Partial<DayLog>) =>
    set((p) => {
      const existing = p.find((l) => l.dayKey === dk);
      const base: DayLog = existing ?? { dayKey: dk, productive: null, earned: 0, didToday: "", didntWork: "", planTomorrow: "" };
      return [...p.filter((l) => l.dayKey !== dk), { ...base, ...patch }];
    });
  return {
    log,
    saveReport: (r: { earned: number; didToday: string; didntWork: string; planTomorrow: string }) => upsert(r),
  };
}

export function useSettings() {
  const [s, set] = useLS<AppSettings>("aly_settings", { lang: "en", currency: "USD", onboarded: false, readerFont: 19, focusDate: "" });
  return {
    settings: s,
    setLang: (lang: "ru" | "en") => set((p) => ({ ...p, lang })),
    setCurrency: (currency: string) => set((p) => ({ ...p, currency })),
    setReaderFont: (readerFont: number) => set((p) => ({ ...p, readerFont: Math.min(24, Math.max(16, readerFont)) })),
    completeOnboarding: () => set((p) => ({ ...p, onboarded: true })),
    setFocusDate: (focusDate: string) => set((p) => ({ ...p, focusDate })),
  };
}

export function useReading() {
  const [states, set] = useLS<ReadingState[]>("aly_reading", []);
  return {
    states,
    forBook: (bookID: string) => states.find((r) => r.bookID === bookID),
    persist: (bookID: string, chapterIndex: number, paragraphIndex: number, percent: number) =>
      set((p) => [...p.filter((r) => r.bookID !== bookID),
        { bookID, chapterIndex, paragraphIndex, percent, updatedAt: new Date().toISOString() }]),
  };
}

export function useHighlights() {
  const [hl, set] = useLS<Highlight[]>("aly_highlights", []);
  return {
    highlights: hl,
    toggle: (h: Highlight) =>
      set((p) => {
        const exists = p.some((x) => x.bookID === h.bookID && x.chapterIndex === h.chapterIndex && x.text === h.text);
        return exists
          ? p.filter((x) => !(x.bookID === h.bookID && x.chapterIndex === h.chapterIndex && x.text === h.text))
          : [...p, h];
      }),
  };
}

export function useSaved() {
  const [ids, set] = useLS<string[]>("aly_saved", []);
  return {
    saved: ids,
    isSaved: (id: string) => ids.includes(id),
    toggle: (id: string) => set((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
  };
}

// ── computed money helpers ──

export function balance(txns: Txn[]) {
  return txns.reduce((s, t) => s + (t.isIncome ? t.amount : -t.amount), 0);
}
export function monthIncome(txns: Txn[]) {
  const mk = month();
  return txns.filter((t) => t.isIncome && t.date.slice(0, 7) === mk).reduce((s, t) => s + t.amount, 0);
}
export function todayIncome(txns: Txn[]) {
  const dk = today();
  return txns.filter((t) => t.isIncome && t.date.slice(0, 10) === dk).reduce((s, t) => s + t.amount, 0);
}
export function topSources(txns: Txn[], limit = 5) {
  const map: Record<string, number> = {};
  txns.filter((t) => t.isIncome).forEach((t) => { const k = t.source || "—"; map[k] = (map[k] || 0) + t.amount; });
  return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, limit);
}

const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function periodSeries(txns: Txn[], range: Range, lang: "ru" | "en") {
  const loc = lang === "ru" ? "ru" : "en";
  const income: number[] = [], expense: number[] = [], labels: string[] = [];

  if (range === "year") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = txns.filter((t) => t.date.slice(0, 7) === mk);
      income.push(m.filter((t) => t.isIncome).reduce((s, t) => s + t.amount, 0));
      expense.push(m.filter((t) => !t.isIncome).reduce((s, t) => s + t.amount, 0));
      labels.push(d.toLocaleDateString(loc, { month: "short" }));
    }
  } else {
    const days = range === "week" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dk = keyOf(d);
      const day = txns.filter((t) => t.date.slice(0, 10) === dk);
      income.push(day.filter((t) => t.isIncome).reduce((s, t) => s + t.amount, 0));
      expense.push(day.filter((t) => !t.isIncome).reduce((s, t) => s + t.amount, 0));
      labels.push(range === "week" ? d.toLocaleDateString(loc, { weekday: "short" }) : String(d.getDate()));
    }
  }
  return { income, expense, labels };
}

export function formatMoney(amount: number, currency: string, showPlus = false) {
  const abs = Math.abs(amount);
  let fmt: string;
  try {
    fmt = new Intl.NumberFormat("en", {
      style: "currency", currency,
      maximumFractionDigits: abs === Math.round(abs) ? 0 : 2, minimumFractionDigits: 0,
    }).format(abs);
  } catch { fmt = abs.toLocaleString("en"); }
  if (amount < 0) return "−" + fmt;
  if (showPlus && amount > 0) return "+" + fmt;
  return fmt;
}
