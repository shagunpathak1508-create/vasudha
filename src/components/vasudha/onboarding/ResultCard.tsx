import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Flame, Globe2, AlertTriangle, TrendingUp, Star, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";
import type { EarthProfile, OnboardingAnswers } from "@/lib/carbon";
import { generatePersonalizedInsights } from "@/lib/carbon";
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
    revealText: "Your Earth is alive and thriving. Every choice you make keeps it healthy.",
  },
  balanced: {
    img: balanced,
    label: "🌎 Balanced Earth",
    color: "var(--color-earth-blue)",
    icon: Globe2,
    message: "You're doing well! A few tweaks could push you toward Thriving.",
    revealText: "Your Earth is finding its balance. Small shifts can unlock its full potential.",
  },
  struggling: {
    img: struggling,
    label: "🌍 Struggling Earth",
    color: "oklch(0.75 0.18 50)",
    icon: AlertTriangle,
    message: "Your Earth feels the strain — but every step you take helps it heal.",
    revealText: "Your Earth is under pressure, but healing is possible. The journey starts now.",
  },
  critical: {
    img: struggling,
    label: "🔥 Critical Earth",
    color: "oklch(0.65 0.2 30)",
    icon: Flame,
    message: "Big changes are possible. The Eco Coach will guide you, step by step.",
    revealText: "Your Earth needs urgent care — but transformation is within reach.",
  },
};

// Floating particle effect for the reveal
function FloatingParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            background: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -60 - Math.random() * 80],
            x: [(Math.random() - 0.5) * 60],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 1.5,
            delay: Math.random() * 1.2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated score counter
function AnimatedScore({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{displayed}</>;
}

interface ResultCardProps {
  profile: EarthProfile;
  answers?: OnboardingAnswers;
}

export function ResultCard({ profile, answers }: ResultCardProps) {
  const cfg = STATE_CONFIG[profile.state];
  const [revealed, setRevealed] = useState(false);

  // Trigger the reveal sequence after mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const insights = answers
    ? generatePersonalizedInsights(answers, profile)
    : null;

  return (
    <div className="flex flex-col items-center gap-10 px-4 py-12 max-w-2xl mx-auto">
      {/* ── Dramatic Heading ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <p
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: "var(--color-accent)" }}
        >
          Your Personal Earth Has Been Revealed
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          Vasudha Health Index
        </h1>
      </motion.div>

      {/* ── Earth + Score Reveal ── */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-60 w-60 items-center justify-center"
      >
        {/* Atmospheric glow halo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 60px 20px color-mix(in oklab, ${cfg.color} 25%, transparent)`,
              `0 0 100px 40px color-mix(in oklab, ${cfg.color} 40%, transparent)`,
              `0 0 60px 20px color-mix(in oklab, ${cfg.color} 25%, transparent)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />

        {/* Particle burst on reveal */}
        <AnimatePresence>
          {revealed && <FloatingParticles color={cfg.color} />}
        </AnimatePresence>

        <img
          src={cfg.img}
          alt={cfg.label}
          className="relative h-full w-full object-contain drop-shadow-2xl animate-float-y"
        />

        {/* Score badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-2xl font-bold"
          style={{
            background: `color-mix(in oklab, ${cfg.color} 80%, transparent)`,
            backdropFilter: "blur(12px)",
            color: "var(--color-foreground)",
          }}
        >
          <AnimatedScore target={profile.score} />/100
        </motion.div>
      </motion.div>

      {/* ── State label + reveal text ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-center space-y-2"
      >
        <div className="font-display text-2xl font-bold">{cfg.label}</div>
        <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
          {insights?.earthStatusSummary ?? cfg.revealText}
        </p>
      </motion.div>

      {/* ── Personalized Insights Grid ── */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full grid grid-cols-2 gap-4"
        >
          {/* Biggest Impact Area */}
          <InsightCard
            delay={0.72}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Biggest Impact Area"
            title={insights.biggestImpactLabel}
            sub={`Fixing this could unlock up to +${insights.biggestImpactScoreBoost} VHI points`}
            color="oklch(0.65 0.2 28)"
          />

          {/* Best Performing Area */}
          <InsightCard
            delay={0.8}
            icon={<Star className="h-4 w-4" />}
            label="Best Performing Area"
            title={insights.bestAreaLabel}
            sub="Your Earth shines brightest here — keep it up!"
            color="var(--color-leaf-glow)"
          />

          {/* Easiest Improvement */}
          <InsightCard
            delay={0.88}
            icon={<Zap className="h-4 w-4" />}
            label="Easiest Improvement"
            title={insights.easiestWinLabel}
            sub={insights.easiestWinTip}
            color="var(--color-sunlight)"
            colSpan
          />
        </motion.div>
      )}

      {/* ── Potential Score Increase Teaser ── */}
      {insights && insights.easiestWinScoreBoost > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.95 }}
          className="glass-card w-full rounded-2xl p-5 flex items-center gap-4"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ background: "color-mix(in oklab, var(--color-accent) 20%, transparent)" }}
          >
            <Target className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Potential Score Increase
            </p>
            <p className="mt-0.5 font-display text-base font-bold">
              +{insights.easiestWinScoreBoost} points with one change
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {insights.easiestWinTip}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── CTAs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <Link
          to="/dashboard"
          className="glow-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold transition hover:scale-[1.03]"
          style={{
            background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))",
            color: "var(--color-secondary-foreground)",
          }}
          aria-label="Explore your Earth dashboard"
          id="result-dashboard-btn"
        >
          Explore My Earth Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          to="/simulator"
          className="glass-card inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition hover:bg-white/10"
          aria-label="Try the Future Earth Simulator"
          id="result-simulator-btn"
        >
          Try the Simulator →
        </Link>
      </motion.div>
    </div>
  );
}

// ── Reusable insight card ──────────────────────────────────────────────────────

function InsightCard({
  delay,
  icon,
  label,
  title,
  sub,
  color,
  colSpan,
}: {
  delay: number;
  icon: React.ReactNode;
  label: string;
  title: string;
  sub: string;
  color: string;
  colSpan?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass-card rounded-2xl p-4 space-y-1.5 ${colSpan ? "col-span-2" : ""}`}
    >
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-display text-base font-bold leading-snug">{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
        {sub}
      </p>
    </motion.div>
  );
}
