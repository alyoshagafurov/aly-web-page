export interface Insight {
  id: string;
  category: string;
  text: string;
  en?: string;
  author: string;
  source: string;
  bookId?: string;
}

export interface BookChapter { index: number; title: string; content: string; }
export interface Book { id: string; title: string; author: string; category: string; minutes: number; chapters: BookChapter[]; }

export const CATEGORIES = [
  { id: "strongQuotes", en: "Strong Quotes", ru: "Сильные цитаты", subEn: "Lines that stay with you", subRu: "Мысли, которые остаются", icon: "quote" },
  { id: "psychology", en: "Psychology", ru: "Психология", subEn: "How the mind works", subRu: "Как работает разум", icon: "brain" },
  { id: "mindset", en: "Mindset", ru: "Мышление", subEn: "The lens you look through", subRu: "Как ты смотришь на мир", icon: "eye" },
  { id: "discipline", en: "Discipline", ru: "Дисциплина", subEn: "Systems beat motivation", subRu: "Системы сильнее мотивации", icon: "flame" },
  { id: "selfGrowth", en: "Self Growth", ru: "Саморазвитие", subEn: "Better than yesterday", subRu: "Лучше себя вчерашнего", icon: "arrow" },
  { id: "communication", en: "Communication", ru: "Коммуникация", subEn: "Be heard, truly", subRu: "Слышать и быть услышанным", icon: "chat" },
  { id: "salesInfluence", en: "Sales & Influence", ru: "Продажи и влияние", subEn: "The craft of persuasion", subRu: "Искусство убеждать", icon: "hand" },
  { id: "thinking", en: "Thinking", ru: "Ум и решения", subEn: "Biases you can't see", subRu: "Ошибки, которых не видишь", icon: "bulb" },
  { id: "humanNature", en: "Human Nature", ru: "Природа людей", subEn: "What drives people", subRu: "Что движет людьми", icon: "people" },
  { id: "stoicism", en: "Stoicism", ru: "Стоицизм", subEn: "Calm as power", subRu: "Спокойствие как сила", icon: "leaf" },
  { id: "deepIdeas", en: "Deep Ideas", ru: "Глубокие идеи", subEn: "Meaning & freedom", subRu: "Смысл, страдание, свобода", icon: "infinity" },
] as const;

export const catMeta = (id: string) => CATEGORIES.find((c) => c.id === id);

export function paragraphsOf(content: string): string[] {
  return content.split(/\r?\n/).map((p) => p.trim()).filter((p) => p.length > 1);
}

export function chapterMinutes(content: string): number {
  return Math.max(1, Math.round(content.length / 1100));
}

let _insights: Insight[] | null = null;
let _books: Book[] | null = null;

export async function loadInsights(): Promise<Insight[]> {
  if (_insights) return _insights;
  const r = await fetch("/data/insights.json");
  const d = await r.json();
  _insights = d.insights || [];
  return _insights!;
}

export async function loadBooks(): Promise<Book[]> {
  if (_books) return _books;
  const r = await fetch("/data/books.json");
  const d = await r.json();
  _books = d.books || [];
  return _books!;
}

export function quoteOfDay(insights: Insight[]): Insight | null {
  if (!insights.length) return null;
  const epochDay = Math.floor(Date.now() / 86400000);
  return insights[epochDay % insights.length];
}
