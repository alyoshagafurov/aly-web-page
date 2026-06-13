"use client";

import { motion } from "framer-motion";
import Phone from "@/components/app/Phone";
import AppScreen, { type ScreenVariant } from "@/components/app/AppScreen";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const features: { n: string; title: string; desc: string; v: ScreenVariant }[] = [
  {
    n: "01",
    title: "Money, in a tap.",
    desc: "Log income and expenses with two taps. Balance, sources and trends update instantly.",
    v: "balance",
  },
  {
    n: "02",
    title: "See the finish line.",
    desc: "Set a monthly target and watch a quiet ring fill as you earn your way there.",
    v: "goal",
  },
  {
    n: "03",
    title: "Never lose an idea.",
    desc: "Capture business, website and AI ideas the moment they strike — sorted automatically.",
    v: "ideas",
  },
  {
    n: "04",
    title: "Show up every day.",
    desc: "A gentle streak that rewards consistency, never pressure. Momentum you can feel.",
    v: "focus",
  },
];

function FeatureRow({
  n,
  title,
  desc,
  v,
  reverse,
}: (typeof features)[number] & { reverse: boolean }) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn("flex justify-center", reverse ? "lg:order-2" : "lg:order-1")}>
        <motion.div
          whileHover={{ rotateY: reverse ? -8 : 8, rotateX: 4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ perspective: 1200 }}
          className="w-[220px] sm:w-[250px]"
        >
          <Phone glow>
            <AppScreen variant={v} />
          </Phone>
        </motion.div>
      </Reveal>

      <Reveal
        delay={0.1}
        className={cn("text-center lg:text-left", reverse ? "lg:order-1" : "lg:order-2")}
      >
        <span className="font-mono text-[13px] tracking-[0.2em] text-white/30">{n}</span>
        <h3 className="display mt-4 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold">{title}</h3>
        <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/50 lg:mx-0">
          {desc}
        </p>
      </Reveal>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">Features</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.6rem)] font-semibold">
            Only what matters.
          </h2>
        </Reveal>

        <div className="mt-20 space-y-28 sm:mt-28 lg:space-y-40">
          {features.map((f, i) => (
            <FeatureRow key={f.n} {...f} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
