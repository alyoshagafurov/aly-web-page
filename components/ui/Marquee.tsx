import { cn } from "@/lib/cn";

/** Infinite, edge-faded marquee row. Content is duplicated for a seamless loop. */
export default function Marquee({
  items,
  className,
  separator = "·",
}: {
  items: string[];
  className?: string;
  separator?: string;
}) {
  const row = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-8 text-[15px] font-medium text-white/30">
            {it}
            <span className="text-white/15">{separator}</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
}
