import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Photoreal-ish iPhone frame, pure CSS. Children render inside the screen.
 */
export default function Phone({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-white/10 blur-3xl" />
      )}
      <div className="relative aspect-[9/19.5] w-full rounded-[2.7rem] bg-gradient-to-b from-ink-600 to-ink-900 p-[10px] shadow-soft ring-1 ring-white/10">
        {/* side buttons */}
        <div className="absolute -left-[2px] top-[22%] h-10 w-[2px] rounded-full bg-white/15" />
        <div className="absolute -left-[2px] top-[34%] h-16 w-[2px] rounded-full bg-white/15" />
        <div className="absolute -right-[2px] top-[28%] h-20 w-[2px] rounded-full bg-white/15" />

        <div className="relative h-full w-full overflow-hidden rounded-[2.15rem] bg-black ring-1 ring-white/[0.06]">
          {/* dynamic island */}
          <div className="absolute left-1/2 top-[10px] z-30 h-[20px] w-[32%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/5" />
          {children}
        </div>
      </div>
    </div>
  );
}
