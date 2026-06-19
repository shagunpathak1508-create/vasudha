import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Flame, Globe2, AlertTriangle } from "lucide-react";
import type { EarthProfile } from "@/lib/carbon";
import thriving from "@/assets/earth-thriving.png";
import balanced from "@/assets/earth-balanced.png";
import struggling from "@/assets/earth-struggling.png";

const STATE_CONFIG = {
  thriving: {
    img: thriving,
    label: "🌿 Thriving Earth",
    color: "var(--color-leaf-glow)",
    icon: Leaf,
    message: "Your lifestyle is truly nurturing the planet. You're an eco champion!",
  },
  balanced: {
    img: balanced,
    label: "🌎 Balanced Earth",
    color: "var(--color-earth-blue)",
    icon: Globe2,
    message: "You're doing well! A few tweaks could push you toward Thriving.",
  },
  struggling: {
    img: struggling,
    label: "🌍 Struggling Earth",
    color: "oklch(0.75 0.18 50)",
    icon: AlertTriangle,
    message: "Your Earth feels the strain — but every step you take helps it heal.",
  },
  critical: {
    img: struggling,
    label: "🔥 Critical Earth",
    color: "oklch(0.65 0.2 30)",
    icon: Flame,
    message: "Big changes are possible. The Eco Coach will guide you, step by step.",
  },
};

interface ResultCardProps {
  profile: EarthProfile;
}

export function ResultCard({ profile }: ResultCardProps) {
  const cfg = STATE_CONFIG[profile.state];

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Your Personal Earth
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">
          Vasudha Health Index
        </h1>
      </motion.div>

      {/* Score + Earth */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        className="relative flex h-52 w-52 items-center justify-center"
      >
        {/* Glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, ${cfg.color} 45%, transparent), transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <img
          src={cfg.img}
          alt={cfg.label}
          className="relative h-full w-full object-contain drop-shadow-2xl"
        />
        {/* Score badge */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xl font-bold text-foreground"
          style={{
            background: `color-mix(in oklab, ${cfg.color} 80%, transparent)`,
            backdropFilter: "blur(10px)",
          }}
        >
          {profile.score}/100
        </div>
      </motion.div>

      {/* State Label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div className="font-display text-2xl font-bold">{cfg.label}</div>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {cfg.message}
        </p>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card w-full max-w-md rounded-2xl p-6 space-y-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Biggest Impact Source
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            {profile.topSourceLabel}
          </p>
        </div>
        <div className="h-px bg-border/40" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Potential Improvement
          </p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {profile.improvement}
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/dashboard"
          className="glow-primary inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-base font-semibold text-secondary-foreground transition hover:scale-[1.03] hover:bg-accent"
          aria-label="Go to your Earth dashboard"
        >
          See My Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}
