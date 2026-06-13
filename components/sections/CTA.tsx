import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden px-6 py-40 text-center sm:py-52">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.07] blur-[130px]" />
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="display text-[clamp(3rem,9vw,7rem)] font-semibold">
            Make today
            <br />
            count.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-md text-[18px] leading-relaxed text-white/50">
            Bring calm to your money, ideas and goals — starting tonight.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <MagneticButton href="#" className="px-9 py-4 text-[16px]">
              Download for iPhone
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-3 .9-3.7 2.3-1.6 2.8-.4 6.9 1.1 9.2.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7 2-1.1 2.7-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.4-.9-2.4-3.7zM14.2 6.3c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2z" />
              </svg>
            </MagneticButton>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/30">
              Free · iOS 17+
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
