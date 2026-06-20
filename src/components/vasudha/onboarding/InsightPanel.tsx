import { motion } from "framer-motion";

interface InsightPanelProps {
  icon: string;
  headline: string;
  body: string;
  impactTag?: string; // e.g. "−30% transport emissions"
  onContinue: () => void;
  continueLabel?: string;
}

export function InsightPanel({
  icon,
  headline,
  body,
  impactTag,
  onContinue,
  continueLabel = "Continue Journey →",
}: InsightPanelProps) {
  return (
    <motion.div
      key="insight-panel"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-7 text-center max-w-md"
      role="region"
      aria-label="Eco insight"
    >
      {/* Icon halo */}
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--color-sunlight) 40%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <span className="relative text-6xl">{icon}</span>
      </motion.div>

      {/* Insight card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card w-full rounded-2xl p-6 space-y-3"
      >
        {/* Tiny "Did you know" label */}
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--color-accent)" }}
        >
          🌿 Earth Insight
        </p>

        <h3 className="font-display text-xl font-bold leading-snug">{headline}</h3>

        <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
          {body}
        </p>

        {impactTag && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{
              background: "color-mix(in oklab, var(--color-leaf-glow) 20%, transparent)",
              border: "1px solid color-mix(in oklab, var(--color-leaf-glow) 35%, transparent)",
              color: "var(--color-leaf-glow)",
            }}
          >
            ✅ {impactTag}
          </motion.div>
        )}
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        id="insight-continue-btn"
        className="glow-primary rounded-full px-8 py-3.5 text-sm font-bold transition"
        style={{
          background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))",
          color: "var(--color-secondary-foreground)",
        }}
      >
        {continueLabel}
      </motion.button>
    </motion.div>
  );
}
