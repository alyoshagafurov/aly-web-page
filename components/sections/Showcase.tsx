"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Phone from "@/components/app/Phone";
import { useLang } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Showcase() {
  const { t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const screens = useRef<HTMLDivElement[]>([]);
  const captions = useRef<HTMLDivElement[]>([]);

  const items = [
    { shot: "home", label: t("One number", "Одно число"), sub: t("Your whole financial picture in a single, calm view.", "Вся финансовая картина в одном спокойном виде.") },
    { shot: "money", label: t("Real trends", "Реальные тренды"), sub: t("Charts and top sources, the instant you log them.", "Графики и источники — мгновенно после записи.") },
    { shot: "ideas", label: t("Every spark", "Каждая идея"), sub: t("Capture business, web and AI ideas in two taps.", "Бизнес, сайты и AI-идеи в два касания.") },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const screenEls = screens.current.filter(Boolean);
        const capEls = captions.current.filter(Boolean);
        gsap.set([...screenEls.slice(1), ...capEls.slice(1)], { autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=280%", pin: true, scrub: 1, anticipatePin: 1 },
        });
        tl.fromTo(phone.current, { rotateY: -18, rotateX: 6 }, { rotateY: 18, rotateX: -4, ease: "none" }, 0);
        items.forEach((_, i) => {
          if (i === 0) return;
          const at = i / items.length;
          tl.to([screenEls[i - 1], capEls[i - 1]], { autoAlpha: 0, duration: 0.12 }, at)
            .to([screenEls[i], capEls[i]], { autoAlpha: 1, duration: 0.12 }, at + 0.02);
        });
      });
    },
    { scope: root, dependencies: [] }
  );

  return (
    <section id="showcase" ref={root} className="relative flex items-center overflow-hidden px-6 py-24 lg:min-h-screen lg:py-0">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-6 font-mono text-[12px] uppercase tracking-[0.25em] text-white/35">{t("The app", "Приложение")}</p>
          <h2 className="display text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold">{t("Built to disappear.", "Создано, чтобы исчезать.")}</h2>
          <div className="relative mt-8 space-y-7 lg:h-24 lg:space-y-0">
            {items.map((it, i) => (
              <div key={it.shot} ref={(el) => { if (el) captions.current[i] = el; }} className="lg:absolute lg:inset-0">
                <p className="text-[18px] font-medium text-white">{it.label}</p>
                <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-white/50 lg:mx-0">{it.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2" style={{ perspective: "1400px" }}>
          <div ref={phone} className="w-[240px] sm:w-[270px]" style={{ transformStyle: "preserve-3d" }}>
            <Phone glow>
              <div className="relative h-full w-full">
                {items.map((it, i) => (
                  <div
                    key={it.shot}
                    ref={(el) => { if (el) screens.current[i] = el; }}
                    className={i === 0 ? "relative h-full w-full" : "absolute inset-0 hidden lg:block"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/shots/${it.shot}.webp`} alt={it.label} className="h-full w-full object-cover" loading="lazy" />
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
