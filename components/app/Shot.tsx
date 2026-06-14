import Phone from "./Phone";

/** A real app screenshot presented inside the premium phone frame. */
export default function Shot({
  name,
  className,
  glow = false,
  priority = false,
}: {
  name: string;
  className?: string;
  glow?: boolean;
  priority?: boolean;
}) {
  return (
    <Phone glow={glow} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/shots/${name}.png`}
        alt={`aly — ${name} screen`}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </Phone>
  );
}
