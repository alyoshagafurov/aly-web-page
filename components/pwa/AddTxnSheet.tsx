"use client";

import { useState } from "react";
import { useTxns, useSettings, today, type Txn } from "@/lib/store";
import { Sheet, t } from "@/components/pwa/ui";

const currencies = ["USD", "RUB", "TJS"];

export default function AddTxnSheet({ open, onClose, isIncome: preset }: { open: boolean; onClose: () => void; isIncome: boolean }) {
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
