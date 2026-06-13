"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Phone from "@/components/app/Phone";
import AppScreen, { type ScreenVariant } from "@/components/app/AppScreen";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const items: { v: ScreenVariant; label: string; sub: string }[] = [
  { v: "balance", label: "One number", sub: "Your whole financial picture in a single, calm view." },
  { v: "money", label: "Real trends", sub: "Charts and top sources, the instant you log them." },
  { v: "ideas", label: "Every spark", sub: "Capture business, web and AI ideas in two taps." },
];

export default function Showcase() {
  const root = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const screens = useRef<HTMLDivElement[]>([]);
  const captions = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      // Pinned crossfade is a desktop-only luxury. On mobile everything is
      // simply stacked and visible — no pin, no jank.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const screenEls = screens.current.filter(Boolean);
        const capEls = captions.current.filter(Boolean);
        gsap.set([...screenEls.slice(1), ...capEls.slice(1)], { autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=280%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          phone.current,
          { rotateY: -20, rotateX: 7 },
          { rotateY: 20, rotateX: -5, ease: "none" },
          0
        );

        items.forEach((_, i) => {
          if (i === 0) return;
          const at = i / items.length;
          tl.to([screenEls[i - 1], capEls[i - 1]], { autoAlpha: 0, duration: 0.12 }, at)
            .to([screenEls[i], capEls[i]], { autoAlpha: 1, duration: 0.12 }, at + 0.02);
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      id="showcase"
      ref={root}
      className="relative flex items-center overflow-hidden px-6 py-24 lg:min-h-screen lg:py-0"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* captions */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">The app</p>
          <h2 className="display text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold">Built to disappear.</h2>

          <div className="relative mt-8 space-y-7 lg:h-24 lg:space-y-0">
            {items.map((it, i) => (
              <div
                key={it.v}
                ref={(el) => {
                  if (el) captions.current[i] = el;
                }}
                className="lg:absolute lg:inset-0"
              >
                <p className="text-[18px] font-medium text-white">{it.label}</p>
                <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-white/50 lg:mx-0">
                  {it.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* phone */}
        <div className="order-1 flex justify-center lg:order-2" style={{ perspective: "1400px" }}>
          <div ref={phone} className="w-[240px] sm:w-[270px]" style={{ transformStyle: "preserve-3d" }}>
            <Phone glow>
              <div className="relative h-full w-full">
                {items.map((it, i) => (
                  <div
                    key={it.v}
                    ref={(el) => {
                      if (el) screens.current[i] = el;
                    }}
                    className={i === 0 ? "relative" : "absolute inset-0 hidden lg:block"}
                  >
                    <AppScreen variant={it.v} />
                  </div>
                ))}
              </div>
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}
