"use client";

import { useState, useEffect, useRef } from "react";
import {
  useTxns, useIdeas, useGoal, useFocus, useDayLog, useSettings,
  balance, monthIncome, todayIncome, topSources, weekSeries, formatMoney,
  type Txn, type Idea,
} from "@/lib/store";

// ── icons (inline SVG) ──
const Icons = {
  home: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z"/></svg>,
  money: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 17l4-4 4 4 4-6 6 3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 21h18" strokeLinecap="round"/></svg>,
  ideas: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2a7 7 0 00-4 12.7V17a1 1 0 001 1h6a1 1 0 001-1v-2.3A7 7 0 0012 2zM9 20h6v1a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1z"/></svg>,
  mind: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 8v4l3 3"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 15.5A3.5 3.5 0 1012 8.5a3.5 3.5 0 000 7zm7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-.97l2.11-1.65a.5.5 0 00.12-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1a7.3 7.3 0 00-1.67-.97l-.38-2.65A.49.49 0 0014 2h-4a.49.49 0 00-.49.42l-.38 2.65c-.61.25-1.17.59-1.67.97l-2.49-1a.5.5 0 00-.61.22l-2 3.46a.49.49 0 00.12.64l2.11 1.65c-.04.32-.07.65-.07.97s.03.66.07.97l-2.11 1.65a.5.5 0 00-.12.64l2 3.46a.5.5 0 00.61.22l2.49-1c.5.38 1.06.72 1.67.97l.38 2.65c.05.24.26.42.49.42h4c.24 0 .44-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.67-.97l2.49 1a.5.5 0 00.61-.22l2-3.46a.49.49 0 00-.12-.64l-2.11-1.65z"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  circle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="9"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>,
  flame: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.8-6.4 4.5-8l1.5-1.5 1.5 1.5c1.7 1.6 4.5 4.8 4.5 8 0 3.9-3.1 7-7 7zm0-13.5C10.5 11 7 14 7 16c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2-3.5-5-5-6.5z"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6h12z" strokeLinecap="round"/></svg>,
  pin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 opacity-40"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z"/></svg>,
};

type Tab = "home" | "money" | "ideas" | "mind" | "settings";

const categories = [
  { id: "business" as const, label: "Business", ru: "Бизнес", icon: "💼" },
  { id: "website" as const, label: "Websites", ru: "Сайты", icon: "🌐" },
  { id: "ai" as const, label: "AI / Bots", ru: "AI / Боты", icon: "✦" },
  { id: "thought" as const, label: "Thoughts", ru: "Мысли", icon: "◯" },
];

const currencies = ["USD", "EUR", "RUB", "GBP", "UAH", "KZT", "TRY", "AED"];

export default function AppPage() {
  const [tab, setTab] = useState<Tab>("home");
  const { settings, completeOnboarding } = useSettings();
  const [onboarding, setOnboarding] = useState(!settings.onboarded);

  useEffect(() => {
    setOnboarding(!settings.onboarded);
  }, [settings.onboarded]);

  if (onboarding) {
    return <Onboarding onDone={() => { completeOnboarding(); setOnboarding(false); }} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0A0C]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "home" && <HomeTab />}
        {tab === "money" && <MoneyTab />}
        {tab === "ideas" && <IdeasTab />}
        {tab === "mind" && <MindTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ONBOARDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Onboarding({ onDone }: { onDone: () => void }) {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const [page, setPage] = useState(0);

  const pages = [
    { icon: "📊", title: t("Track your money.", "Отслеживай деньги."), sub: t("See where every dollar goes.", "Видь, куда уходит каждый рубль.") },
    { icon: "💡", title: t("Capture ideas.", "Сохраняй идеи."), sub: t("Before they fade.", "Пока помнишь.") },
    { icon: "↗", title: t("Grow every day.", "Расти каждый день."), sub: t("Focus. Habits. Results.", "Фокус. Привычки. Результат.") },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black px-8">
      <div className="flex-1" />
      <div className="text-5xl mb-10 opacity-20">{pages[page].icon}</div>
      <h1 className="text-2xl font-semibold tracking-tight text-center">{pages[page].title}</h1>
      <p className="mt-3 text-white/40 text-center">{pages[page].sub}</p>
      <div className="flex gap-2 mt-10">
        {pages.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? "bg-white" : "bg-white/20"}`} />
        ))}
      </div>
      <div className="flex-1" />
      <button
        onClick={() => page < 2 ? setPage(page + 1) : onDone()}
        className="w-full py-4 bg-white text-black font-semibold rounded-2xl mb-16 active:scale-[0.98] transition-transform"
      >
        {page === 2 ? t("Begin", "Начать") : t("Next", "Дальше")}
      </button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "home", icon: Icons.home, label: t("Home", "Главная") },
    { id: "money", icon: Icons.money, label: t("Money", "Деньги") },
    { id: "ideas", icon: Icons.ideas, label: t("Ideas", "Идеи") },
    { id: "mind", icon: Icons.mind, label: "Mind" },
    { id: "settings", icon: Icons.settings, label: t("More", "Ещё") },
  ];

  return (
    <nav className="flex items-center justify-around border-t border-white/[0.07] bg-[#0A0A0C] pb-[env(safe-area-inset-bottom)] pt-2 px-2">
      {tabs.map((tb) => (
        <button
          key={tb.id}
          onClick={() => setTab(tb.id)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${tab === tb.id ? "text-white" : "text-white/30"}`}
        >
          {tb.icon}
          <span className="text-[10px] font-medium">{tb.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-[#16171D] rounded-3xl border border-white/[0.07] p-[18px] ${onClick ? "active:scale-[0.98] transition-transform cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#1C1E26] rounded-t-3xl p-6 pb-10 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/40 p-1">{Icons.close}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LINE CHART
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const cum = data.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] || 0) + v], []);
  const max = Math.max(...cum, 1);
  const hasData = cum.some((v) => v > 0);

  const W = 320, H = 140, PAD = 16;
  const usableH = H - PAD * 2;

  const pts = cum.map((v, i) => ({
    x: cum.length === 1 ? W / 2 : (W * i) / (cum.length - 1),
    y: PAD + usableH - (v / max) * usableH,
  }));

  const path = pts.length < 2 ? "" : pts.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const p0 = pts[i - 1];
    const prev = pts[i - 2] || p0;
    const next = pts[i + 1] || p;
    const t = 5;
    const c1x = p0.x + (p.x - prev.x) / t;
    const c1y = p0.y + (p.y - prev.y) / t;
    const c2x = p.x - (next.x - p0.x) / t;
    const c2y = p.y - (next.y - p0.y) / t;
    return `${d} C${c1x},${c1y} ${c2x},${c2y} ${p.x},${p.y}`;
  }, "");

  const sampled = labels.length > 6
    ? Array.from({ length: 6 }, (_, i) => labels[Math.round(i * (labels.length - 1) / 5)])
    : labels;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {[0, 1, 2].map((i) => (
          <line key={i} x1="0" y1={PAD + usableH * i / 2} x2={W} y2={PAD + usableH * i / 2} stroke="white" strokeOpacity="0.035" strokeWidth="0.5" />
        ))}
        {hasData ? (
          <>
            <path d={path} fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {pts.length > 0 && (
              <>
                <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="7" fill="white" fillOpacity="0.06" />
                <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill="white" />
              </>
            )}
          </>
        ) : (
          <path d={`M${W * 0.15},${H * 0.65} Q${W * 0.5},${H * 0.35} ${W * 0.85},${H * 0.45}`} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
        )}
      </svg>
      {sampled.length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          {sampled.map((l, i) => <span key={i} className="text-[10px] text-white/20 font-medium">{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOME TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HomeTab() {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const { txns, add: addTxn } = useTxns();
  const { goal, setGoal } = useGoal();
  const { tasks, setText, toggle } = useFocus();
  const { productive, setProductive, streak } = useDayLog();
  const [showAdd, setShowAdd] = useState(false);
  const [addIncome, setAddIncome] = useState(true);
  const [showGoal, setShowGoal] = useState(false);

  const bal = balance(txns);
  const mi = monthIncome(txns);
  const ti = todayIncome(txns);
  const fm = (v: number, plus = false) => formatMoney(v, settings.currency, plus);

  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? t("Good morning", "Доброе утро")
    : hour < 17 ? t("Good afternoon", "Добрый день")
    : hour < 23 ? t("Good evening", "Добрый вечер")
    : t("Good night", "Доброй ночи");

  const doneTasks = tasks.filter((t) => t.text && t.done).length;
  const totalTasks = tasks.filter((t) => t.text).length;

  return (
    <div className="px-5 pt-14 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{greeting}</h1>
          <p className="text-sm text-white/40">{new Date().toLocaleDateString(settings.lang === "ru" ? "ru" : "en", { day: "numeric", month: "short" })}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1.5">
            {Icons.flame}
            <span className="text-sm font-bold">{streak}</span>
          </div>
        )}
      </div>

      {/* Balance */}
      <Card>
        <p className="text-xs text-white/40 font-medium">{t("Total balance", "Общий баланс")}</p>
        {txns.length === 0 ? (
          <p className="text-2xl font-semibold text-white/40 mt-2">{t("Ready to begin", "Готов к старту")}</p>
        ) : (
          <p className="text-4xl font-bold mt-2 tracking-tight">{fm(bal)}</p>
        )}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2">
            <p className="text-[10px] text-white/30">{t("Today", "Сегодня")}</p>
            <p className="text-sm font-semibold">{fm(ti, ti > 0)}</p>
          </div>
          <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2">
            <p className="text-[10px] text-white/30">{t("This month", "За месяц")}</p>
            <p className="text-sm font-semibold">{fm(mi, mi > 0)}</p>
          </div>
        </div>
      </Card>

      {/* Goal */}
      <Card onClick={() => setShowGoal(true)}>
        {goal && goal.amount > 0 ? (
          <div className="flex items-center gap-4">
            <ProgressRing progress={mi / goal.amount} size={64} />
            <div>
              <p className="text-xs text-white/40 font-medium">{t("Monthly goal", "Цель месяца")}</p>
              <p className="text-lg font-bold">{fm(mi)} / {fm(goal.amount)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-white/40">◎</span>
            <span className="font-medium">{t("Set a monthly goal", "Поставить цель на месяц")}</span>
            <span className="ml-auto text-white/20 text-xs">›</span>
          </div>
        )}
      </Card>

      {/* Quick add */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setAddIncome(true); setShowAdd(true); }} className="flex items-center justify-center gap-2 py-4 bg-white/10 rounded-2xl font-semibold active:scale-[0.97] transition-transform">
          <span className="text-lg">+</span> {t("Income", "Доход")}
        </button>
        <button onClick={() => { setAddIncome(false); setShowAdd(true); }} className="flex items-center justify-center gap-2 py-4 bg-white/[0.05] rounded-2xl font-medium text-white/50 active:scale-[0.97] transition-transform">
          <span className="text-lg">−</span> {t("Expense", "Расход")}
        </button>
      </div>

      {/* Focus */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t("Today's focus", "Фокус на день")}</h3>
          {totalTasks > 0 && <span className="text-sm text-white/40">{doneTasks}/{totalTasks}</span>}
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <button onClick={() => task.text && toggle(task.id)} className={task.done ? "text-white" : "text-white/20"}>
                {task.done ? Icons.check : Icons.circle}
              </button>
              <input
                value={task.text}
                onChange={(e) => setText(task.id, e.target.value)}
                placeholder={t("Important task…", "Важная задача…")}
                className={`flex-1 bg-transparent outline-none placeholder:text-white/20 ${task.done ? "line-through text-white/30" : ""}`}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Productivity */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">{t("How was your day?", "Как прошёл день?")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setProductive(true)} className={`py-3 rounded-2xl font-medium transition-colors ${productive === true ? "bg-white text-black" : "bg-white/[0.06] text-white/60"}`}>
            ✓ {t("Productive", "Продуктивный")}
          </button>
          <button onClick={() => setProductive(false)} className={`py-3 rounded-2xl font-medium transition-colors ${productive === false ? "bg-white text-black" : "bg-white/[0.06] text-white/40"}`}>
            ✗ {t("Off day", "Так себе")}
          </button>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-white/40">
            {Icons.flame}
            <span>{t(`${streak}-day productive streak`, `${streak} дней подряд продуктивно`)}</span>
          </div>
        )}
      </Card>

      {/* Sheets */}
      <AddTxnSheet open={showAdd} onClose={() => setShowAdd(false)} isIncome={addIncome} />
      <GoalSheet open={showGoal} onClose={() => setShowGoal(false)} />
    </div>
  );
}

function ProgressRing({ progress, size = 64 }: { progress: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(Math.max(progress, 0), 1);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - p)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-700" />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="white" fontSize="13" fontWeight="700">
        {Math.round(p * 100)}%
      </text>
    </svg>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADD TRANSACTION SHEET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function AddTxnSheet({ open, onClose, isIncome }: { open: boolean; onClose: () => void; isIncome: boolean }) {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const { add } = useTxns();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");

  const save = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    add({ amount: a, isIncome, source, note });
    setAmount(""); setSource(""); setNote("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={isIncome ? t("Add income", "Добавить доход") : t("Add expense", "Добавить расход")}>
      <div className="space-y-4">
        <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder={t("Amount", "Сумма")} className="w-full bg-white/[0.06] rounded-2xl px-4 py-4 text-2xl font-bold outline-none placeholder:text-white/20" autoFocus />
        <input value={source} onChange={(e) => setSource(e.target.value)}
          placeholder={t("Source (optional)", "Источник")} className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 outline-none placeholder:text-white/20" />
        <input value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={t("Note (optional)", "Заметка")} className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 outline-none placeholder:text-white/20" />
        <button onClick={save} className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-[0.98] transition-transform">
          {t("Save", "Сохранить")}
        </button>
      </div>
    </Sheet>
  );
}

function GoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const { setGoal } = useGoal();
  const [amount, setAmount] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title={t("Monthly goal", "Цель на месяц")}>
      <div className="space-y-4">
        <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder={t("Goal amount", "Сумма цели")} className="w-full bg-white/[0.06] rounded-2xl px-4 py-4 text-2xl font-bold outline-none placeholder:text-white/20" autoFocus />
        <button onClick={() => { const a = parseFloat(amount); if (a > 0) { setGoal(a); setAmount(""); onClose(); } }}
          className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-[0.98] transition-transform">
          {t("Save", "Сохранить")}
        </button>
      </div>
    </Sheet>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MONEY TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MoneyTab() {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const { txns, remove } = useTxns();
  const [showAdd, setShowAdd] = useState(false);
  const fm = (v: number, plus = false) => formatMoney(v, settings.currency, plus);

  const series = weekSeries(txns);
  const weekInc = series.reduce((s, d) => s + d.income, 0);
  const tops = topSources(txns);

  const grouped = Object.entries(
    txns.reduce<Record<string, Txn[]>>((acc, tx) => {
      const dk = tx.date.slice(0, 10);
      (acc[dk] ||= []).push(tx);
      return acc;
    }, {})
  ).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("Money", "Деньги")}</h1>
        <button onClick={() => setShowAdd(true)} className="text-white/60 p-1">{Icons.plus}</button>
      </div>

      {txns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <LineChart data={[]} labels={[]} />
          <h2 className="text-xl font-semibold mt-8">{t("Start tracking.", "Начни отслеживать.")}</h2>
          <p className="text-white/40 mt-2">{t("Every number is progress.", "Каждая цифра — шаг вперёд.")}</p>
          <button onClick={() => setShowAdd(true)} className="mt-6 px-8 py-3 bg-white text-black font-semibold rounded-full active:scale-[0.97] transition-transform">
            {t("Log", "Записать")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <p className="text-xs text-white/40 font-medium">{t("Income · this week", "Доход · за неделю")}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight">{fm(weekInc)}</p>
            <div className="mt-5">
              <LineChart data={series.map((d) => d.income)} labels={series.map((d) => d.label)} />
            </div>
          </Card>

          {tops.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-3">{t("Top sources", "Лучшие источники")}</h3>
              <div className="space-y-3">
                {tops.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="font-semibold">{fm(s.total)}</span>
                    </div>
                    <div className="h-1 bg-white/[0.07] rounded-full">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(s.total / (tops[0]?.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <h3 className="text-lg font-semibold mt-2">{t("History", "История")}</h3>
          {grouped.map(([dk, items]) => (
            <div key={dk}>
              <p className="text-xs text-white/30 font-semibold mb-2 ml-1">
                {new Date(dk + "T12:00:00").toLocaleDateString(settings.lang === "ru" ? "ru" : "en", { day: "numeric", month: "short" })}
              </p>
              <Card className="!p-0 divide-y divide-white/[0.07]">
                {items.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.isIncome ? "bg-white/10" : "bg-white/[0.04]"}`}>
                      {tx.isIncome ? "↙" : "↗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.source || t("No source", "Без источника")}</p>
                      {tx.note && <p className="text-xs text-white/40 truncate">{tx.note}</p>}
                    </div>
                    <span className={`text-sm font-semibold ${tx.isIncome ? "" : "text-white/40"}`}>
                      {fm(tx.isIncome ? tx.amount : -tx.amount, true)}
                    </span>
                    <button onClick={() => remove(tx.id)} className="text-white/20 ml-1">{Icons.trash}</button>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      <AddTxnSheet open={showAdd} onClose={() => setShowAdd(false)} isIncome={true} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IDEAS TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function IdeasTab() {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const { ideas, add, update, remove, togglePin } = useIdeas();
  const [filter, setFilter] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);

  const filtered = (filter ? ideas.filter((i) => i.category === filter) : ideas)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("Ideas", "Идеи")}</h1>
        <button onClick={() => setShowNew(true)} className="text-white/60 p-1">{Icons.plus}</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        <button onClick={() => setFilter(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!filter ? "bg-white text-black" : "bg-white/[0.05] text-white/50"}`}>
          {t("All", "Все")}
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c.id ? "bg-white text-black" : "bg-white/[0.05] text-white/50"}`}>
            {c.icon} {settings.lang === "ru" ? c.ru : c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && ideas.length === 0 ? (
        <div className="flex flex-col items-center py-24">
          <span className="text-5xl opacity-10">◯</span>
          <h2 className="text-xl font-semibold mt-6 text-center">{t("Every great thing starts as an idea.", "Всё великое начинается с идеи.")}</h2>
          <p className="text-white/40 mt-2">{t("Write it down before it fades.", "Запиши, пока помнишь.")}</p>
          <button onClick={() => setShowNew(true)} className="mt-6 px-8 py-3 bg-white text-black font-semibold rounded-full active:scale-[0.97] transition-transform">
            {t("Capture", "Записать")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} onClick={() => setEditing(idea)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{categories.find((c) => c.id === idea.category)?.icon}</span>
                <span className="text-xs text-white/40 font-medium">{categories.find((c) => c.id === idea.category)?.[settings.lang === "ru" ? "ru" : "label"]}</span>
                <span className="ml-auto">{idea.pinned && Icons.pin}</span>
              </div>
              <p className="font-semibold">{idea.title || t("Untitled", "Без названия")}</p>
              {idea.details && <p className="text-sm text-white/40 mt-1 line-clamp-2">{idea.details}</p>}
            </Card>
          ))}
        </div>
      )}

      <IdeaSheet open={showNew} onClose={() => setShowNew(false)} onSave={(i) => { add(i); setShowNew(false); }} />
      {editing && (
        <IdeaSheet
          open={true}
          onClose={() => setEditing(null)}
          idea={editing}
          onSave={(patch) => { update(editing.id, patch); setEditing(null); }}
          onDelete={() => { remove(editing.id); setEditing(null); }}
          onPin={() => { togglePin(editing.id); setEditing(null); }}
        />
      )}
    </div>
  );
}

function IdeaSheet({ open, onClose, idea, onSave, onDelete, onPin }: {
  open: boolean; onClose: () => void;
  idea?: Idea;
  onSave: (data: { title: string; details: string; category: Idea["category"] }) => void;
  onDelete?: () => void;
  onPin?: () => void;
}) {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const [title, setTitle] = useState(idea?.title || "");
  const [details, setDetails] = useState(idea?.details || "");
  const [cat, setCat] = useState<Idea["category"]>(idea?.category || "business");

  return (
    <Sheet open={open} onClose={onClose} title={idea ? t("Idea", "Идея") : t("New idea", "Новая идея")}>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${cat === c.id ? "bg-white text-black" : "bg-white/[0.05] text-white/50"}`}>
            {c.icon} {settings.lang === "ru" ? c.ru : c.label}
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Idea title", "Название идеи")}
        className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 text-lg font-semibold outline-none placeholder:text-white/20 mb-3" autoFocus />
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t("Details…", "Подробнее…")} rows={3}
        className="w-full bg-white/[0.06] rounded-2xl px-4 py-3 outline-none placeholder:text-white/20 resize-none mb-4" />
      <button onClick={() => onSave({ title, details, category: cat })}
        className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-[0.98] transition-transform">
        {t("Save", "Сохранить")}
      </button>
      {idea && (
        <div className="flex gap-3 mt-3">
          {onPin && <button onClick={onPin} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm text-white/50">{idea.pinned ? t("Unpin", "Открепить") : t("Pin", "Закрепить")}</button>}
          {onDelete && <button onClick={onDelete} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm text-red-400">{t("Delete", "Удалить")}</button>}
        </div>
      )}
    </Sheet>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIND TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Insight {
  id: string;
  category: string;
  text: string;
  en?: string;
  author: string;
  source: string;
}

function MindTab() {
  const { settings } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selected, setSelected] = useState<Insight | null>(null);

  useEffect(() => {
    fetch("/data/insights.json")
      .then((r) => r.json())
      .then((d) => setInsights(d.insights || []))
      .catch(() => {});
  }, []);

  const quote = insights.length > 0
    ? insights[Math.floor(new Date().getDate() * 7 + new Date().getMonth()) % insights.length]
    : null;

  const cats = [...new Set(insights.map((i) => i.category))];
  const catNames: Record<string, { en: string; ru: string }> = {
    strongQuotes: { en: "Strong Quotes", ru: "Сильные цитаты" },
    psychology: { en: "Psychology", ru: "Психология" },
    mindset: { en: "Mindset", ru: "Мышление" },
    habits: { en: "Habits", ru: "Привычки" },
    negotiation: { en: "Negotiation", ru: "Переговоры" },
    influence: { en: "Influence", ru: "Влияние" },
    stoicism: { en: "Stoicism", ru: "Стоицизм" },
    business: { en: "Business", ru: "Бизнес" },
    humanNature: { en: "Human Nature", ru: "Природа человека" },
    meaning: { en: "Meaning", ru: "Смысл" },
    communication: { en: "Communication", ru: "Общение" },
    discipline: { en: "Discipline", ru: "Дисциплина" },
    selfGrowth: { en: "Self Growth", ru: "Саморазвитие" },
    salesInfluence: { en: "Sales & Influence", ru: "Продажи и влияние" },
    thinking: { en: "Thinking", ru: "Мышление" },
    money: { en: "Money", ru: "Деньги" },
    leadership: { en: "Leadership", ru: "Лидерство" },
  };

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const filtered = activeCat ? insights.filter((i) => i.category === activeCat) : [];

  return (
    <div className="px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold mb-1">Mind</h1>
      <p className="text-sm text-white/40 mb-5">{t("Short, strong ideas for a clearer mind.", "Короткие сильные мысли для ясного ума.")}</p>

      {quote && !activeCat && (
        <Card className="mb-4" onClick={() => setSelected(quote)}>
          <p className="text-[10px] text-white/30 font-semibold tracking-widest uppercase mb-3">❝ {t("Today's thought", "Мысль дня")}</p>
          <p className="text-lg leading-relaxed font-serif italic">
            {settings.lang === "ru" ? quote.text : (quote.en || quote.text)}
          </p>
          <p className="text-sm text-white/40 mt-3">— {quote.author}</p>
        </Card>
      )}

      {activeCat ? (
        <>
          <button onClick={() => setActiveCat(null)} className="text-sm text-white/40 mb-4">← {t("Back", "Назад")}</button>
          <h2 className="text-xl font-semibold mb-4">{catNames[activeCat]?.[settings.lang] || activeCat}</h2>
          <div className="space-y-3">
            {filtered.map((ins) => (
              <Card key={ins.id} onClick={() => setSelected(ins)}>
                <p className="leading-relaxed">{settings.lang === "ru" ? ins.text : (ins.en || ins.text)}</p>
                <p className="text-xs text-white/30 mt-2">— {ins.author}</p>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cats.map((cat) => (
            <Card key={cat} onClick={() => setActiveCat(cat)}>
              <p className="font-semibold text-sm">{catNames[cat]?.[settings.lang] || cat}</p>
              <p className="text-xs text-white/30 mt-1">{insights.filter((i) => i.category === cat).length} {t("insights", "мыслей")}</p>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1C1E26] rounded-3xl p-8 max-w-lg w-full">
            <p className="text-xl leading-relaxed font-serif italic">{settings.lang === "ru" ? selected.text : (selected.en || selected.text)}</p>
            <p className="text-white/40 mt-4">— {selected.author}</p>
            <p className="text-xs text-white/20 mt-1">{selected.source}</p>
            <button onClick={() => setSelected(null)} className="mt-6 w-full py-3 bg-white/[0.06] rounded-2xl text-sm text-white/50">
              {t("Close", "Закрыть")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SETTINGS TAB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SettingsTab() {
  const { settings, setLang, setCurrency } = useSettings();
  const t = (en: string, ru: string) => settings.lang === "ru" ? ru : en;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="px-5 pt-14 pb-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">{t("More", "Ещё")}</h1>

      <div>
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2 ml-1">{t("Language", "Язык")}</p>
        <Card>
          <div className="flex gap-2">
            {(["en", "ru"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${settings.lang === l ? "bg-white text-black" : "bg-white/[0.06] text-white/50"}`}>
                {l === "en" ? "English" : "Русский"}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2 ml-1">{t("Currency", "Валюта")}</p>
        <Card>
          <div className="flex flex-wrap gap-2">
            {currencies.map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${settings.currency === c ? "bg-white text-black" : "bg-white/[0.06] text-white/50"}`}>
                {c}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2 ml-1">{t("About", "О приложении")}</p>
        <Card>
          <div className="flex justify-between text-sm">
            <span>{t("Version", "Версия")}</span>
            <span className="text-white/40">1.0</span>
          </div>
        </Card>
      </div>

      <Card>
        <button onClick={() => setConfirmReset(true)} className="text-red-400 text-sm font-medium w-full text-left">
          {t("Reset all data", "Сбросить все данные")}
        </button>
      </Card>

      <p className="text-center text-xs text-white/20 pt-2">
        aly · {t("your personal life dashboard", "личный дашборд жизни")}
      </p>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setConfirmReset(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1C1E26] rounded-3xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold mb-2">{t("Delete all data?", "Удалить все данные?")}</p>
            <p className="text-sm text-white/40 mb-6">{t("This cannot be undone.", "Это нельзя отменить.")}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm">{t("Cancel", "Отмена")}</button>
              <button onClick={() => {
                ["aly_txns", "aly_ideas", "aly_goals", "aly_focus", "aly_logs", "aly_settings"].forEach((k) => localStorage.removeItem(k));
                window.location.reload();
              }} className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-2xl text-sm font-medium">{t("Delete", "Удалить")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
