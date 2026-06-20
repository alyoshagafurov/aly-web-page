"use client";

import { useState, useEffect } from "react";
import {
  useTxns, useGoal, useFocus, useDayLog, useSettings, useRates, useHighlights, today,
  balance, monthIncome, todayIncome, formatMoney,
  runwayMonths, monthsToGoal, weekSummary,
  type Txn,
} from "@/lib/store";
import { Card, Sheet, ProgressRing, CatIcon, t } from "@/components/pwa/ui";
import Mind from "@/components/pwa/Mind";
import MoneyTab from "@/components/pwa/MoneyTab";
import IdeasTab from "@/components/pwa/IdeasTab";
import SettingsTab from "@/components/pwa/SettingsTab";
import AddTxnSheet from "@/components/pwa/AddTxnSheet";

type Tab = "home" | "money" | "ideas" | "mind" | "settings";
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
  const { settings } = useSettings();
  const { tasks, setText, setFinancial } = useFocus();
  const [local, setLocal] = useState(() => tasks.map((tk) => ({ id: tk.id, text: tk.text, financial: false, amount: "" })));
  const allFilled = local.every((tk) => tk.text.trim());

  const handleDone = () => {
    local.forEach((l) => {
      setText(l.id, l.text);
      if (l.financial && parseFloat(l.amount.replace(",", ".")) > 0) {
        setFinancial(l.id, true, parseFloat(l.amount.replace(",", ".")), settings.currency);
      }
    });
    onDone();
  };

  const toggleFin = (id: string) => setLocal((prev) => prev.map((tk) => (tk.id === id ? { ...tk, financial: !tk.financial, amount: tk.financial ? "" : tk.amount } : tk)));

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
            <div key={task.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-white/15 text-sm font-bold rounded-font w-5 text-right">{i + 1}</span>
                <input
                  value={task.text}
                  onChange={(e) => setLocal((prev) => prev.map((tk) => (tk.id === task.id ? { ...tk, text: e.target.value } : tk)))}
                  placeholder={t(lang, "Important task…", "Важная задача…")}
                  autoFocus={i === 0}
                  className="flex-1 bg-[#16171D] rounded-2xl px-4 py-4 outline-none placeholder:text-white/20 text-[17px] border border-white/[0.06]"
                />
                <button onClick={() => toggleFin(task.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${task.financial ? "bg-white text-black" : "bg-white/[0.06] text-white/25"}`}>
                  {settings.currency === "RUB" ? "₽" : settings.currency === "TJS" ? "С" : "$"}
                </button>
              </div>
              {task.financial && (
                <div className="flex items-center gap-3 ml-8">
                  <input
                    value={task.amount}
                    onChange={(e) => setLocal((prev) => prev.map((tk) => (tk.id === task.id ? { ...tk, amount: e.target.value } : tk)))}
                    inputMode="decimal"
                    placeholder={t(lang, "Amount…", "Сумма…")}
                    className="flex-1 bg-[#16171D] rounded-xl px-4 py-3 outline-none placeholder:text-white/20 text-[15px] border border-white/[0.06]"
                  />
                  <span className="text-xs text-white/30">{settings.currency}</span>
                </div>
              )}
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
  const { txns, add: addTxn } = useTxns();
  const { goal } = useGoal();
  const { tasks, allTasks, fireScore, freezesLeft, setText, toggle, linkTxn } = useFocus();
  const { highlights } = useHighlights();
  const [add, setAdd] = useState<null | boolean>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWeek, setShowWeek] = useState(false);

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

  const handleToggle = (task: typeof tasks[0]) => {
    if (!task.text) return;
    const willBeDone = !task.done;
    toggle(task.id);
    if (willBeDone && task.financial && task.linkedAmount && !task.linkedTxnId) {
      const txnId = crypto.randomUUID();
      addTxn({ amount: task.linkedAmount, isIncome: false, source: task.text, note: t(lang, "From daily goal", "Из дневной цели"), currency: task.linkedCurrency || cur, date: new Date().toISOString() });
      linkTxn(task.id, txnId);
    }
  };

  return (
    <div className="px-5 pt-14 pb-6 space-y-[18px]">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[22px] font-bold rounded-font">{greeting}</h1>
          <p className="text-sm text-white/50">{new Date().toLocaleDateString(lang === "ru" ? "ru" : "en", { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>
        <div className="flex items-center gap-2">
          {freezesLeft > 0 && (
            <div className="flex items-center gap-1 text-white/25 text-xs rounded-font">
              <span>❄</span>{freezesLeft}
            </div>
          )}
          {fireScore > 0 && (
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-2">
              <CatIcon name="flame" className="w-4 h-4" /><span className="text-sm font-bold rounded-font">{Number.isInteger(fireScore) ? fireScore : fireScore.toFixed(1)}</span>
            </div>
          )}
        </div>
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

      {/* runway & insights (point 6 & 7) */}
      {txns.length > 0 && (() => {
        const rw = runwayMonths(txns, rates, cur);
        const mtg = settings.savingsGoal ? monthsToGoal(txns, rates, cur, settings.savingsGoal) : null;
        if (rw === null && mtg === null) return null;
        return (
          <div className="flex gap-2.5">
            {rw !== null && (
              <MiniStat label={t(lang, "Runway", "Подушка")}
                value={rw >= 12 ? `${Math.round(rw)} ${t(lang, "mo", "мес")}` : `${rw.toFixed(1)} ${t(lang, "mo", "мес")}`} />
            )}
            {mtg !== null && mtg > 0 && (
              <MiniStat label={t(lang, "Goal in", "Цель через")}
                value={`${mtg.toFixed(1)} ${t(lang, "mo", "мес")}`} />
            )}
          </div>
        );
      })()}

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
              <button onClick={() => handleToggle(task)} className={task.done ? "text-white" : "text-white/25"}>
                {task.done
                  ? <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" /></svg>
                  : <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /></svg>}
              </button>
              <input value={task.text} onChange={(e) => setText(task.id, e.target.value)}
                placeholder={t(lang, "Important task…", "Важная задача…")}
                className={`flex-1 bg-transparent outline-none placeholder:text-white/20 ${task.done ? "line-through text-white/30" : ""}`} />
              {task.financial && (
                <span className="text-[11px] text-white/30 font-semibold rounded-font shrink-0">
                  {formatMoney(task.linkedAmount || 0, task.linkedCurrency || cur)}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* daily report & weekly review */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShowReport(true)} className="w-full">
          <Card className="flex items-center gap-2.5 h-full">
            <CatIcon name="leaf" className="w-5 h-5 text-white/80" />
            <span className="font-medium text-sm">{t(lang, "Daily report", "Ежедневный отчёт")}</span>
          </Card>
        </button>
        <button onClick={() => setShowWeek(true)} className="w-full">
          <Card className="flex items-center gap-2.5 h-full">
            <CatIcon name="eye" className="w-5 h-5 text-white/80" />
            <span className="font-medium text-sm">{t(lang, "Week review", "Обзор недели")}</span>
          </Card>
        </button>
      </div>

      {add !== null && <AddTxnSheet open onClose={() => setAdd(null)} isIncome={add} />}
      <GoalSheet open={showGoal} onClose={() => setShowGoal(false)} />
      <ReportSheet open={showReport} onClose={() => setShowReport(false)} />
      <WeekReviewSheet open={showWeek} onClose={() => setShowWeek(false)} lang={lang} txns={txns} tasks={allTasks} highlights={highlights} rates={rates} cur={cur} />
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
  const { tasks } = useFocus();
  const { log, saveReport } = useDayLog();
  const [earned, setEarned] = useState(log?.earned ? String(log.earned) : (todayIncome(txns, rates, settings.currency) || ""));
  const [didToday, setDidToday] = useState(log?.didToday ?? "");
  const [didntWork, setDidntWork] = useState(log?.didntWork ?? "");
  const [planTomorrow, setPlanTomorrow] = useState(log?.planTomorrow ?? "");
  const [reflection, setReflection] = useState(log?.reflection ?? "");

  const save = () => {
    saveReport({ earned: parseFloat(String(earned).replace(",", ".")) || 0, didToday, didntWork, planTomorrow, reflection: reflection.trim() });
    onClose();
  };

  const filled = tasks.filter((tk) => tk.text.trim());
  const done = filled.filter((tk) => tk.done).length;

  return (
    <Sheet open={open} onClose={onClose} title={t(lang, "Daily report", "Отчёт за день")}
      action={<button onClick={save} className="text-[15px] font-semibold text-white">{t(lang, "Save", "Готово")}</button>}>
      <div className="space-y-4 pt-1">
        {filled.length > 0 && (
          <div>
            <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Today's tasks", "Задачи дня")} — {done}/{filled.length}</p>
            <div className="space-y-2">
              {filled.map((tk) => (
                <div key={tk.id} className="flex items-center gap-2.5">
                  {tk.done
                    ? <svg viewBox="0 0 24 24" className="w-5 h-5 text-white shrink-0" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" /></svg>
                    : <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/25 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /></svg>}
                  <span className={`text-sm ${tk.done ? "text-white/40 line-through" : ""}`}>{tk.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Why did it work / not work?", "Почему получилось / нет?")}</p>
          <input value={reflection} onChange={(e) => setReflection(e.target.value)}
            placeholder={t(lang, "One sentence…", "Одно предложение…")}
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20" />
        </div>
        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "How much did you earn today?", "Сколько заработал сегодня?")}</p>
          <input value={String(earned)} onChange={(e) => setEarned(e.target.value)} placeholder={settings.currency} inputMode="decimal"
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20" />
        </div>
        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Plan for tomorrow", "План на завтра")}</p>
          <textarea value={planTomorrow} onChange={(e) => setPlanTomorrow(e.target.value)} placeholder={t(lang, "Next steps…", "3 шага вперёд…")} rows={2}
            className="w-full bg-[#16171D] rounded-2xl px-4 py-3.5 outline-none placeholder:text-white/20 resize-none" />
        </div>
      </div>
    </Sheet>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ WEEK REVIEW
function WeekReviewSheet({ open, onClose, lang, txns, tasks, highlights, rates, cur }: {
  open: boolean; onClose: () => void; lang: "ru" | "en"; txns: Txn[]; tasks: import("@/lib/store").FocusTask[];
  highlights: import("@/lib/store").Highlight[]; rates: Record<string, number>; cur: string;
}) {
  if (!open) return null;
  const w = weekSummary(txns, tasks, highlights, rates, cur);
  const fm = (v: number) => formatMoney(v, cur);
  return (
    <Sheet open={open} onClose={onClose} title={t(lang, "Week review", "Обзор недели")}>
      <div className="space-y-5 pt-1">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/30 mb-1">{t(lang, "Fire", "Огонь")}</p>
            <p className="text-xl font-bold rounded-font">{w.fire > 0 ? `+${w.fire}` : "0"}</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/30 mb-1">{t(lang, "Tasks", "Задачи")}</p>
            <p className="text-xl font-bold rounded-font">{w.doneCount}/{w.totalCount}</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/30 mb-1">{t(lang, "Days", "Дни")}</p>
            <p className="text-xl font-bold rounded-font">{w.daysActive}/7</p>
          </div>
        </div>

        <div>
          <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Money this week", "Деньги за неделю")}</p>
          <div className="flex gap-2.5">
            <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-white/30">{t(lang, "Income", "Доход")}</p>
              <p className="text-[15px] font-semibold rounded-font mt-0.5">{fm(w.income)}</p>
            </div>
            <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-white/30">{t(lang, "Expenses", "Расходы")}</p>
              <p className="text-[15px] font-semibold rounded-font mt-0.5">{fm(w.expense)}</p>
            </div>
          </div>
        </div>

        {w.topExpenses.length > 0 && (
          <div>
            <p className="text-[13px] text-white/50 font-medium mb-2">{t(lang, "Where money went", "Куда ушли деньги")}</p>
            <div className="space-y-2">
              {w.topExpenses.map((e) => (
                <div key={e.name} className="flex justify-between text-sm">
                  <span className="text-white/70">{e.name}</span>
                  <span className="font-semibold rounded-font">{fm(e.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {w.weekHighlights > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <CatIcon name="quote" className="w-4 h-4" />
            {w.weekHighlights} {t(lang, "quotes saved", "цитат сохранено")}
          </div>
        )}
      </div>
    </Sheet>
  );
}

// MoneyTab, IdeasTab, SettingsTab extracted to @/components/pwa/
