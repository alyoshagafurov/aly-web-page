"use client";

import { motion } from "framer-motion";
import Phone from "@/components/app/Phone";
import AppScreen from "@/components/app/AppScreen";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import { EASE } from "@/lib/motion";

const authors = [
  "Marcus Aurelius",
  "Robert Greene",
  "Chris Voss",
  "Daniel Kahneman",
  "James Clear",
  "Viktor Frankl",
  "Robert Cialdini",
  "Mark Manson",
  "Eric Berne",
];

const themes = [
  "Strong Quotes", "Psychology", "Mindset", "Discipline", "Self Growth",
  "Communication", "Sales & Influence", "Thinking", "Human Nature", "Stoicism", "Deep Ideas",
];

const stats: [string, string][] = [
  ["90+", "curated insights, zero fluff"],
  ["11", "themes — psychology to stoicism"],
  ["∞", "distraction-free custom reader"],
];

export default function Reading() {
  return (
    <section id="reading" className="relative overflow-hidden px-6 py-28 sm:py-36">
      <div className="absolute inset-0 -z-10 grid-faint opacity-50" />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* copy */}
          <Reveal className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">Mind</p>
            <h2 className="display mt-5 text-[clamp(2.3rem,5.5vw,4.4rem)] font-semibold">
              Book reading mode.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-white/55 lg:mx-0">
              The sharpest ideas from the books that shape how you think — distilled into cards you
              read in seconds, with a calm, custom reader for the full text.
            </p>

            <div className="mx-auto mt-10 max-w-sm space-y-px overflow-hidden rounded-3xl border border-white/[0.07] lg:mx-0">
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

          {/* device + floating quote */}
          <Reveal delay={0.1} className="order-1 flex justify-center lg:order-2">
            <div className="relative w-[230px] sm:w-[262px]">
              <Phone glow>
                <AppScreen variant="reader" />
              </Phone>

              <motion.div
                className="glass absolute -bottom-6 -left-12 hidden w-52 rounded-2xl p-4 sm:block"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/40">Discipline</p>
                  <p className="mt-2 font-serif text-[13px] leading-snug text-white">
                    “Systems beat motivation. Show up, the rest follows.”
                  </p>
                  <p className="mt-2 text-[10px] text-white/45">— James Clear</p>
                </motion.div>
              </motion.div>
            </div>
          </Reveal>
        </div>

        {/* authors marquee */}
        <Reveal delay={0.1} className="mt-20">
          <Marquee items={authors} />
        </Reveal>

        {/* theme pills */}
        <Reveal delay={0.15} className="mt-8 flex flex-wrap justify-center gap-2.5">
          {themes.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-[13px] text-white/55"
            >
              {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
