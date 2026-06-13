"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost";
  className?: string;
  strength?: number;
  onClick?: () => void;
};

/**
 * Magnetic button — the content gently pulls toward the cursor and settles back
 * with a spring. Used for primary CTAs.
 */
export default function MagneticButton({
  children,
  href,
  variant = "solid",
  className,
  strength = 0.35,
  onClick,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium tracking-tight transition-colors duration-500 ease-premium will-change-transform";
  const styles =
    variant === "solid"
      ? "bg-white text-black hover:bg-white/90"
      : "border border-white/15 text-white hover:border-white/30 hover:bg-white/[0.04]";

  return (
    <motion.a
      ref={ref}
      href={href ?? "#"}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn(base, styles, className)}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.a>
  );
}
