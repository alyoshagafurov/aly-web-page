import Reveal from "@/components/ui/Reveal";

const stats = [
  { v: "2 taps", l: "to log a win" },
  { v: "1 home", l: "for money, ideas & goals" },
  { v: "0 clutter", l: "by design" },
];

export default function Experience() {
  return (
    <section className="relative overflow-hidden px-6 py-32 sm:py-44">
      <div className="absolute inset-0 -z-10 grid-faint opacity-70" />
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="display text-[clamp(2.6rem,7vw,5.4rem)] font-semibold">
            Less noise.
            <br />
            <span className="text-white/40">More signal.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-xl text-balance text-[18px] leading-relaxed text-white/50">
            No accounts to manage. No endless settings. Just the few things that move
            your life — made beautiful enough to open every day.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="mx-auto mt-20 max-w-3xl">
        <div className="grid grid-cols-1 divide-y divide-white/[0.07] overflow-hidden rounded-4xl border border-white/[0.07] bg-white/[0.02] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.v} className="px-8 py-10 text-center">
              <p className="display text-[34px] font-semibold sm:text-[40px]">{s.v}</p>
              <p className="mt-2 text-[14px] text-white/45">{s.l}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
