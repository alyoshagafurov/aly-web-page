"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import Phone from "@/components/app/Phone";
import AppScreen from "@/components/app/AppScreen";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { EASE } from "@/lib/motion";

const Phone3D = dynamic(() => import("@/components/three/Phone3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="h-[70%] w-[40%] animate-pulse rounded-[2rem] bg-white/[0.03] ring-1 ring-white/5" />
    </div>
  ),
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE } },
};

export default function Hero() {
  const isDesktop = useIsDesktop();
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-16">
      <div className="absolute inset-0 -z-10 grid-faint" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]"
        animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6"
      >
        <div className="text-center lg:text-left">
          <motion.div variants={item} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[13px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Personal life dashboard
          </motion.div>

          <motion.h1
            variants={item}
            className="display text-balance text-[clamp(2.7rem,8vw,6.2rem)] font-semibold text-white"
          >
            Your money, ideas
            <br />
            and goals — in focus.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-md text-balance text-[17px] leading-relaxed text-white/55 lg:mx-0"
          >
            aly is the calm, beautiful home for everything that moves your life forward.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex items-center justify-center gap-3 lg:justify-start"
          >
            <MagneticButton href="#cta">
              Download
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-70">
                <path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
            <MagneticButton href="#showcase" variant="ghost" strength={0.2}>
              See it move
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="relative flex h-[380px] items-center justify-center sm:h-[500px] lg:h-[660px]"
        >
          {isDesktop ? <Phone3D /> : <MobileHeroPhone />}
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
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">Scroll</span>
      </motion.div>
    </section>
  );
}

/** Lightweight floating phone for mobile — no WebGL. */
function MobileHeroPhone() {
  return (
    <motion.div
      className="w-[228px]"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <Phone glow>
        <AppScreen variant="balance" />
      </Phone>
    </motion.div>
  );
}
