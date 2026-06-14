"use client";

import { motion } from "framer-motion";
import Shot from "@/components/app/Shot";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import { useLang } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

const authors = [
  "Marcus Aurelius", "Robert Greene", "Chris Voss", "Daniel Kahneman",
  "James Clear", "Viktor Frankl", "Robert Cialdini", "Mark Manson", "Eric Berne",
];

export default function Reading() {
  const { t } = useLang();

  const themes = [
    t("Strong Quotes", "Сильные цитаты"), t("Psychology", "Психология"), t("Mindset", "Мышление"),
    t("Discipline", "Дисциплина"), t("Self Growth", "Саморазвитие"), t("Communication", "Коммуникация"),
    t("Sales & Influence", "Продажи и влияние"), t("Thinking", "Ум и решения"),
    t("Human Nature", "Природа людей"), t("Stoicism", "Стоицизм"), t("Deep Ideas", "Глубокие идеи"),
  ];

  const stats: [string, string][] = [
    ["90+", t("curated insights, zero fluff", "кураторских мыслей, без воды")],
    ["11", t("themes — psychology to stoicism", "тем — от психологии до стоицизма")],
    ["∞", t("distraction-free custom reader", "ридер без отвлечений")],
  ];

  return (
    <section id="reading" className="relative overflow-hidden px-6 py-28 sm:py-36">
      <div className="absolute inset-0 -z-10 grid-faint opacity-50" />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">Mind</p>
            <h2 className="display mt-5 text-[clamp(2.3rem,5.5vw,4.4rem)] font-semibold">
              {t("Book reading mode.", "Режим чтения книг.")}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-white/55 lg:mx-0">
              {t(
                "The sharpest ideas from the books that shape how you think — distilled into cards you read in seconds, with a calm reader for the full text.",
                "Сильнейшие мысли из книг, которые формируют мышление — в карточках на пару секунд, и спокойный ридер для полного текста."
              )}
            </p>

            <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-3xl border border-white/[0.07] lg:mx-0">
              {stats.map(([v, l], i) => (
                <div
                  key={v}
                  className="flex items-center gap-5 bg-white/[0.02] px-6 py-5 text-left"
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="display w-16 shrink-0 text-[30px] font-semibold">{v}</span>
                  <span className="text-[14px] text-white/50">{l}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 flex justify-center lg:order-2">
            <div className="relative w-[238px] sm:w-[270px]">
              <Shot name="reader" glow />
              <motion.div
                className="glass absolute -bottom-6 -left-12 hidden w-52 rounded-2xl p-4 sm:block"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
              >
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/40">{t("Discipline", "Дисциплина")}</p>
                  <p className="mt-2 font-serif text-[13px] leading-snug text-white">
                    {t("“Systems beat motivation. Show up, the rest follows.”", "«Системы сильнее мотивации. Появляйся — остальное придёт».")}
                  </p>
                  <p className="mt-2 text-[10px] text-white/45">— James Clear</p>
                </motion.div>
              </motion.div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-20">
          <Marquee items={authors} />
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex flex-wrap justify-center gap-2.5">
          {themes.map((th) => (
            <span key={th} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-[13px] text-white/55">
              {th}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
