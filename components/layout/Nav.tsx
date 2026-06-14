"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function Nav() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("Overview", "Обзор"), href: "#showcase" },
    { label: t("Features", "Функции"), href: "#features" },
    { label: t("Reading", "Чтение"), href: "#reading" },
    { label: t("Preview", "Экраны"), href: "#preview" },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ease-premium",
          scrolled ? "glass shadow-soft" : "border border-transparent bg-transparent"
        )}
      >
        <a href="#top" className="text-[19px] font-semibold tracking-tightest text-white">
          aly
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[14px] text-white/60 transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-white/10 p-0.5 text-[12px] font-medium">
            {(["en", "ru"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-full px-2.5 py-1 uppercase transition-colors duration-300",
                  lang === l ? "bg-white text-black" : "text-white/50 hover:text-white"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <MagneticButton href="/app" className="px-5 py-2.5 text-[14px]" strength={0.25}>
            {t("Open app", "Открыть")}
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  );
}
