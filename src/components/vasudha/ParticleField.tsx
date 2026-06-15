import { useMemo } from "react";

export function ParticleField({ count = 24 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 14,
        delay: Math.random() * 18,
        duration: 16 + Math.random() * 18,
        opacity: 0.25 + Math.random() * 0.5,
        kind: Math.random() > 0.5 ? "leaf" : "dot",
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[-10vh]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.kind === "leaf" ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
              <path
                d="M12 2C7 6 4 10 4 15a8 8 0 0016 0c0-5-3-9-8-13z"
                fill="currentColor"
                className="text-accent"
              />
            </svg>
          ) : (
            <span className="block h-full w-full rounded-full bg-sunlight/60 blur-[1px]" />
          )}
        </span>
      ))}
    </div>
  );
}