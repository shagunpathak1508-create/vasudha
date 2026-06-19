import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  children: ReactNode;
}

export function OnboardingLayout({
  step,
  totalSteps,
  children,
}: OnboardingLayoutProps) {
  const progress = step / totalSteps;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--color-primary) 20%, transparent), transparent 55%), radial-gradient(ellipse at 75% 80%, color-mix(in oklab, var(--color-earth-blue) 12%, transparent), transparent 50%)",
        }}
      />

      {/* Earth Progress Orb */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <EarthProgressOrb progress={progress} step={step} totalSteps={totalSteps} />
      </div>

      {/* Animated content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
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

function EarthProgressOrb({
  progress,
  step,
  totalSteps,
}: {
  progress: number;
  step: number;
  totalSteps: number;
}) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * progress;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, var(--color-leaf-glow) ${Math.round(progress * 50)}%, transparent), transparent 65%)`,
            filter: `blur(8px)`,
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
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-sunlight)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Earth emoji centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={step}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl"
            aria-hidden="true"
          >
            {progress < 0.3 ? "🌱" : progress < 0.6 ? "🌍" : progress < 0.9 ? "🌿" : "✨"}
          </motion.span>
        </div>
      </div>

      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase" aria-live="polite">
        Step {step} of {totalSteps}
      </p>
    </div>
  );
}
