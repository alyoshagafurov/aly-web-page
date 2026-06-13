"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { cn } from "@/lib/cn";

const links = [
  { label: "Overview", href: "#showcase" },
  { label: "Features", href: "#features" },
  { label: "Reading", href: "#reading" },
  { label: "Preview", href: "#preview" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ease-premium",
          scrolled
            ? "glass shadow-soft"
            : "border border-transparent bg-transparent"
        )}
      >
        <a href="#top" className="text-[19px] font-semibold tracking-tightest text-white">
          aly
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[14px] text-white/60 transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <MagneticButton href="#cta" className="px-5 py-2.5 text-[14px]" strength={0.25}>
          Download
        </MagneticButton>
      </nav>
    </motion.header>
  );
}
