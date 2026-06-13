import { cn } from "@/lib/cn";

export type ScreenVariant = "balance" | "goal" | "money" | "ideas" | "focus" | "wisdom" | "reader";

const num = { fontVariantNumeric: "tabular-nums" } as const;

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-medium text-white/80">
      <span style={num}>9:41</span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 9].map((h, i) => (
            <span key={i} className="w-[2px] rounded-sm bg-white/80" style={{ height: h }} />
          ))}
        </div>
        <svg width="13" height="9" viewBox="0 0 24 16" fill="none" className="opacity-80">
          <rect x="1" y="2" width="20" height="12" rx="3" stroke="#fff" strokeWidth="1.5" />
          <rect x="3" y="4" width="14" height="8" rx="1.5" fill="#fff" />
          <rect x="22" y="6" width="2" height="4" rx="1" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
    </svg>
  );
}

function Bars({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  return (
    <div className={cn("flex items-end gap-[6px]", className)}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-white/30 to-white"
          style={{ height: `${(v / max) * 100}%`, opacity: 0.35 + (v / max) * 0.65 }}
        />
      ))}
    </div>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4", className)}>
      {children}
    </div>
  );
}

export default function AppScreen({ variant = "balance" }: { variant?: ScreenVariant }) {
  return (
    <div className="flex h-full w-full flex-col bg-black text-white">
      <StatusBar />
      <div className="flex-1 px-5 pb-6 pt-7">
        {variant === "balance" && <BalanceScreen />}
        {variant === "goal" && <GoalScreen />}
        {variant === "money" && <MoneyScreen />}
        {variant === "ideas" && <IdeasScreen />}
        {variant === "focus" && <FocusScreen />}
        {variant === "wisdom" && <WisdomScreen />}
        {variant === "reader" && <ReaderScreen />}
      </div>
    </div>
  );
}

function BalanceScreen() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-[11px] text-white/40">Good evening</p>
        <p className="text-[13px] font-medium text-white/70">Thursday, 13 June</p>
      </div>
      <Card>
        <p className="text-[11px] text-white/45">Total balance</p>
        <p className="mt-1 text-[34px] font-semibold leading-none tracking-tight" style={num}>
          $4,820
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
            <p className="text-[10px] text-white/40">Today</p>
            <p className="text-[13px] font-semibold" style={num}>+$320</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
            <p className="text-[10px] text-white/40">This month</p>
            <p className="text-[13px] font-semibold" style={num}>+$2,940</p>
          </div>
        </div>
      </Card>
      <Card className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0">
          <Ring pct={64} />
          <span className="absolute inset-0 grid place-items-center text-[11px] font-bold">64%</span>
        </div>
        <div>
          <p className="text-[11px] text-white/45">Monthly goal</p>
          <p className="text-[14px] font-semibold" style={num}>$1,920 / $3,000</p>
        </div>
      </Card>
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white py-3 text-center text-[13px] font-semibold text-black">+ Income</div>
        <div className="rounded-xl border border-white/12 py-3 text-center text-[13px] font-semibold text-white/80">− Expense</div>
      </div>
    </div>
  );
}

function GoalScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">Monthly goal</p>
      <div className="relative h-44 w-44">
        <Ring pct={64} />
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className="text-[40px] font-semibold leading-none" style={num}>64%</p>
            <p className="mt-2 text-[13px] text-white/50" style={num}>$1,920 / $3,000</p>
          </div>
        </div>
      </div>
      <p className="max-w-[200px] text-[13px] leading-relaxed text-white/45">
        $1,080 to go. You&apos;re ahead of pace.
      </p>
    </div>
  );
}

function MoneyScreen() {
  const sources = [
    { name: "Client website", val: "$1,400", w: "100%" },
    { name: "Telegram app", val: "$820", w: "62%" },
    { name: "CRM build", val: "$720", w: "52%" },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <p className="text-[18px] font-semibold tracking-tight">Money</p>
      <Card>
        <p className="text-[11px] text-white/45">Income · this week</p>
        <p className="mt-1 text-[26px] font-semibold leading-none" style={num}>$2,940</p>
        <Bars data={[4, 7, 5, 9, 6, 11, 8]} className="mt-4 h-20" />
      </Card>
      <Card className="flex-1">
        <p className="text-[12px] font-medium text-white/70">Top sources</p>
        <div className="mt-3 space-y-3">
          {sources.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/80">{s.name}</span>
                <span className="font-semibold" style={num}>{s.val}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white" style={{ width: s.w }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function IdeasScreen() {
  const ideas = [
    { t: "AI invoice reader", c: "AI / Bots" },
    { t: "Portfolio v3", c: "Websites" },
    { t: "Subscription CRM", c: "Business" },
    { t: "Cold email engine", c: "AI / Bots" },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <p className="text-[18px] font-semibold tracking-tight">Ideas</p>
      <div className="flex flex-wrap gap-2">
        {["All", "Business", "Websites", "AI / Bots"].map((c, i) => (
          <span
            key={c}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium",
              i === 0 ? "bg-white text-black" : "bg-white/[0.06] text-white/60"
            )}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="space-y-2.5">
        {ideas.map((idea, i) => (
          <Card key={idea.t} className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">{idea.c}</p>
              <p className="mt-0.5 text-[14px] font-medium">{idea.t}</p>
            </div>
            {i === 0 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M14 4l6 6-4 1-3 6-2-5-5-2 6-3 1-4z" />
              </svg>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FocusScreen() {
  const tasks = [
    { t: "Ship client landing page", done: true },
    { t: "Record product demo", done: true },
    { t: "Plan next sprint", done: false },
  ];
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[18px] font-semibold tracking-tight">Today</p>
        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2c1 4-2 5-2 8a4 4 0 108 0c0-2-1-3-1-5 3 2 5 5 5 9a8 8 0 11-16 0c0-5 4-7 6-12z" />
          </svg>
          <span className="text-[12px] font-semibold" style={num}>7 days</span>
        </div>
      </div>
      <Card className="space-y-3.5">
        <p className="text-[11px] text-white/45">Today&apos;s focus</p>
        {tasks.map((task) => (
          <div key={task.t} className="flex items-center gap-3">
            {task.done ? (
              <Check />
            ) : (
              <span className="h-5 w-5 rounded-full border-2 border-white/25" />
            )}
            <span className={cn("text-[14px]", task.done ? "text-white/40 line-through" : "text-white")}>
              {task.t}
            </span>
          </div>
        ))}
      </Card>
      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white py-3 text-center text-[13px] font-semibold text-black">Productive</div>
        <div className="rounded-xl border border-white/12 py-3 text-center text-[13px] font-semibold text-white/70">Off day</div>
      </div>
    </div>
  );
}

function WisdomScreen() {
  return (
    <div className="flex h-full flex-col gap-4">
      <p className="text-[18px] font-semibold tracking-tight">Mind</p>
      <Card>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">Stoicism</p>
        <p className="mt-3 font-serif text-[17px] leading-snug text-white">
          “You have power over your mind — not outside events. Realize this, and you find strength.”
        </p>
        <p className="mt-3 text-[11px] text-white/45">— Marcus Aurelius</p>
      </Card>
      <Card>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">Psychology</p>
        <p className="mt-3 font-serif text-[15px] leading-snug text-white/90">
          “We decide with emotion, then build the logic to justify it.”
        </p>
        <p className="mt-3 text-[11px] text-white/45">— Daniel Kahneman</p>
      </Card>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {["Discipline", "Mindset", "Influence", "Human Nature"].map((c) => (
          <span key={c} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/55">{c}</span>
        ))}
      </div>
    </div>
  );
}

function ReaderScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-5">
        <div className="mb-2 h-[3px] overflow-hidden rounded-full bg-white/12">
          <div className="h-full rounded-full bg-white" style={{ width: "62%" }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/45">
          <span>Atomic Habits · Ch. 3</span>
          <span>8 min left</span>
        </div>
      </div>
      <p className="font-serif text-[19px] font-semibold leading-tight text-white">The 1% Rule</p>
      <div className="mt-4 space-y-3 font-serif text-[13px] leading-relaxed text-white/80">
        <p>Habits are the compound interest of self-improvement.</p>
        <p className="relative rounded-r-md border-l-2 border-white bg-white/[0.06] py-1.5 pl-3 text-white">
          You do not rise to the level of your goals. You fall to the level of your systems.
        </p>
        <p>Getting 1% better every day counts for a lot in the long run, even when it feels invisible today.</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4 text-white/50">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12v17l-6-3.5L6 21z" /></svg>
        <span className="text-[10px]">Aa</span>
      </div>
    </div>
  );
}
