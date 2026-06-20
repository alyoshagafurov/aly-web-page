"use client";

import { useState } from "react";
import { useSettings } from "@/lib/store";
import { Card, t } from "@/components/pwa/ui";

const currencies = ["USD", "RUB", "TJS"];

export default function SettingsTab() {
  const { settings, setLang, setCurrency, setSavingsGoal } = useSettings();
  const lang = settings.lang;
  const [confirmReset, setConfirmReset] = useState(false);
  const [savGoal, setSavGoal] = useState(settings.savingsGoal ? String(settings.savingsGoal) : "");

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

      <Section title={t(lang, "Savings goal", "Цель накоплений")}>
        <div className="flex gap-2">
          <input value={savGoal} onChange={(e) => setSavGoal(e.target.value)} inputMode="decimal"
            placeholder={t(lang, "Target amount…", "Целевая сумма…")}
            className="flex-1 bg-[#16171D] rounded-xl px-4 py-2.5 outline-none placeholder:text-white/20 text-sm" />
          <button onClick={() => { const v = parseFloat(savGoal.replace(",", ".")) || 0; if (v > 0) setSavingsGoal(v); }}
            className="px-4 py-2.5 bg-white/[0.06] rounded-xl text-sm font-medium text-white/60">{t(lang, "Set", "Ок")}</button>
        </div>
        <p className="text-xs text-white/25 mt-2">{t(lang, "Shows 'months to goal' on home screen", "Покажет «сколько до цели» на главной")}</p>
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
