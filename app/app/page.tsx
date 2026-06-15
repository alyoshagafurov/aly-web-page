"use client";

import { useState, useEffect } from "react";
import {
  useTxns, useIdeas, useGoal, useFocus, useDayLog, useSettings, useRates, today,
  balance, monthIncome, todayIncome, topSources, periodSeries, formatMoney, convertCurrency,
  type Txn, type Idea, type Range,
} from "@/lib/store";
import { Card, Sheet, ProgressRing, LineChart, CatIcon, t } from "@/components/pwa/ui";
import Mind from "@/components/pwa/Mind";

type Tab = "home" | "money" | "ideas" | "mind" | "settings";

const ideaCats = [
  { id: "business" as const, en: "Business", ru: "Бизнес", icon: "💼" },
  { id: "website" as const, en: "Websites", ru: "Сайты", icon: "🌐" },
  { id: "ai" as const, en: "AI / Bots", ru: "AI / Боты", icon: "✦" },
  { id: "thought" as const, en: "Thoughts", ru: "Мысли", icon: "◌" },
];
const currencies = ["USD", "RUB", "TJS"];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ROOT
export default function AppPage() {
  const { settings, completeOnboarding, setFocusDate } = useSettings();
  const [tab, setTab] = useState<Tab>("home");
  const [splash, setSplash] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => {
      setSplash(false);
      setOnboarding(!settings.onboarded);
    }, 2600);
    return () => clearTimeout(tm);
  }, [settings.onboarded]);

  if (splash) return <Splash />;
  if (onboarding) return <Onboarding lang={settings.lang} onDone={() => { completeOnboarding(); setOnboarding(false); }} />;
  if (settings.focusDate !== today()) return <FocusSetup lang={settings.lang} onDone={() => setFocusDate(today())} />;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0C]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "home" && <HomeTab />}
        {tab === "money" && <MoneyTab />}
        {tab === "ideas" && <IdeasTab />}
        {tab === "mind" && <Mind />}
        {tab === "settings" && <SettingsTab />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SPLASH
function Splash() {
  return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="splash-word flex text-[64px] font-semibold tracking-[-0.04em] text-white rounded-font">
        <span>aly</span><span className="splash-osha">osha</span>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ONBOARDING
function Onboarding({ lang, onDone }: { lang: "ru" | "en"; onDone: () => void }) {
  const [page, setPage] = useState(0);
  const pages = [
    { icon: "money", title: t(lang, "Track your money.", "Отслеживай деньги."), sub: t(lang, "See where every dollar goes.", "Видь, куда уходит каждый рубль.") },
    { icon: "bulb", title: t(lang, "Capture ideas.", "Сохраняй идеи."), sub: t(lang, "Before they fade.", "Пока помнишь.") },
    { icon: "arrow", title: t(lang, "Grow every day.", "Расти каждый день."), sub: t(lang, "Focus. Habits. Results.", "Фокус. Привычки. Результат.") },
  ];
  return (
    <div className="flex flex-col items-center h-full bg-black px-8">
      <div className="flex-1" />
      <div className="text-white/15"><CatIcon name={pages[page].icon === "money" ? "arrow" : pages[page].icon} className="w-12 h-12" /></div>
      <h1 className="text-2xl font-semibold tracking-tight text-center mt-10 rounded-font">{pages[page].title}</h1>
      <p className="mt-3 text-white/40 text-center">{pages[page].sub}</p>
      <div className="flex gap-2 mt-10">
        {pages.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === page ? "w-1.5 bg-white" : "w-1.5 bg-white/20"}`} />)}
      </div>
      <div className="flex-1" />
      <button onClick={() => (page < 2 ? setPage(page + 1) : onDone())}
        className="w-full py-4 bg-white text-black font-semibold rounded-2xl mb-14 active:scale-[0.98] transition-transform">
        {page === 2 ? t(lang, "Begin", "Начать") : t(lang, "Next", "Дальше")}
      </button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FOCUS SETUP
function FocusSetup({ lang, onDone }: { lang: "ru" | "en"; onDone: () => void }) {
  const { tasks, setText } = useFocus();
  const [local, setLocal] = useState(() => tasks.map((tk) => ({ id: tk.id, text: tk.text })));
  const allFilled = local.every((tk) => tk.text.trim());

  const handleDone = () => {
    local.forEach((l) => setText(l.id, l.text));
    onDone();
  };

  return (
    <div className="flex flex-col h-full bg-black px-6">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-[28px] font-bold rounded-font text-center">
          {t(lang, "Today's focus", "Фокус на день")}
        </h1>
        <p className="text-white/40 text-center mt-3 text-[15px]">
          {t(lang, "Write 3 important tasks for today", "Напиши 3 важных дела на сегодня")}
        </p>
        <div className="space-y-3 mt-10">
          {local.map((task, i) => (
            <div key={task.id} className="flex items-center gap-3">
              <span className="text-white/15 text-sm font-bold rounded-font w-5 text-right">{i + 1}</span>
              <input
                value={task.text}
                onChange={(e) => setLocal((prev) => prev.map((tk) => (tk.id === task.id ? { ...tk, text: e.target.value } : tk)))}
                placeholder={t(lang, "Important task…", "Важная задача…")}
                autoFocus={i === 0}
                className="flex-1 bg-[#16171D] rounded-2xl px-4 py-4 outline-none placeholder:text-white/20 text-[17px] border border-white/[0.06]"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleDone}
        disabled={!allFilled}
        className={`w-full py-4 font-semibold rounded-2xl mb-14 active:scale-[0.98] transition-all ${
          allFilled ? "bg-white text-black" : "bg-white/[0.07] text-white/20"
        }`}
      >
        {t(lang, "Start the day", "Начать день")}
      </button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TAB BAR
function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { settings } = useSettings();
  const lang = settings.lang;
  const items: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "home", icon: <HomeIcon />, label: t(lang, "Home", "Главная") },
    { id: "money", icon: <CatIcon name="arrow" className="w-[22px] h-[22px]" />, label: t(lang, "Money", "Деньги") },
    { id: "ideas", icon: <CatIcon name="bulb" className="w-[22px] h-[22px]" />, label: t(lang, "Ideas", "Идеи") },
    { id: "mind", icon: <CatIcon name="brain" className="w-[22px] h-[22px]" />, label: "Mind" },
    { id: "settings", icon: <GearIcon />, label: t(lang, "More", "Ещё") },
  ];
  return (
    <nav className="flex items-center justify-around border-t border-white/[0.07] bg-[#0A0A0C]/95 backdrop-blur pb-[max(env(safe-area-inset-bottom),8px)] pt-2 px-1">
      {items.map((it) => (
        <button key={it.id} onClick={() => setTab(it.id)}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${tab === it.id ? "text-white" : "text-white/30"}`}>
          {it.icon}
          <span className="text-[10px] font-medium rounded-font">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
const HomeIcon = () => <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="currentColor"><path d="M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3l9-8z" /></svg>;
const GearIcon = () => <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 00-2.3-1.3L13.7 2h-3.4l-.3 2.4a7 7 0 00-2.3 1.3L5.4 4.8l-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 002.3 1.3l.3 2.4h3.4l.3-2.4a7 7 0 002.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z" strokeLinejoin="round" /></svg>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HOME
function HomeTab() {
  const { settings } = useSettings();
  const lang = settings.lang;
  const { txns } = useTxns();
  const { goal } = useGoal();
  const { tasks, fireScore, setText, toggle } = useFocus();
  const [add, setAdd] = useState<null | boolean>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const rates = useRates();
  const cur = settings.currency;
  const fm = (v: number, plus = false) => formatMoney(v, cur, plus);
  const bal = balance(txns, rates, cur), mi = monthIncome(txns, rates, cur), ti = todayIncome(txns, rates, cur);
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? t(lang, "Good morning", "Доброе утро")
    : hour < 17 ? t(lang, "Good afternoon", "Добрый день")
    : hour < 23 ? t(lang, "Good evening", "Добрый вечер") : t(lang, "Good night", "Доброй ночи");
  const done = tasks.filter((x) => x.text && x.done).length;
  const total = tasks.filter((x) => x.text).length;
  const monthName = new Date().toLocaleDateString(lang === "ru" ? "ru" : "en", { month: "long" });

  return (
    <div className="px-5 pt-14 pb-6 space-y-[18px]">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[22px] font-bold rounded-font">{greeting}</h1>
          <p className="text-sm text-white/50">{new Date().toLocaleDateString(lang === "ru" ? "ru" : "en", { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>
        {fireScore > 0 && (
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-2">
            <CatIcon name="flame" className="w-4 h-4" /><span className="text-sm font-bold rounded-font">{Number.isInteger(fireScore) ? fireScore : fireScore.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* balance */}
      <Card>
        <p className="text-[13px] text-white/50 font-medium">{t(lang, "Total balance", "Общий баланс")}</p>
        {txns.length === 0
          ? <p className="text-[30px] font-semibold text-white/50 mt-2 rounded-font">{t(lang, "Ready to begin", "Готов к старту")}</p>
          : <p className="text-[44px] leading-none font-bold mt-3 tracking-tight rounded-font">{fm(bal)}</p>}
        <div className="flex gap-2.5 mt-4">
          <MiniStat label={t(lang, "Today", "Сегодня")} value={fm(ti, ti > 0)} />
          <MiniStat label={t(lang, "This month", "За месяц")} value={fm(mi, mi > 0)} />
        </div>
      </Card>

      {/* goal */}
      <Card onClick={() => setShowGoal(true)}>
        {goal && goal.amount > 0 ? (
          <div className="flex items-center gap-4">
            <ProgressRing progress={mi / goal.amount} size={84} />
            <div>
              <p className="text-[13px] text-white/50 font-medium">{t(lang, "Monthly goal", "Цель месяца")}</p>
              <p className="text-xl font-bold rounded-font mt-0.5">{fm(mi)} / {fm(goal.amount)}</p>
              <p className="text-xs text-white/30 mt-0.5 capitalize">{monthName}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CatIcon name="infinity" className="w-5 h-5 text-white/70" />
            <span className="font-medium">{t(lang, "Set a monthly goal", "Поставить цель на месяц")}</span>
            <span className="ml-auto text-white/25">›</span>
          </div>
        )}
      </Card>

      {/* quick add */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setAdd(true)} className="flex items-center justify-center gap-2 py-4 bg-white/10 rounded-2xl font-semibold active:scale-[0.97] transition-transform">
          <span className="text-lg leading-none">+</span> {t(lang, "Income", "Доход")}
        </button>
        <button onClick={() => setAdd(false)} className="flex items-center justify-center gap-2 py-4 bg-white/[0.05] rounded-2xl font-medium text-white/50 active:scale-[0.97] transition-transform">
          <span className="text-lg leading-none">−</span> {t(lang, "Expense", "Расход")}
        </button>
      </div>

      {/* focus */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[19px] font-semibold rounded-font">{t(lang, "Today's focus", "Фокус на день")}</h3>
          {total > 0 && <span className="text-sm text-white/50 font-semibold rounded-font">{done}/{total}</span>}
        </div>
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <button onClick={() => task.text && toggle(task.id)} className={task.done ? "text-white" : "text-white/25"}>
                {task.done
                  ? <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" /></svg>
                  : <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /></svg>}
              </button>
              <input value={task.text} onChange={(e) => setText(task.id, e.target.value)}
                placeholder={t(lang, "Important task…", "Важная задача…")}
                className={`flex-1 bg-transparent outline-none placeholder:text-white/20 ${task.done ? "line-through text-white/30" : ""}`} />
            </div>
          ))}
        </div>
      </Card>

      {/* daily report */}
      <button onClick={() => setShowReport(true)} className="w-full">
        <Card className="flex items-center gap-3">
          <CatIcon name="leaf" className="w-5 h-5 text-white/80" />
          <span className="font-medium">{t(lang, "Daily report", "Ежедневный отчёт")}</span>
          <span className="ml-auto text-white/25">›</span>
        </Card>
      </button>

      {add !== null && <AddTxnSheet open onClose={() => setAdd(null)} isIncome={add} />}
      <GoalSheet open={showGoal} onClose={() => setShowGoal(false)} />
      <ReportSheet open={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-white/[0.04] rounded-2xl px-3 py-2.5">
      <p className="text-[11px] text-white/30">{label}</p>
      <p className="text-[15px] font-semibold rounded-font mt-0.5">{value}</p>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ADD TXN
function AddTxnSheet({ open, onClose, isIncome: preset }: { open: boolean; onClose: () => void; isIncome: boolean }) {
  const { settings, setCurrency } = useSettings();
  const lang = settings.lang;
  const { txns, add } = useTxns();
  const [isIncome, setIsIncome] = useState(preset);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);

  const value = parseFloat(amount.replace(",", ".")) || 0;
  const suggestions = [...new Set(txns.filter((x) => x.source).map((x) => x.source))].slice(0, 8);

  const save = () => {
    if (value <= 0) return;
    add({ amount: value, isIncome, source: source.trim(), note: note.trim(), currency: settings.currency, date: new Date(date + "T12:00:00").toISOString() });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}
      title={isIncome ? t(lang, "New income", "Новый доход") : t(lang, "New expense", "Новый расход")}
      action={<button onClick={save} disabled={value <= 0} className={`text-[15px] font-semibold ${value > 0 ? "text-white" : "text-white/25"}`}>{t(lang, "Save", "Готово")}</button>}>
      <div className="space-y-5 pt-1">
        <div className="flex gap-1.5 p-1.5 bg-[#16171D] rounded-[20px]">
          {[true, false].map((inc) => (
            <button key={String(inc)} onClick={() => setIsIncome(inc)}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${isIncome === inc ? "bg-white text-black" : "text-white/50"}`}>
              {inc ? t(lang, "Income", "Доход") : t(lang, "Expense", "Расход")}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center py-3">
          <div className="flex items-baseline">
            <span className={`text-[40px] font-bold rounded-font ${isIncome ? "text-white" : "text-white/50"}`}>{isIncome ? "+" : "−"}</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" autoFocus
              className="text-[56px] font-bold rounded-font bg-transparent outline-none text-center w-auto max-w-[240px] placeholder:text-white/20"
              style={{ width: `${Math.max(amount.length, 1) + 1}ch` }} />
          </div>
          <div className="flex gap-2 mt-1">
            {currencies.map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${settings.currency === c ? "bg-white text-black" : "bg-white/[0.06] text-white/40"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Source", "Источник")}</p>
          <input value={source} onChange={(e) => setSource(e.target.value)}
            placeholder={t(lang, "e.g. client website", "Например: сайт для клиента")}
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20" />
          {suggestions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setSource(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${source === s ? "bg-white text-black" : "bg-white/[0.05] text-white/55"}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Note", "Заметка")}</p>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t(lang, "Short note…", "Короткая заметка…")}
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20" />
        </div>

        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Date", "Дата")}</p>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none text-white/80 [color-scheme:dark]" />
        </div>
      </div>
    </Sheet>
  );
}

function GoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const lang = settings.lang;
  const { goal, setGoal } = useGoal();
  const [amount, setAmount] = useState(goal?.amount ? String(goal.amount) : "");
  return (
    <Sheet open={open} onClose={onClose} title={t(lang, "Monthly goal", "Цель на месяц")}>
      <div className="space-y-4 pt-1">
        <div className="flex flex-col items-center py-4">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" autoFocus
            className="text-[52px] font-bold rounded-font bg-transparent outline-none text-center placeholder:text-white/20"
            style={{ width: `${Math.max(amount.length, 1) + 1}ch` }} />
          <span className="text-[13px] text-white/30 font-medium">{settings.currency}</span>
        </div>
        <button onClick={() => { const a = parseFloat(amount.replace(",", ".")) || 0; if (a > 0) { setGoal(a); onClose(); } }}
          className="w-full py-4 bg-white text-black font-semibold rounded-2xl active:scale-[0.98] transition-transform">{t(lang, "Save", "Сохранить")}</button>
      </div>
    </Sheet>
  );
}

function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useSettings();
  const lang = settings.lang;
  const { txns } = useTxns();
  const rates = useRates();
  const { log, saveReport } = useDayLog();
  const [earned, setEarned] = useState(log?.earned ? String(log.earned) : (todayIncome(txns, rates, settings.currency) || ""));
  const [didToday, setDidToday] = useState(log?.didToday ?? "");
  const [didntWork, setDidntWork] = useState(log?.didntWork ?? "");
  const [planTomorrow, setPlanTomorrow] = useState(log?.planTomorrow ?? "");

  const save = () => {
    saveReport({ earned: parseFloat(String(earned).replace(",", ".")) || 0, didToday, didntWork, planTomorrow });
    onClose();
  };

  const Field = ({ label, value, set, placeholder, big, decimal }: { label: string; value: string; set: (v: string) => void; placeholder: string; big?: boolean; decimal?: boolean }) => (
    <div>
      <p className="text-[13px] text-white/50 font-medium mb-2">{label}</p>
      {big ? (
        <textarea value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} rows={2}
          className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20 resize-none" />
      ) : (
        <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} inputMode={decimal ? "decimal" : "text"}
          className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20" />
      )}
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} title={t(lang, "Daily report", "Отчёт за день")}
      action={<button onClick={save} className="text-[15px] font-semibold text-white">{t(lang, "Save", "Готово")}</button>}>
      <div className="space-y-4 pt-1">
        <Field label={t(lang, "How much did you earn today?", "Сколько заработал сегодня?")} value={String(earned)} set={(v) => setEarned(v)} placeholder={settings.currency} decimal />
        <Field label={t(lang, "What did you do today?", "Что сделал сегодня?")} value={didToday} set={setDidToday} placeholder={t(lang, "Main wins…", "Главные результаты…")} big />
        <Field label={t(lang, "What didn't work out?", "Что не получилось?")} value={didntWork} set={setDidntWork} placeholder={t(lang, "What to improve…", "Чему научился…")} big />
        <Field label={t(lang, "Plan for tomorrow", "План на завтра")} value={planTomorrow} set={setPlanTomorrow} placeholder={t(lang, "Next steps…", "3 шага вперёд…")} big />
      </div>
    </Sheet>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MONEY
function MoneyTab() {
  const { settings } = useSettings();
  const lang = settings.lang;
  const { txns, remove } = useTxns();
  const rates = useRates();
  const cur = settings.currency;
  const [range, setRange] = useState<Range>("week");
  const [showAdd, setShowAdd] = useState(false);
  const fm = (v: number, plus = false) => formatMoney(v, cur, plus);

  const series = periodSeries(txns, range, lang, rates, cur);
  const rangeIncome = series.income.reduce((s, v) => s + v, 0);
  const rangeExpense = series.expense.reduce((s, v) => s + v, 0);
  const tops = topSources(txns, rates, cur);
  const periodLabel = range === "week" ? t(lang, "Income · this week", "Доход · за неделю")
    : range === "month" ? t(lang, "Income · this month", "Доход · за месяц") : t(lang, "Income · this year", "Доход · за год");

  const grouped = Object.entries(
    txns.reduce<Record<string, Txn[]>>((acc, tx) => { (acc[tx.date.slice(0, 10)] ||= []).push(tx); return acc; }, {})
  ).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold rounded-font">{t(lang, "Money", "Деньги")}</h1>
        <button onClick={() => setShowAdd(true)} className="text-white/70 p-1">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
        </button>
      </div>

      {txns.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24">
          <div className="w-full max-w-[260px] opacity-50"><LineChart income={[]} labels={[]} height={100} /></div>
          <h2 className="text-2xl font-semibold mt-8 rounded-font">{t(lang, "Start tracking.", "Начни отслеживать.")}</h2>
          <p className="text-white/40 mt-2">{t(lang, "Every number is progress.", "Каждая цифра — шаг вперёд.")}</p>
          <button onClick={() => setShowAdd(true)} className="mt-7 px-9 py-3.5 bg-white text-black font-semibold rounded-full active:scale-[0.97] transition-transform">{t(lang, "Log", "Записать")}</button>
        </div>
      ) : (
        <div className="space-y-[18px]">
          <Segmented value={range} onChange={setRange}
            options={[["week", t(lang, "Week", "Неделя")], ["month", t(lang, "Month", "Месяц")], ["year", t(lang, "Year", "Год")]]} />

          <Card padding="p-[22px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/50 font-medium rounded-font">{periodLabel}</p>
                <p className="text-[34px] leading-none font-bold rounded-font mt-1.5">{fm(rangeIncome)}</p>
              </div>
              {rangeExpense > 0 && (
                <div className="space-y-1.5">
                  <Legend label={t(lang, "Income", "Доход")} opacity={0.85} weight={1.8} />
                  <Legend label={t(lang, "Expense", "Расход")} opacity={0.15} weight={1.2} />
                </div>
              )}
            </div>
            <div className="mt-6"><LineChart income={series.income} expense={series.expense} labels={series.labels} height={180} /></div>
          </Card>

          {tops.length > 0 && (
            <Card>
              <h3 className="text-[19px] font-semibold rounded-font mb-4">{t(lang, "Top sources", "Лучшие источники")}</h3>
              <div className="space-y-3.5">
                {tops.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{s.name}</span>
                      <span className="font-semibold rounded-font">{fm(s.total)}</span>
                    </div>
                    <div className="h-[5px] bg-white/[0.07] rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${(s.total / (tops[0]?.total || 1)) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <ExchangeCard lang={lang} rates={rates} />

          <h3 className="text-[19px] font-semibold rounded-font pt-1">{t(lang, "History", "История")}</h3>
          {grouped.map(([dk, items]) => (
            <div key={dk}>
              <p className="text-xs text-white/30 font-semibold mb-2 ml-1 rounded-font">{new Date(dk + "T12:00:00").toLocaleDateString(lang === "ru" ? "ru" : "en", { weekday: "short", day: "numeric", month: "short" })}</p>
              <Card padding="p-0" className="divide-y divide-white/[0.06]">
                {items.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-3.5 py-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.isIncome ? "bg-white/10" : "bg-white/[0.04]"}`}>
                      <span className={tx.isIncome ? "text-white" : "text-white/50"}>{tx.isIncome ? "↙" : "↗"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.source || t(lang, "No source", "Без источника")}</p>
                      {tx.note && <p className="text-xs text-white/40 truncate">{tx.note}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold rounded-font ${tx.isIncome ? "" : "text-white/40"}`}>{formatMoney(tx.isIncome ? tx.amount : -tx.amount, tx.currency || cur, true)}</span>
                      {(tx.currency && tx.currency !== cur) && <p className="text-[10px] text-white/25">{fm(tx.isIncome ? convertCurrency(tx.amount, tx.currency, cur, rates) : -convertCurrency(tx.amount, tx.currency, cur, rates))}</p>}
                    </div>
                    <button onClick={() => remove(tx.id)} className="text-white/20 ml-1 p-1">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M9 7V4h6v3m-7 0v13h8V7" /></svg>
                    </button>
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

function ExchangeCard({ lang, rates }: { lang: "ru" | "en"; rates: Record<string, number> }) {
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("RUB");
  const [inputVal, setInputVal] = useState("1");
  const hasRates = Object.keys(rates).length > 0;
  const parsed = parseFloat(inputVal.replace(",", ".")) || 0;
  const converted = hasRates ? convertCurrency(parsed, fromCur, toCur, rates) : 0;

  const swap = () => { setFromCur(toCur); setToCur(fromCur); };

  const fmtRate = (from: string, to: string) => {
    if (!hasRates) return "—";
    const r = convertCurrency(1, from, to, rates);
    return r < 1 ? r.toFixed(4) : r.toFixed(2);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[19px] font-semibold rounded-font">{t(lang, "Exchange rates", "Курсы валют")}</h3>
        {hasRates && <span className="text-[10px] text-white/20 rounded-font">live</span>}
      </div>
      {hasRates ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[["USD", "RUB"], ["USD", "TJS"], ["RUB", "TJS"]].map(([a, b]) => (
              <div key={a + b} className="bg-white/[0.04] rounded-xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-white/30">{a}/{b}</p>
                <p className="text-sm font-semibold rounded-font mt-0.5">{fmtRate(a, b)}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#16171D] rounded-2xl p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  {currencies.map((c) => (
                    <button key={c} onClick={() => { setFromCur(c); if (c === toCur) setToCur(fromCur); }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${fromCur === c ? "bg-white text-black" : "bg-white/[0.06] text-white/40"}`}>{c}</button>
                  ))}
                </div>
                <button onClick={swap} className="text-white/30 p-1.5 active:scale-90 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 12l-3-3m3 3l3-3M17 8v12m0-12l3 3m-3-3l-3 3" /></svg>
                </button>
              </div>
              <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} inputMode="decimal" placeholder="0"
                className="w-full bg-transparent outline-none text-[32px] font-bold rounded-font placeholder:text-white/20" />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div>
              <div className="flex gap-1.5 mb-2">
                {currencies.map((c) => (
                  <button key={c} onClick={() => { setToCur(c); if (c === fromCur) setFromCur(toCur); }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${toCur === c ? "bg-white text-black" : "bg-white/[0.06] text-white/40"}`}>{c}</button>
                ))}
              </div>
              <p className="text-[32px] font-bold rounded-font text-white/60">{converted < 1 ? converted.toFixed(4) : converted.toFixed(2)}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-white/30">{t(lang, "Loading rates…", "Загрузка курсов…")}</p>
      )}
    </Card>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex gap-1 p-1 bg-[#16171D] rounded-2xl">
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${value === v ? "bg-white/10 text-white" : "text-white/40"}`}>{label}</button>
      ))}
    </div>
  );
}

function Legend({ label, opacity, weight }: { label: string; opacity: number; weight: number }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="w-4 rounded-full" style={{ height: weight, background: `rgba(255,255,255,${opacity})` }} />
      <span className="text-xs text-white/30">{label}</span>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ IDEAS
function IdeasTab() {
  const { settings } = useSettings();
  const lang = settings.lang;
  const { ideas, add, update, remove, togglePin } = useIdeas();
  const [filter, setFilter] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);

  const filtered = (filter ? ideas.filter((i) => i.category === filter) : ideas)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold rounded-font">{t(lang, "Ideas", "Идеи")}</h1>
        <button onClick={() => setShowNew(true)} className="text-white/70 p-1">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        <Chip active={!filter} onClick={() => setFilter(null)}>{t(lang, "All", "Все")}</Chip>
        {ideaCats.map((c) => <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c[lang]}</Chip>)}
      </div>

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center pt-20 text-center px-4">
          <span className="text-5xl text-white/10">◌</span>
          <h2 className="text-2xl font-semibold mt-6 rounded-font">{t(lang, "Every great thing starts as an idea.", "Всё великое начинается с идеи.")}</h2>
          <p className="text-white/40 mt-2">{t(lang, "Write it down before it fades.", "Запиши, пока помнишь.")}</p>
          <button onClick={() => setShowNew(true)} className="mt-7 px-9 py-3.5 bg-white text-black font-semibold rounded-full active:scale-[0.97] transition-transform">{t(lang, "Capture", "Записать")}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => (
            <Card key={idea.id} onClick={() => setEditing(idea)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">{ideaCats.find((c) => c.id === idea.category)?.icon}</span>
                <span className="text-xs text-white/45 font-medium">{ideaCats.find((c) => c.id === idea.category)?.[lang]}</span>
                {idea.pinned && <span className="ml-auto text-white/40 text-xs">📌</span>}
              </div>
              <p className="font-semibold">{idea.title || t(lang, "Untitled", "Без названия")}</p>
              {idea.details && <p className="text-sm text-white/45 mt-1 line-clamp-2">{idea.details}</p>}
            </Card>
          ))}
        </div>
      )}

      {showNew && <IdeaSheet lang={lang} onClose={() => setShowNew(false)} onSave={(d) => { add(d); setShowNew(false); }} />}
      {editing && <IdeaSheet lang={lang} idea={editing} onClose={() => setEditing(null)}
        onSave={(d) => { update(editing.id, d); setEditing(null); }}
        onDelete={() => { remove(editing.id); setEditing(null); }}
        onPin={() => { togglePin(editing.id); setEditing(null); }} />}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${active ? "bg-white text-black" : "bg-white/[0.05] text-white/50"}`}>{children}</button>;
}

function IdeaSheet({ lang, idea, onClose, onSave, onDelete, onPin }: {
  lang: "ru" | "en"; idea?: Idea; onClose: () => void;
  onSave: (d: { title: string; details: string; category: Idea["category"] }) => void; onDelete?: () => void; onPin?: () => void;
}) {
  const [title, setTitle] = useState(idea?.title ?? "");
  const [details, setDetails] = useState(idea?.details ?? "");
  const [cat, setCat] = useState<Idea["category"]>(idea?.category ?? "business");
  const canSave = title.trim() || details.trim();
  return (
    <Sheet open onClose={onClose} title={idea ? t(lang, "Idea", "Идея") : t(lang, "New idea", "Новая идея")}
      action={<button onClick={() => canSave && onSave({ title, details, category: cat })} disabled={!canSave} className={`text-[15px] font-semibold ${canSave ? "text-white" : "text-white/25"}`}>{t(lang, "Save", "Готово")}</button>}>
      <div className="pt-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {ideaCats.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.icon} {c[lang]}</Chip>)}
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(lang, "Idea title", "Название идеи")} autoFocus
          className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 text-lg font-semibold outline-none placeholder:text-white/20 mb-3" />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t(lang, "Details…", "Подробнее…")} rows={4}
          className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20 resize-none" />
        {idea && (
          <div className="flex gap-3 mt-4">
            {onPin && <button onClick={onPin} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm text-white/60">{idea.pinned ? t(lang, "Unpin", "Открепить") : t(lang, "Pin", "Закрепить")}</button>}
            {onDelete && <button onClick={onDelete} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm text-red-400">{t(lang, "Delete", "Удалить")}</button>}
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SETTINGS
function SettingsTab() {
  const { settings, setLang, setCurrency } = useSettings();
  const lang = settings.lang;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="px-5 pt-14 pb-6 space-y-[18px]">
      <h1 className="text-[28px] font-bold rounded-font mb-2">{t(lang, "More", "Ещё")}</h1>

      <Section title={t(lang, "Language", "Язык")}>
        <div className="flex gap-2">
          {(["en", "ru"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`flex-1 py-3 rounded-xl font-medium transition-colors ${lang === l ? "bg-white text-black" : "bg-white/[0.06] text-white/50"}`}>{l === "en" ? "English" : "Русский"}</button>
          ))}
        </div>
      </Section>

      <Section title={t(lang, "Currency", "Валюта")}>
        <div className="flex flex-wrap gap-2">
          {currencies.map((c) => (
            <button key={c} onClick={() => setCurrency(c)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${settings.currency === c ? "bg-white text-black" : "bg-white/[0.06] text-white/50"}`}>{c}</button>
          ))}
        </div>
      </Section>

      <Section title={t(lang, "Sync", "Синхронизация")}>
        <p className="text-sm text-white/70">{t(lang, "Stored on this device", "Хранится на устройстве")}</p>
        <p className="text-xs text-white/30 mt-1.5">{t(lang, "Your data lives privately in this browser. Add aly to your home screen to keep it close.", "Данные приватно хранятся в этом браузере. Добавь aly на экран «Домой», чтобы держать под рукой.")}</p>
      </Section>

      <Section title={t(lang, "About", "О приложении")}>
        <div className="flex justify-between text-sm"><span>{t(lang, "Version", "Версия")}</span><span className="text-white/40 rounded-font">1.0</span></div>
        <div className="h-px bg-white/[0.07] my-3" />
        <button onClick={() => setConfirmReset(true)} className="text-red-400 text-sm font-medium">{t(lang, "Reset all data", "Сбросить все данные")}</button>
      </Section>

      <p className="text-center text-xs text-white/20 pt-2">aly · {t(lang, "your personal life dashboard", "личный дашборд жизни")}</p>

      {confirmReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6" onClick={() => setConfirmReset(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#1C1E26] rounded-3xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold mb-2">{t(lang, "Delete all data?", "Удалить все данные?")}</p>
            <p className="text-sm text-white/40 mb-6">{t(lang, "This cannot be undone.", "Это нельзя отменить.")}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-3 bg-white/[0.06] rounded-2xl text-sm">{t(lang, "Cancel", "Отмена")}</button>
              <button onClick={() => { ["aly_txns", "aly_ideas", "aly_goals", "aly_focus", "aly_logs", "aly_reading", "aly_highlights", "aly_saved"].forEach((k) => localStorage.removeItem(k)); location.reload(); }}
                className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-2xl text-sm font-medium">{t(lang, "Delete", "Удалить")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2 ml-1 rounded-font">{title}</p>
      <Card>{children}</Card>
    </div>
  );
}
