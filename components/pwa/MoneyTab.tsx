"use client";

import { useState } from "react";
import {
  useTxns, useSettings, useRates, formatMoney, convertCurrency, periodSeries, topSources,
  type Txn, type Range,
} from "@/lib/store";
import { Card, LineChart, CatIcon, t } from "@/components/pwa/ui";
import AddTxnSheet from "./AddTxnSheet";

const currencies = ["USD", "RUB", "TJS"];

export default function MoneyTab() {
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
