"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  loadInsights, loadBooks, quoteOfDay, paragraphsOf, chapterMinutes,
  CATEGORIES, catMeta, type Insight, type Book,
} from "@/lib/wisdom";
import { useReading, useHighlights, useSaved, useSettings } from "@/lib/store";
import { Card, Sheet, CatIcon, ProgressBar, t } from "./ui";

type Route =
  | { v: "home" }
  | { v: "category"; id: string }
  | { v: "insight"; id: string }
  | { v: "reader"; bookId: string }
  | { v: "saved" };

export default function Mind() {
  const { settings } = useSettings();
  const lang = settings.lang;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const { states } = useReading();
  const [stack, setStack] = useState<Route[]>([{ v: "home" }]);
  const route = stack[stack.length - 1];

  const push = (r: Route) => setStack((s) => [...s, r]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  useEffect(() => { loadInsights().then(setInsights); }, []);
  useEffect(() => { loadBooks().then(setBooks); }, []);

  const bookById = (id: string) => books.find((b) => b.id === id);
  const insightById = (id: string) => insights.find((i) => i.id === id);

  const continueState = states
    .filter((r) => r.percent > 0.005 && bookById(r.bookID))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  if (route.v === "reader") {
    const book = bookById(route.bookId);
    if (book) return <Reader book={book} onBack={pop} />;
  }

  return (
    <div className="px-5 pt-14 pb-6">
      {route.v === "home" && (
        <Home
          lang={lang} insights={insights} books={books}
          continueBook={continueState ? bookById(continueState.bookID) : undefined}
          continuePct={continueState?.percent ?? 0}
          onCategory={(id) => push({ v: "category", id })}
          onInsight={(id) => push({ v: "insight", id })}
          onReader={(bookId) => push({ v: "reader", bookId })}
          onSaved={() => push({ v: "saved" })}
        />
      )}
      {route.v === "category" && (
        <Feed lang={lang} title={catMeta(route.id)?.[lang] || route.id}
          insights={insights.filter((i) => i.category === route.id)}
          onBack={pop} onInsight={(id) => push({ v: "insight", id })} />
      )}
      {route.v === "saved" && (
        <SavedFeed lang={lang} insights={insights} onBack={pop} onInsight={(id) => push({ v: "insight", id })} />
      )}
      {route.v === "insight" && insightById(route.id) && (
        <Detail lang={lang} insight={insightById(route.id)!} onBack={pop}
          onReader={(bookId) => push({ v: "reader", bookId })} />
      )}
    </div>
  );
}

// ── Home ──
function Home({ lang, insights, books, continueBook, continuePct, onCategory, onInsight, onReader, onSaved }: {
  lang: "ru" | "en"; insights: Insight[]; books: Book[];
  continueBook?: Book; continuePct: number;
  onCategory: (id: string) => void; onInsight: (id: string) => void; onReader: (id: string) => void; onSaved: () => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 7 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);
  const quote = quoteOfDay(insights);
  const body = (i: Insight) => (lang === "en" && i.en ? i.en : i.text);

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold rounded-font">Mind</h1>
        <button onClick={onSaved} className="text-white/70 p-1"><CatIcon name="bookmark" className="w-[22px] h-[22px]" /></button>
      </div>
      <p className="text-sm text-white/50 mb-5">{t(lang, "Short, strong ideas — for a clearer mind and quiet confidence.", "Короткие сильные мысли — для ясного ума и спокойной уверенности.")}</p>

      {quote && (
        <Card className="mb-3" padding="p-6" onClick={() => (quote.bookId ? onReader(quote.bookId) : onInsight(quote.id))}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase mb-4 rounded-font">
            <CatIcon name="quote" className="w-3.5 h-3.5" /> {t(lang, "Today's thought", "Мысль дня")}
          </div>
          <p className="text-[22px] leading-[1.45] font-serif text-white/95">{body(quote)}</p>
          <p className="text-sm text-white/50 mt-4 font-medium">— {quote.author}</p>
        </Card>
      )}

      {continueBook && (
        <Card className="mb-3" onClick={() => onReader(continueBook.id)}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase mb-3 rounded-font">
            <CatIcon name="book" className="w-3.5 h-3.5" /> {t(lang, "Continue reading", "Продолжить чтение")}
            <span className="ml-auto">{Math.round(continuePct * 100)}%</span>
          </div>
          <p className="font-serif text-lg text-white/95">{continueBook.title}</p>
          <p className="text-xs text-white/50 mt-0.5">{continueBook.author}</p>
          <ProgressBar value={continuePct} className="mt-3" />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const count = insights.filter((i) => i.category === c.id).length;
          return (
            <Card key={c.id} onClick={() => onCategory(c.id)} className="h-[132px] flex flex-col">
              <CatIcon name={c.icon} className="w-6 h-6 text-white" />
              <div className="mt-auto">
                <p className="font-semibold text-[15px] rounded-font leading-tight">{c[lang]}</p>
                <p className="text-[11px] text-white/45 mt-1 truncate">{c[lang === "ru" ? "subRu" : "subEn"]}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

// ── Insight card (shared) ──
function InsightRow({ lang, insight, onOpen }: { lang: "ru" | "en"; insight: Insight; onOpen: () => void }) {
  const { isSaved, toggle } = useSaved();
  const body = lang === "en" && insight.en ? insight.en : insight.text;
  const meta = catMeta(insight.category);
  const saved = isSaved(insight.id);
  return (
    <div className="relative">
      <Card onClick={onOpen}>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-white/30 uppercase mb-4 pr-8 rounded-font">
          {meta && <CatIcon name={meta.icon} className="w-3 h-3" />} {meta?.[lang] || insight.category}
        </div>
        <p className="text-[19px] leading-[1.5] font-serif text-white/95">{body}</p>
        <div className="flex items-center gap-1.5 mt-4 text-[13px]">
          <span className="font-semibold text-white/55">{insight.author}</span>
          <span className="text-white/30 truncate">· {insight.source}</span>
          {insight.bookId && <span className="ml-auto shrink-0 text-white/80 font-semibold text-xs flex items-center gap-1">{t(lang, "Read", "Читать")} ↗</span>}
        </div>
      </Card>
      <button onClick={() => toggle(insight.id)} className="absolute top-3.5 right-3.5 p-1.5 text-white/40">
        <CatIcon name={saved ? "bookmarkFill" : "bookmark"} className={`w-[18px] h-[18px] ${saved ? "text-white" : ""}`} />
      </button>
    </div>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-5 -mt-2">
      <button onClick={onBack} className="text-white/60 text-lg leading-none">‹</button>
      <h1 className="text-xl font-bold rounded-font">{title}</h1>
    </div>
  );
}

// ── Category feed ──
function Feed({ lang, title, insights, onBack, onInsight }: {
  lang: "ru" | "en"; title: string; insights: Insight[]; onBack: () => void; onInsight: (id: string) => void;
}) {
  return (
    <>
      <BackHeader title={title} onBack={onBack} />
      <div className="space-y-3">
        {insights.map((i) => <InsightRow key={i.id} lang={lang} insight={i} onOpen={() => onInsight(i.id)} />)}
      </div>
    </>
  );
}

// ── Saved feed ──
function SavedFeed({ lang, insights, onBack, onInsight }: {
  lang: "ru" | "en"; insights: Insight[]; onBack: () => void; onInsight: (id: string) => void;
}) {
  const { saved } = useSaved();
  const items = insights.filter((i) => saved.includes(i.id));
  return (
    <>
      <BackHeader title={t(lang, "Saved", "Сохранённое")} onBack={onBack} />
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <CatIcon name="bookmark" className="w-10 h-10 text-white/10" />
          <p className="mt-4 text-white/40">{t(lang, "Nothing saved yet.", "Пока ничего не сохранено.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((i) => <InsightRow key={i.id} lang={lang} insight={i} onOpen={() => onInsight(i.id)} />)}
        </div>
      )}
    </>
  );
}

// ── Insight detail ──
function Detail({ lang, insight, onBack, onReader }: {
  lang: "ru" | "en"; insight: Insight; onBack: () => void; onReader: (id: string) => void;
}) {
  const { isSaved, toggle } = useSaved();
  const body = lang === "en" && insight.en ? insight.en : insight.text;
  const meta = catMeta(insight.category);
  const saved = isSaved(insight.id);
  return (
    <>
      <BackHeader title={meta?.[lang] || ""} onBack={onBack} />
      <div className="flex flex-col min-h-[70vh]">
        <div className="flex-1 flex flex-col justify-center py-6">
          <p className="text-[26px] leading-[1.5] font-serif text-white/95">{body}</p>
          <p className="text-base text-white/55 mt-6 font-medium">— {insight.author}</p>
          <p className="text-sm text-white/30">{insight.source}</p>
        </div>
        <div className="flex gap-3 pb-2">
          <button onClick={() => toggle(insight.id)} className="flex-1 py-3.5 bg-white/[0.06] rounded-2xl font-medium text-[15px] flex items-center justify-center gap-2">
            <CatIcon name={saved ? "bookmarkFill" : "bookmark"} className="w-4 h-4" /> {saved ? t(lang, "Saved", "Сохранено") : t(lang, "Save", "Сохранить")}
          </button>
          {insight.bookId && (
            <button onClick={() => onReader(insight.bookId!)} className="flex-1 py-3.5 bg-white text-black rounded-2xl font-semibold text-[15px]">
              {t(lang, "Read the book", "Читать книгу")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Reader ──
function Reader({ book, onBack }: { book: Book; onBack: () => void }) {
  const { settings, setReaderFont } = useSettings();
  const lang = settings.lang;
  const font = settings.readerFont;
  const { forBook, persist } = useReading();
  const { highlights, toggle: toggleHL } = useHighlights();

  const saved = forBook(book.id);
  const [chapterIdx, setChapterIdx] = useState(saved?.chapterIndex ?? 0);
  const [showChapters, setShowChapters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  const chapter = book.chapters[Math.min(Math.max(chapterIdx, 0), book.chapters.length - 1)];
  const paras = paragraphsOf(chapter.content);

  const chapterHLs = new Set(
    highlights.filter((h) => h.bookID === book.id && h.chapterIndex === chapterIdx).map((h) => h.text)
  );

  const progress = useCallback((firstVisible: number) => {
    const pc = Math.max(1, paras.length);
    const cc = Math.max(1, book.chapters.length);
    return Math.min(1, (chapterIdx + firstVisible / pc) / cc);
  }, [paras.length, book.chapters.length, chapterIdx]);

  const [pct, setPct] = useState(saved?.percent ?? 0);

  // restore scroll
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (saved && saved.paragraphIndex > 0) {
      setTimeout(() => {
        const el = scrollRef.current?.querySelector(`[data-p="${saved.paragraphIndex}"]`);
        el?.scrollIntoView();
      }, 80);
    }
  }, [saved]);

  // track scroll → progress + persist
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ps = root.querySelectorAll("[data-p]");
        const top = root.getBoundingClientRect().top;
        let first = 0;
        for (const p of Array.from(ps)) {
          if (p.getBoundingClientRect().bottom > top + 80) { first = Number((p as HTMLElement).dataset.p); break; }
        }
        const newPct = progress(first);
        setPct(newPct);
        persist(book.id, chapterIdx, first, newPct);
      });
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => { root.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [chapterIdx, progress, book.id, persist]);

  const goChapter = (i: number) => {
    setChapterIdx(i);
    setShowChapters(false);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="fixed inset-0 z-[55] bg-[#0A0A0C] flex flex-col">
      {/* top bar */}
      <div className="pt-[max(env(safe-area-inset-top),12px)] px-4">
        <div className="flex items-center justify-between h-11">
          <button onClick={onBack} className="text-white/70 text-2xl leading-none w-8">‹</button>
          <p className="text-sm font-medium text-white/80 truncate px-2">{book.title}</p>
          <div className="flex items-center gap-1 w-16 justify-end">
            <button onClick={() => setMenuOpen((v) => !v)} className="text-white/70 p-1.5 text-sm font-bold">A</button>
            <button onClick={() => setShowChapters(true)} className="text-white/70 p-1.5">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h0M4 12h0M4 18h0" /></svg>
            </button>
          </div>
        </div>
        <ProgressBar value={pct} className="mb-1" />
        {menuOpen && (
          <div className="absolute right-4 top-16 z-10 bg-[#26282F] rounded-2xl p-1 flex items-center gap-1 shadow-xl border border-white/10">
            <button onClick={() => setReaderFont(font - 1)} className="w-10 h-10 rounded-xl hover:bg-white/10 text-sm">A−</button>
            <span className="text-xs text-white/40 w-6 text-center">{font}</span>
            <button onClick={() => setReaderFont(font + 1)} className="w-10 h-10 rounded-xl hover:bg-white/10 text-base">A+</button>
          </div>
        )}
      </div>

      {/* content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar" onClick={() => menuOpen && setMenuOpen(false)}>
        <div className="max-w-[680px] mx-auto px-6 pb-24">
          <div className="pt-3 pb-4">
            <p className="text-xs text-white/30 font-medium rounded-font">{t(lang, `Chapter ${chapterIdx + 1} of ${book.chapters.length}`, `Глава ${chapterIdx + 1} из ${book.chapters.length}`)}</p>
            <h2 className="font-serif font-semibold text-white mt-2" style={{ fontSize: font + 9 }}>{chapter.title}</h2>
            <p className="text-xs text-white/30 mt-2">{t(lang, `~${chapterMinutes(chapter.content)} min read`, `~${chapterMinutes(chapter.content)} мин чтения`)}</p>
          </div>

          {paras.map((para, idx) => {
            const hl = chapterHLs.has(para);
            return (
              <p key={idx} data-p={idx}
                onDoubleClick={() => toggleHL({ bookID: book.id, chapterIndex: chapterIdx, text: para })}
                className={`font-serif text-white/[0.86] select-text ${hl ? "border-l-2 border-white pl-3.5 bg-white/[0.05] rounded-r-md py-1.5" : ""}`}
                style={{ fontSize: font, lineHeight: 1.7, marginBottom: font * 0.95 }}>
                {para}
              </p>
            );
          })}

          {/* chapter nav */}
          <div className="flex items-center justify-between mt-8">
            <button disabled={chapterIdx === 0} onClick={() => goChapter(chapterIdx - 1)}
              className="px-4 py-2.5 rounded-full bg-white/[0.05] text-sm font-medium disabled:opacity-30">‹ {t(lang, "Previous", "Назад")}</button>
            <button disabled={chapterIdx >= book.chapters.length - 1} onClick={() => goChapter(chapterIdx + 1)}
              className="px-4 py-2.5 rounded-full bg-white/[0.05] text-sm font-medium disabled:opacity-30">{t(lang, "Next", "Дальше")} ›</button>
          </div>
        </div>
      </div>

      <Sheet open={showChapters} onClose={() => setShowChapters(false)} title={t(lang, "Chapters", "Главы")}>
        <div className="space-y-0.5">
          {book.chapters.map((ch, i) => (
            <button key={i} onClick={() => goChapter(i)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left ${i === chapterIdx ? "bg-white/[0.06]" : ""}`}>
              <span className="text-sm font-semibold text-white/30 rounded-font w-7 shrink-0">{i + 1}</span>
              <span className={`text-sm line-clamp-2 ${i === chapterIdx ? "text-white" : "text-white/55"}`}>{ch.title}</span>
              {i === chapterIdx && <span className="ml-auto text-white text-xs">✓</span>}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
