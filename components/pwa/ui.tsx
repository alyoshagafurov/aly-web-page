"use client";

import React from "react";

// ── Category SVG icons (monochrome, stroke) ──
export function CatIcon({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    quote: <path d="M7 7H4v5h3l-1 5m11-10h-3v5h3l-1 5" {...p} />,
    brain: <path d="M12 5a2.5 2.5 0 00-4.5-1.5A2.5 2.5 0 004.7 6 2.5 2.5 0 004 10.5a2.5 2.5 0 001.2 4.4A2.3 2.3 0 008 18a2.3 2.3 0 004 .4V5zm0 0a2.5 2.5 0 014.5-1.5A2.5 2.5 0 0119.3 6 2.5 2.5 0 0120 10.5a2.5 2.5 0 01-1.2 4.4A2.3 2.3 0 0116 18a2.3 2.3 0 01-4 .4" {...p} />,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    flame: <path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 1-3s0 2 2 2c1.5 0 1-3 2-5 1-1.5 0-3 0-3z" {...p} />,
    arrow: <path d="M7 17L17 7M9 7h8v8" {...p} />,
    chat: <><path d="M8 10h8M8 14h5" {...p} /><path d="M4 5h16v11H8l-4 3V5z" {...p} /></>,
    hand: <path d="M7 11V6a1.5 1.5 0 013 0v4m0-4.5a1.5 1.5 0 013 0V10m0-3a1.5 1.5 0 013 0v6a5 5 0 01-5 5h-1a5 5 0 01-4-2l-3-4a1.5 1.5 0 012-2l1 1" {...p} />,
    bulb: <path d="M9 18h6m-5 3h4m-6-8a5 5 0 117 0c-1 1-1.5 2-1.5 3h-4c0-1-.5-2-1.5-3z" {...p} />,
    people: <><circle cx="8" cy="9" r="2.5" {...p} /><circle cx="16" cy="9" r="2.5" {...p} /><path d="M3 19a5 5 0 0110 0M14 19a5 5 0 016-4.8" {...p} /></>,
    leaf: <path d="M5 19s-1-9 7-13c4 8-1 14-7 13zm0 0c2-4 4-6 7-8" {...p} />,
    infinity: <path d="M6 9a3 3 0 100 6c2 0 3-2 6-3s4-3 6-3a3 3 0 110 6c-2 0-3-2-6-3S8 9 6 9z" {...p} />,
    book: <path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4zm0 0v13" {...p} />,
    bookmark: <path d="M6 4h12v16l-6-4-6 4V4z" {...p} />,
    bookmarkFill: <path d="M6 4h12v16l-6-4-6 4V4z" fill="currentColor" />,
  };
  return <svg viewBox="0 0 24 24" className={className}>{paths[name] ?? paths.infinity}</svg>;
}

// ── Card ──
export function Card({ children, className = "", onClick, padding = "p-[18px]" }: {
  children: React.ReactNode; className?: string; onClick?: () => void; padding?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#16171D] rounded-3xl border border-white/[0.07] ${padding} ${onClick ? "active:scale-[0.98] transition-transform cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Bottom sheet ──
export function Sheet({ open, onClose, title, action, children }: {
  open: boolean; onClose: () => void; title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#1C1E26] rounded-t-[28px] animate-slide-up max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-center pt-3 pb-1"><div className="h-1 w-9 rounded-full bg-white/20" /></div>
        <div className="flex items-center justify-between px-6 py-3">
          <button onClick={onClose} className="text-white/50 text-[15px]">✕</button>
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <div className="min-w-[20px] text-right">{action}</div>
        </div>
        <div className="px-6 pb-10 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}

// ── Progress ring ──
export function ProgressRing({ progress, size = 80 }: { progress: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.min(Math.max(progress, 0), 1);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700 ease-out" />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill="white" fontSize={size * 0.21} fontWeight="700" className="rounded-font">
        {Math.round(p * 100)}%
      </text>
    </svg>
  );
}

// ── Thin progress bar ──
export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }} />
    </div>
  );
}

// ── Premium line chart ──
export function LineChart({ income, expense = [], labels, height = 150 }: {
  income: number[]; expense?: number[]; labels: string[]; height?: number;
}) {
  const cum = (a: number[]) => a.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] || 0) + v], []);
  const ci = cum(income), ce = cum(expense);
  const max = Math.max(...ci, ...ce, 1);
  const hasData = ci.some((v) => v > 0);
  const hasExpense = (ce[ce.length - 1] || 0) > 0;

  const W = 320, H = height, TOP = 18, BOT = 8;
  const usable = H - TOP - BOT;
  const inset = 4, drawW = W - inset * 2;

  const pts = (arr: number[]) => arr.map((v, i) => ({
    x: arr.length === 1 ? W / 2 : inset + (drawW * i) / (arr.length - 1),
    y: TOP + usable - (v / max) * usable,
  }));

  const smooth = (P: { x: number; y: number }[]) => {
    if (P.length < 2) {
      if (P.length === 1) { const p = P[0]; return `M${p.x - 20},${p.y + 4} Q${p.x},${p.y - 8} ${p.x + 20},${p.y - 4}`; }
      return "";
    }
    return P.reduce((d, p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const p0 = P[i - 1], prev = P[i - 2] || p0, next = P[i + 1] || p, t = 5;
      return `${d} C${p0.x + (p.x - prev.x) / t},${p0.y + (p.y - prev.y) / t} ${p.x - (next.x - p0.x) / t},${p.y - (next.y - p0.y) / t} ${p.x},${p.y}`;
    }, "");
  };

  const iPts = pts(ci);
  const sampled = labels.length > 6 ? Array.from({ length: 6 }, (_, i) => labels[Math.round((i * (labels.length - 1)) / 5)]) : labels;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {[0, 1, 2].map((i) => (
          <line key={i} x1="0" y1={TOP + (usable * i) / 2} x2={W} y2={TOP + (usable * i) / 2} stroke="white" strokeOpacity="0.035" strokeWidth="0.5" />
        ))}
        {hasData ? (
          <>
            {hasExpense && <path d={smooth(pts(ce))} fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1.2" strokeLinecap="round" />}
            <path d={smooth(iPts)} fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="chart-draw" pathLength={1} />
            {iPts.length > 0 && (
              <>
                <circle cx={iPts[iPts.length - 1].x} cy={iPts[iPts.length - 1].y} r="7" fill="white" fillOpacity="0.06" />
                <circle cx={iPts[iPts.length - 1].x} cy={iPts[iPts.length - 1].y} r="2.5" fill="white" />
              </>
            )}
          </>
        ) : (
          <path d={`M${W * 0.15},${H * 0.65} Q${W * 0.5},${H * 0.35} ${W * 0.85},${H * 0.45}`} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
        )}
      </svg>
      {sampled.length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          {sampled.map((l, i) => <span key={i} className="text-[10px] text-white/20 font-medium rounded-font">{l}</span>)}
        </div>
      )}
    </div>
  );
}

export const t = (lang: "ru" | "en", en: string, ru: string) => (lang === "ru" ? ru : en);
