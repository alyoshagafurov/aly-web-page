"use client";

import { useState } from "react";
import { useIdeas, useSettings, type Idea } from "@/lib/store";
import { Card, Sheet, t } from "@/components/pwa/ui";

const ideaCats = [
  { id: "business" as const, en: "Business", ru: "Бизнес", icon: "💼" },
  { id: "website" as const, en: "Websites", ru: "Сайты", icon: "🌐" },
  { id: "ai" as const, en: "AI / Bots", ru: "AI / Боты", icon: "✦" },
  { id: "thought" as const, en: "Thoughts", ru: "Мысли", icon: "◌" },
];

export default function IdeasTab() {
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
