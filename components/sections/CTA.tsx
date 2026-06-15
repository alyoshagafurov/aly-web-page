"use client";

import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLang } from "@/lib/i18n";

export default function CTA() {
  const { t } = useLang();

  return (
    <section id="cta" className="relative overflow-hidden px-6 py-40 text-center sm:py-52">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 65%)" }}
      />
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="display text-[clamp(3rem,9vw,7rem)] font-semibold">
            {t("Make today", "Сделай этот день")}
            <br />
            {t("count.", "важным.")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-md text-[18px] leading-relaxed text-white/50">
            {t(
              "Bring calm to your money, ideas and goals — starting tonight.",
              "Наведи спокойствие в деньгах, идеях и целях — уже сегодня вечером."
            )}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <MagneticButton href="/app" className="px-9 py-4 text-[16px]">
              {t("Open aly", "Открыть aly")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MagneticButton>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/30">{t("Free · Works in browser", "Бесплатно · Работает в браузере")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
