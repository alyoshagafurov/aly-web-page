"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Phone from "@/components/app/Phone";
import { useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AppPreview() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const screens = [
    { shot: "home", label: t("Home", "Главная") },
    { shot: "money", label: t("Money", "Деньги") },
    { shot: "mind", label: "Mind" },
    { shot: "reader", label: t("Reading", "Чтение") },
    { shot: "ideas", label: t("Ideas", "Идеи") },
    { shot: "stoicism", label: t("Stoicism", "Стоицизм") },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current;
        const sec = root.current;
        if (!el || !sec) return;
        const distance = () => el.scrollWidth - sec.clientWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + distance(), pin: true, scrub: 1, invalidateOnRefresh: true },
        });
      });
    },
    { scope: root, dependencies: [] }
  );

  return (
    <section id="preview" ref={root} className="relative overflow-hidden py-24 lg:h-[100svh] lg:py-0">
      <div className="flex h-full flex-col justify-center">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory items-center gap-8 overflow-x-auto px-6 lg:snap-none lg:gap-12 lg:overflow-visible lg:px-0 lg:pl-[8vw]"
        >
          <div className="flex min-w-[78vw] shrink-0 flex-col justify-center sm:min-w-[60vw] lg:min-w-[40vw] lg:pr-10">
            <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">{t("Preview", "Экраны")}</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold">
              {t("Every screen,", "Каждый экран")}
              <br />
              {t("considered.", "продуман.")}
            </h2>
            <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-white/45">
              {t("Six surfaces. One language. Drag to explore the whole experience.", "Шесть экранов. Один язык. Листай, чтобы увидеть всё.")}
            </p>
          </div>

          {screens.map((s) => (
            <div key={s.shot} className="shrink-0 snap-center">
              <div className="glass rounded-[2.4rem] p-4">
                <div className="w-[210px] sm:w-[240px]">
                  <Phone>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/shots/${s.shot}.png`} alt={s.label} className="h-full w-full object-cover" loading="lazy" />
                  </Phone>
                </div>
              </div>
              <p className="mt-5 text-center font-mono text-[12px] uppercase tracking-[0.2em] text-white/35">{s.label}</p>
            </div>
          ))}

          <div className="min-w-[6vw] shrink-0 lg:min-w-[12vw]" aria-hidden />
        </div>
      </div>
    </section>
  );
}
