"use client";
import { useState, useCallback, useSyncExternalStore } from "react";

// ── helpers ──
const uid = () => crypto.randomUUID();
const today = () => new Date().toISOString().slice(0, 10);
const month = () => new Date().toISOString().slice(0, 7);

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
    () => JSON.stringify(readLS(key, fallback)),
    () => JSON.stringify(fallback),
  );
  const parsed: T = JSON.parse(data);
  const update = useCallback((fn: (prev: T) => T) => {
    const curr = readLS(key, fallback);
    writeLS(key, fn(curr));
  }, [key, fallback]);
  return [parsed, update];
}

// ── models ──
export interface Txn {
  id: string;
  amount: number;
  isIncome: boolean;
  source: string;
  note: string;
  date: string;
}

export interface Idea {
  id: string;
  title: string;
  details: string;
  category: "business" | "website" | "ai" | "thought";
  pinned: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  amount: number;
  monthKey: string;
}

export interface FocusTask {
  id: string;
  text: string;
  done: boolean;
  dayKey: string;
  order: number;
}

export interface DayLog {
  dayKey: string;
  productive: boolean | null;
}

export interface AppSettings {
  lang: "ru" | "en";
  currency: string;
  onboarded: boolean;
}

// ── domain hooks ──

export function useTxns() {
  const [txns, set] = useLS<Txn[]>("aly_txns", []);
  return {
    txns,
    add: (t: Omit<Txn, "id" | "date">) =>
      set((p) => [{ ...t, id: uid(), date: new Date().toISOString() }, ...p]),
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
  const current = goals.find((g) => g.monthKey === mk);
  return {
    goal: current,
    setGoal: (amount: number) =>
      set((p) => {
        const without = p.filter((g) => g.monthKey !== mk);
        return [...without, { id: uid(), amount, monthKey: mk }];
      }),
  };
}

export function useFocus() {
  const [tasks, set] = useLS<FocusTask[]>("aly_focus", []);
  const dk = today();
  let todayTasks = tasks.filter((t) => t.dayKey === dk).sort((a, b) => a.order - b.order);
  if (todayTasks.length < 3) {
    const needed = 3 - todayTasks.length;
    const newTasks: FocusTask[] = Array.from({ length: needed }, (_, i) => ({
      id: uid(), text: "", done: false, dayKey: dk, order: todayTasks.length + i,
    }));
    todayTasks = [...todayTasks, ...newTasks];
    const allOther = tasks.filter((t) => t.dayKey !== dk);
    writeLS("aly_focus", [...allOther, ...todayTasks]);
  }
  return {
    tasks: todayTasks,
    setText: (id: string, text: string) =>
      set((p) => p.map((t) => (t.id === id ? { ...t, text } : t))),
    toggle: (id: string) =>
      set((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
  };
}

export function useDayLog() {
  const [logs, set] = useLS<DayLog[]>("aly_logs", []);
  const dk = today();
  const todayLog = logs.find((l) => l.dayKey === dk);
  return {
    productive: todayLog?.productive ?? null,
    setProductive: (val: boolean) =>
      set((p) => {
        const without = p.filter((l) => l.dayKey !== dk);
        return [...without, { dayKey: dk, productive: val }];
      }),
    streak: (() => {
      const prodDays = new Set(logs.filter((l) => l.productive).map((l) => l.dayKey));
      let count = 0;
      const d = new Date();
      if (!prodDays.has(today())) {
        d.setDate(d.getDate() - 1);
      }
      while (prodDays.has(d.toISOString().slice(0, 10))) {
        count++;
        d.setDate(d.getDate() - 1);
      }
      return count;
    })(),
  };
}

export function useSettings() {
  const [s, set] = useLS<AppSettings>("aly_settings", {
    lang: "en", currency: "USD", onboarded: false,
  });
  return {
    settings: s,
    setLang: (lang: "ru" | "en") => set((p) => ({ ...p, lang })),
    setCurrency: (currency: string) => set((p) => ({ ...p, currency })),
    completeOnboarding: () => set((p) => ({ ...p, onboarded: true })),
  };
}

// ── computed helpers ──

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
  txns.filter((t) => t.isIncome).forEach((t) => {
    const k = t.source || "—";
    map[k] = (map[k] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function weekSeries(txns: Txn[]) {
  const days: { income: number; expense: number; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dk = d.toISOString().slice(0, 10);
    const dayTxns = txns.filter((t) => t.date.slice(0, 10) === dk);
    days.push({
      income: dayTxns.filter((t) => t.isIncome).reduce((s, t) => s + t.amount, 0),
      expense: dayTxns.filter((t) => !t.isIncome).reduce((s, t) => s + t.amount, 0),
      label: d.toLocaleDateString("en", { weekday: "short" }),
    });
  }
  return days;
}

export function formatMoney(amount: number, currency: string, showPlus = false) {
  const abs = Math.abs(amount);
  const fmt = new Intl.NumberFormat("en", {
    style: "currency", currency, maximumFractionDigits: abs === Math.round(abs) ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(abs);
  if (amount < 0) return "−" + fmt;
  if (showPlus && amount > 0) return "+" + fmt;
  return fmt;
}
