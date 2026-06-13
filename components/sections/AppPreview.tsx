"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Phone from "@/components/app/Phone";
import AppScreen, { type ScreenVariant } from "@/components/app/AppScreen";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const screens: { v: ScreenVariant; label: string }[] = [
  { v: "balance", label: "Home" },
  { v: "money", label: "Money" },
  { v: "wisdom", label: "Mind" },
  { v: "reader", label: "Reading" },
  { v: "ideas", label: "Ideas" },
  { v: "focus", label: "Focus" },
];

export default function AppPreview() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

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
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="preview" ref={root} className="relative overflow-hidden py-24 lg:h-[100svh] lg:py-0">
      <div className="flex h-full flex-col justify-center">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory items-center gap-8 overflow-x-auto px-6 lg:snap-none lg:gap-12 lg:overflow-visible lg:px-0 lg:pl-[8vw]"
        >
          {/* intro panel */}
          <div className="flex min-w-[78vw] shrink-0 flex-col justify-center sm:min-w-[60vw] lg:min-w-[40vw] lg:pr-10">
            <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">Preview</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold">
              Every screen,
              <br />
              considered.
            </h2>
            <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-white/45">
              Five surfaces. One language. Drag to explore the whole experience.
            </p>
          </div>

          {/* phones */}
          {screens.map((s) => (
            <div key={s.v} className="shrink-0 snap-center">
              <div className="glass rounded-[2.4rem] p-4">
                <div className="w-[210px] sm:w-[240px]">
                  <Phone>
                    <AppScreen variant={s.v} />
                  </Phone>
                </div>
              </div>
              <p className="mt-5 text-center font-mono text-[12px] uppercase tracking-[0.2em] text-white/35">
                {s.label}
              </p>
            </div>
          ))}

          <div className="min-w-[6vw] shrink-0 lg:min-w-[12vw]" aria-hidden />
        </div>
      </div>
    </section>
  );
}
