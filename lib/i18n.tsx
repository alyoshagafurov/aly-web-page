"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ru";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, ru: string) => string;
};

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (en) => en });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("aly_lang");
    if (saved === "ru" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("aly_lang", l);
    document.documentElement.lang = l;
  };

  const t = (en: string, ru: string) => (lang === "ru" ? ru : en);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
