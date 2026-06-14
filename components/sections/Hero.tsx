"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import Shot from "@/components/app/Shot";
import { useLang } from "@/lib/i18n";
import { EASE } from "@/lib/motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};

export default function Hero() {
  const { t } = useLang();

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-16">
      <div className="absolute inset-0 -z-10 grid-faint" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]"
        animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6"
      >
        <div className="text-center lg:text-left">
          <motion.div
            variants={item}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[13px] text-white/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t("Personal life dashboard", "Личный дашборд жизни")}
          </motion.div>

          <motion.h1 variants={item} className="display text-balance text-[clamp(2.7rem,8vw,6rem)] font-semibold text-white">
            {t("Your money, ideas", "Деньги, идеи")}
            <br />
            {t("and goals — in focus.", "и цели — в фокусе.")}
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-md text-balance text-[17px] leading-relaxed text-white/55 lg:mx-0"
          >
            {t(
              "The calm, beautiful home for everything that moves your life forward.",
              "Спокойный красивый дом для всего, что двигает твою жизнь вперёд."
            )}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            <MagneticButton href="/app">
              {t("Open app", "Открыть")}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-70">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
            <MagneticButton href="#showcase" variant="ghost" strength={0.2}>
              {t("See it move", "Смотреть")}
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <FloatingPhone />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <div className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/15 p-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-scroll-dot" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">{t("Scroll", "Листай")}</span>
      </motion.div>
    </section>
  );
}

function FloatingPhone() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18, mass: 0.5 });

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className="flex justify-center" style={{ perspective: 1300 }} onMouseMove={onMove} onMouseLeave={reset}>
      <motion.div
        className="w-[256px] sm:w-[300px]"
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Shot name="home" glow priority />
      </motion.div>
    </div>
  );
}
