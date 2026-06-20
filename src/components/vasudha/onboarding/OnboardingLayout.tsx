import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  /** Partial score (0–100) computed from answers so far — evolves live */
  liveScore?: number;
  /** Stage label for progress storytelling */
  chapterLabel?: string;
  children: ReactNode;
}

const CHAPTER_COLORS = [
  "var(--color-earth-blue)",
  "var(--color-leaf-glow)",
  "var(--color-sunlight)",
  "var(--color-accent)",
  "var(--color-secondary)",
];

export function OnboardingLayout({
  step,
  totalSteps,
  liveScore,
  chapterLabel,
  children,
}: OnboardingLayoutProps) {
  const progress = step / totalSteps;
  const chapterColor = CHAPTER_COLORS[(step - 1) % CHAPTER_COLORS.length];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background — shifts hue per chapter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 55%),
            radial-gradient(ellipse at 75% 80%, color-mix(in oklab, ${chapterColor} 10%, transparent), transparent 50%)
          `,
        }}
      />

      {/* Header row: Earth orb + live score + progress */}
      <div className="mb-8 flex flex-col items-center gap-3 w-full max-w-2xl">
        <div className="flex items-center justify-between w-full px-2">
          {/* Narrative progress label */}
          <motion.p
            key={`label-${step}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {chapterLabel ?? `Chapter ${step} of ${totalSteps}`}
          </motion.p>

          {/* Live VHI badge */}
          <AnimatePresence mode="wait">
            {liveScore !== undefined && (
              <motion.div
                key={`vhi-${Math.round(liveScore)}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: "color-mix(in oklab, var(--color-leaf-glow) 20%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--color-leaf-glow) 35%, transparent)",
                  color: "var(--color-leaf-glow)",
                }}
                aria-live="polite"
                aria-label={`Vasudha Health Index: ${Math.round(liveScore)} of 100`}
              >
                🌱 VHI {Math.round(liveScore)}/100
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--color-secondary), ${chapterColor})`,
            }}
            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {/* Earth Orb */}
        <EarthProgressOrb
          progress={progress}
          step={step}
          totalSteps={totalSteps}
          liveScore={liveScore}
        />
      </div>

      {/* Animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${step}`}
          initial={{ opacity: 0, x: 60, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -60, scale: 0.96 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Earth Progress Orb ───────────────────────────────────────────────────────

function EarthProgressOrb({
  progress,
  step,
  totalSteps,
  liveScore,
}: {
  progress: number;
  step: number;
  totalSteps: number;
  liveScore?: number;
}) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * progress;

  // Earth gets healthier as score rises
  const healthNorm = (liveScore ?? 50) / 100;
  const glowIntensity = Math.round(healthNorm * 55) + 10;

  const orbEmoji =
    !liveScore ? "🌱" :
    healthNorm < 0.3 ? "🌫️" :
    healthNorm < 0.5 ? "🌍" :
    healthNorm < 0.7 ? "🌿" :
    healthNorm < 0.9 ? "🌎" : "✨";

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        {/* Pulsing glow — intensifies as score grows */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            opacity: [0.5, 0.9, 0.5],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, var(--color-leaf-glow) ${glowIntensity}%, transparent), transparent 65%)`,
            filter: "blur(8px)",
          }}
          aria-hidden="true"
        />

        {/* SVG ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="url(#earthGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference - dash }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-sunlight)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Earth emoji centre — changes as score evolves */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={orbEmoji}
              initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="text-3xl"
              aria-hidden="true"
            >
              {orbEmoji}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
