"use client";

import { motion } from "framer-motion";
import Shot from "@/components/app/Shot";
import Reveal from "@/components/ui/Reveal";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function Features() {
  const { t } = useLang();

  const features = [
    {
      n: "01",
      shot: "money",
      title: t("Money, in a tap.", "Деньги — в одно касание."),
      desc: t(
        "Log income and expenses in two taps. Balance, sources and trends update instantly.",
        "Доход и расход в два касания. Баланс, источники и тренды обновляются сразу."
      ),
    },
    {
      n: "02",
      shot: "home",
      title: t("Your goals, in focus.", "Цели — в фокусе."),
      desc: t(
        "Set a monthly target and watch a quiet ring fill as you earn your way there.",
        "Поставь цель на месяц и смотри, как спокойно заполняется круг прогресса."
      ),
    },
    {
      n: "03",
      shot: "ideas",
      title: t("Never lose an idea.", "Не теряй идеи."),
      desc: t(
        "Capture business, website and AI ideas the moment they strike — sorted automatically.",
        "Лови бизнес-, веб- и AI-идеи в момент, когда они приходят — всё сортируется само."
      ),
    },
    {
      n: "04",
      shot: "mind",
      title: t("Wisdom, every day.", "Мудрость каждый день."),
      desc: t(
        "The sharpest ideas from great books — plus a calm, custom reader for the full text.",
        "Сильнейшие мысли из великих книг — и спокойный ридер для полного текста."
      ),
    },
  ];

  return (
    <section id="features" className="px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">{t("Features", "Функции")}</p>
          <h2 className="display mt-5 text-[clamp(2.4rem,6vw,4.6rem)] font-semibold">{t("Only what matters.", "Только важное.")}</h2>
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

function FeatureRow({
  n,
  shot,
  title,
  desc,
  reverse,
}: {
  n: string;
  shot: string;
  title: string;
  desc: string;
  reverse: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn("flex justify-center", reverse ? "lg:order-2" : "lg:order-1")}>
        <motion.div
          whileHover={{ rotateY: reverse ? -8 : 8, rotateX: 4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ perspective: 1200 }}
          className="w-[230px] sm:w-[260px]"
        >
          <Shot name={shot} glow />
        </motion.div>
      </Reveal>

      <Reveal delay={0.1} className={cn("text-center lg:text-left", reverse ? "lg:order-1" : "lg:order-2")}>
        <span className="font-mono text-[13px] tracking-[0.2em] text-white/30">{n}</span>
        <h3 className="display mt-4 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold">{title}</h3>
        <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-white/50 lg:mx-0">{desc}</p>
      </Reveal>
    </div>
  );
}
