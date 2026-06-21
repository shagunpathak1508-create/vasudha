import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/vasudha/AppShell";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import { getCachedProfile } from "@/lib/user";
import {
  simulateReductions,
  type EarthProfile,
  type SimulatorToggles,
  generateEarthProfile,
} from "@/lib/carbon";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Future Earth Simulator — Vasudha" },
      { name: "description", content: "Toggle lifestyle changes and watch your living Earth ecosystem transform in real time." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AppShell>
        <SimulatorPage />
      </AppShell>
    </I18nProvider>
  ),
});

// ─── Impact Badge ─────────────────────────────────────────────────────────────

function ImpactBadge({ text, color }: { text: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: -10 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{
        background: `color-mix(in oklab, ${color} 22%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
        color,
      }}
    >
      {text}
    </motion.div>
  );
}

// ─── Animated metric counter ──────────────────────────────────────────────────

function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  color,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  color: string;
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1.2, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="font-display text-xl font-bold"
      style={{ color }}
    >
      {prefix}{value}{suffix}
    </motion.div>
  );
}

// ─── Living Ecosystem SVG (toggle-aware) ─────────────────────────────────────

interface EcosystemProps {
  score: number;
  label: string;
  animated?: boolean;
  toggles?: SimulatorToggles;
}

function LivingEcosystem({ score, label, animated, toggles }: EcosystemProps) {
  const norm = score / 100;

  const skyBlue = `oklch(${0.25 + norm * 0.25} ${0.04 + norm * 0.08} ${210 + norm * 30})`;
  const groundGreen = `oklch(${0.2 + norm * 0.25} ${0.05 + norm * 0.12} ${140 + norm * 10})`;
  const hazeOpacity = Math.max(0, 0.7 - norm * 0.75);
  const treeCount = Math.round(2 + norm * 8);
  const birdVisible = norm > 0.65;
  // Wildlife (deer silhouette) appears when both plantBased + publicTransport toggled
  const deerVisible = toggles
    ? (toggles.publicTransport && toggles.plantBased) || norm > 0.82
    : norm > 0.82;
  const waterBlue = `oklch(${0.3 + norm * 0.2} ${0.06 + norm * 0.12} 235)`;
  // River width grows when recycling improved
  const riverWidth = toggles?.improveRecycling ? (norm > 0.4 ? 14 : 9) : (norm > 0.4 ? 12 : 6);
  // Haze is further reduced when AC reduced
  const hazeOpacityFinal = toggles?.reduceAC
    ? Math.max(0, hazeOpacity - 0.2)
    : hazeOpacity;

  const treeXPositions = [30, 60, 100, 150, 200, 240, 270, 300, 320, 340];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 240 }}>
      <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden="true">
        {/* Sky gradient */}
        <defs>
          <linearGradient id={`sky-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyBlue} />
            <stop offset="100%" stopColor={groundGreen} />
          </linearGradient>
          <radialGradient id={`sun-${label}`} cx="80%" cy="15%" r="30%">
            <stop offset="0%" stopColor="oklch(0.9 0.15 90)" stopOpacity={norm * 0.8} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="380" height="240" fill={`url(#sky-${label})`} />

        {/* Sun halo */}
        <ellipse cx="304" cy="36" rx="90" ry="90" fill={`url(#sun-${label})`} />

        {/* Clouds — cleaner when score high */}
        {[1, 2, 3].map((i) => (
          <motion.g
            key={i}
            animate={animated ? { x: [0, 8, 0] } : {}}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse
              cx={40 + i * 90}
              cy={20 + i * 8}
              rx={28 - i * 3}
              ry={12}
              fill="white"
              opacity={0.05 + norm * 0.18}
            />
          </motion.g>
        ))}

        {/* Pollution haze — reduced by reduceAC toggle */}
        <motion.rect
          x="0" y="60" width="380" height="100"
          fill="oklch(0.4 0.05 40)"
          animate={{ opacity: hazeOpacityFinal }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Smog particles — disappear when toggles active */}
        <AnimatePresence>
          {hazeOpacityFinal > 0.25 && [1, 2, 3, 4].map((i) => (
            <motion.circle
              key={`smog-${i}`}
              cx={50 + i * 70}
              cy={80 + (i % 2) * 20}
              r={8 + i * 2}
              fill="oklch(0.35 0.03 40)"
              initial={{ opacity: 0 }}
              animate={{ opacity: hazeOpacityFinal * 0.6, scale: [1, 1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </AnimatePresence>

        {/* River — widens with improveRecycling, colour brightens with score */}
        <motion.path
          d="M 0 185 Q 95 175 190 182 Q 285 189 380 180"
          fill="none"
          stroke={waterBlue}
          animate={{ strokeWidth: riverWidth }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ opacity: 0.4 + norm * 0.5 }}
        >
          {animated && (
            <animate
              attributeName="d"
              values="M 0 185 Q 95 175 190 182 Q 285 189 380 180;M 0 183 Q 95 177 190 184 Q 285 187 380 182;M 0 185 Q 95 175 190 182 Q 285 189 380 180"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </motion.path>

        {/* Ground */}
        <rect x="0" y="188" width="380" height="52" fill={groundGreen} />

        {/* Trees — grow one-by-one */}
        {treeXPositions.slice(0, treeCount).map((x, i) => {
          const h = 25 + (i % 3) * 15;
          const w = 18 + (i % 4) * 6;
          return (
            <motion.g
              key={`tree-${i}`}
              initial={animated ? { scaleY: 0, opacity: 0 } : { scaleY: 1 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: `${x}px 190px` }}
            >
              <rect x={x - 3} y={190 - h} width={6} height={h} fill={`oklch(${0.25 + norm * 0.1} 0.08 135)`} />
              <ellipse
                cx={x}
                cy={190 - h - w * 0.6}
                rx={w * 0.55}
                ry={w * 0.65}
                fill={`oklch(${0.35 + norm * 0.2} ${0.1 + norm * 0.1} 140)`}
              />
              {/* Fruit/flower when plantBased toggled */}
              {toggles?.plantBased && i % 3 === 0 && (
                <motion.circle
                  cx={x + 5}
                  cy={190 - h - w * 0.3}
                  r={3}
                  fill="oklch(0.75 0.18 50)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                />
              )}
            </motion.g>
          );
        })}

        {/* Birds — appear at high score */}
        <AnimatePresence>
          {birdVisible && [1, 2, 3].map((i) => (
            <motion.g
              key={`bird-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.3 }}
            >
              <motion.path
                d={`M ${60 + i * 80} ${30 + i * 12} q 6 -5 12 0 q 6 5 12 0`}
                fill="none"
                stroke="oklch(0.9 0.04 180)"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={animated ? { y: [0, -4, 0], x: [0, 6, 12] } : {}}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Deer silhouette — appears when both transport + plantBased toggled */}
        <AnimatePresence>
          {deerVisible && (
            <motion.g
              key="deer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              {/* Simple deer shape */}
              <ellipse cx="52" cy="205" rx="12" ry="7" fill="oklch(0.55 0.08 55)" />
              <rect x="50" y="195" width="4" height="12" fill="oklch(0.55 0.08 55)" />
              <ellipse cx="52" cy="193" rx="5" ry="4" fill="oklch(0.55 0.08 55)" />
              {/* Antlers */}
              <line x1="51" y1="190" x2="47" y2="184" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
              <line x1="47" y1="184" x2="44" y2="181" stroke="oklch(0.45 0.08 55)" strokeWidth="1" />
              <line x1="53" y1="190" x2="57" y2="184" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
              <line x1="57" y1="184" x2="60" y2="181" stroke="oklch(0.45 0.08 55)" strokeWidth="1" />
              {/* Legs */}
              <line x1="44" y1="211" x2="44" y2="219" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
              <line x1="49" y1="212" x2="49" y2="220" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
              <line x1="55" y1="212" x2="55" y2="220" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
              <line x1="60" y1="211" x2="60" y2="219" stroke="oklch(0.45 0.08 55)" strokeWidth="1.5" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Butterflies — appear when plantBased */}
        <AnimatePresence>
          {toggles?.plantBased && [1, 2].map((i) => (
            <motion.g
              key={`butterfly-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 + i * 0.3 }}
            >
              <motion.g
                animate={animated ? { y: [0, -6, 0], x: [0, 4, 8] } : {}}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
              >
                <ellipse cx={80 + i * 130} cy={160 + i * 10} rx={6} ry={4} fill="oklch(0.78 0.2 320)" opacity={0.8} />
                <ellipse cx={92 + i * 130} cy={160 + i * 10} rx={6} ry={4} fill="oklch(0.78 0.2 320)" opacity={0.8} />
              </motion.g>
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Score label */}
        <text x="190" y="228" textAnchor="middle" fontSize="11" fill="white" opacity="0.55" fontFamily="Inter, sans-serif">
          {label} — {score}/100
        </text>
      </svg>

      {/* Tree count badge when publicTransport toggled */}
      <AnimatePresence>
        {toggles?.publicTransport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              background: "color-mix(in oklab, var(--color-leaf-glow) 25%, transparent)",
              border: "1px solid color-mix(in oklab, var(--color-leaf-glow) 40%, transparent)",
              color: "var(--color-leaf-glow)",
            }}
          >
            +{treeCount} 🌳 Trees
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wildlife badge */}
      <AnimatePresence>
        {deerVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{
              background: "color-mix(in oklab, var(--color-sunlight) 25%, transparent)",
              border: "1px solid color-mix(in oklab, var(--color-sunlight) 40%, transparent)",
              color: "var(--color-sunlight)",
            }}
          >
            🦌 Wildlife Restored
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Simulator Page ───────────────────────────────────────────────────────────

const TIMELINES: { months: 0 | 6 | 12 | 36; key: string }[] = [
  { months: 0, key: "timeline_today" },
  { months: 6, key: "timeline_6m" },
  { months: 12, key: "timeline_1y" },
  { months: 36, key: "timeline_3y" },
];

const TOGGLE_ITEMS: {
  key: keyof SimulatorToggles;
  label: string;
  icon: string;
  impactDesc: string;
}[] = [
  { key: "publicTransport", label: "Use public transport", icon: "🚌", impactDesc: "−28% transport CO₂" },
  { key: "reduceAC", label: "Reduce AC usage", icon: "❄️", impactDesc: "Clears pollution haze" },
  { key: "reduceShopping", label: "Less online shopping", icon: "📦", impactDesc: "−8% packaging CO₂" },
  { key: "improveRecycling", label: "Better recycling", icon: "♻️", impactDesc: "River quality ↑" },
  { key: "plantBased", label: "Plant-based meals", icon: "🥗", impactDesc: "Butterflies & fruit 🦋" },
];

function SimulatorPage() {
  const { t } = useTranslation();

  const [currentScore, setCurrentScore] = useState(52);
  const [toggles, setToggles] = useState<SimulatorToggles>({
    publicTransport: false,
    reduceAC: false,
    reduceShopping: false,
    improveRecycling: false,
    plantBased: false,
  });
  const [months, setMonths] = useState<0 | 6 | 12 | 36>(12);
  const [timelineIdx, setTimelineIdx] = useState(2);

  useEffect(() => {
    const cached = getCachedProfile<EarthProfile>();
    if (cached) setCurrentScore(cached.score);
  }, []);

  const result = simulateReductions(currentScore, toggles, months);
  const activeCount = Object.values(toggles).filter(Boolean).length;

  function toggleSwitch(key: keyof SimulatorToggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="relative min-h-screen px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 70% 5%, color-mix(in oklab, var(--color-earth-blue) 12%, transparent), transparent 45%)",
        }}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          {t("nav_simulator")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{t("simulator_title")}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Toggle lifestyle changes and watch your Earth transform in real time
        </p>
      </motion.div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeCount > 0 
          ? `Simulated future score is ${result.futureScore}. Carbon reduced by ${result.carbonReductionPercent}%.`
          : "Simulator active. Toggle changes to see projected impact."}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex flex-col gap-5 rounded-3xl p-6 lg:col-span-2"
          aria-label="Lifestyle change controls"
        >
          <p className="font-display text-base font-bold">Lifestyle Changes</p>

          {TOGGLE_ITEMS.map(({ key, label, icon, impactDesc }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <button
                  role="switch"
                  aria-checked={toggles[key]}
                  aria-label={`Toggle ${label}`}
                  id={`toggle-${key}`}
                  onClick={() => toggleSwitch(key)}
                  className={`relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    toggles[key] ? "bg-secondary" : "bg-white/10"
                  }`}
                >
                  <motion.span
                    animate={{ x: toggles[key] ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  />
                </button>
              </div>
              {/* Impact description badge — appears when toggled on */}
              <AnimatePresence>
                {toggles[key] && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[10px] font-semibold pl-9 overflow-hidden"
                    style={{ color: "var(--color-leaf-glow)" }}
                  >
                    ✅ {impactDesc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Timeline */}
          <div className="mt-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Timeline
            </p>
            <div className="flex rounded-xl overflow-hidden bg-white/5" role="radiogroup" aria-label="Timeline selection">
              {TIMELINES.map(({ months: m, key }, i) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={timelineIdx === i}
                  id={`timeline-${m}`}
                  onClick={() => {
                    setTimelineIdx(i);
                    setMonths(m);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold transition ${
                    timelineIdx === i
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(key as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Impact Summary Badges */}
          <div className="mt-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
              Impact Summary
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {result.carbonReductionPercent > 0 && (
                  <ImpactBadge key="carbon" text={`−${result.carbonReductionPercent}% CO₂`} color="var(--color-leaf-glow)" />
                )}
                {result.treesEquivalent > 0 && (
                  <ImpactBadge key="trees" text={`+${result.treesEquivalent} Trees`} color="var(--color-accent)" />
                )}
                {result.co2SavedKg > 0 && (
                  <ImpactBadge key="co2" text={`${result.co2SavedKg} kg saved`} color="var(--color-sunlight)" />
                )}
                {toggles.improveRecycling && (
                  <ImpactBadge key="water" text="Water quality ↑" color="var(--color-earth-blue)" />
                )}
                {(toggles.publicTransport && toggles.plantBased) && (
                  <ImpactBadge key="wildlife" text="Wildlife restored 🦌" color="oklch(0.75 0.12 60)" />
                )}
              </AnimatePresence>
              {activeCount === 0 && (
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  Enable changes above to see impact
                </p>
              )}
            </div>
          </div>

          {/* Metric counters */}
          <div className="mt-1 grid grid-cols-3 gap-3" aria-live="polite" aria-atomic="true">
            {[
              { label: t("carbon_reduction"), value: result.carbonReductionPercent, suffix: "%", color: "var(--color-leaf-glow)" },
              { label: t("trees_equivalent"), value: result.treesEquivalent, suffix: "", color: "var(--color-accent)" },
              { label: t("co2_saved"), value: result.co2SavedKg, suffix: "kg", color: "var(--color-sunlight)" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-white/5 p-3 text-center"
                aria-label={`${m.label}: ${m.value}${m.suffix}`}
              >
                <AnimatedCounter value={m.value} suffix={m.suffix} color={m.color} />
                <div className="mt-0.5 text-[10px] leading-tight" style={{ color: "var(--color-muted-foreground)" }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Ecosystem Views ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 lg:col-span-3"
        >
          <div className="glass-card rounded-3xl p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
              {t("current_earth")}
            </p>
            <LivingEcosystem score={currentScore} label="Current" animated />
          </div>

          <div className="glass-card rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
                {t("future_earth")} — {t(TIMELINES[timelineIdx].key as Parameters<typeof t>[0])}
              </p>
              {result.futureScore > currentScore && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: "color-mix(in oklab, var(--color-leaf-glow) 20%, transparent)",
                    color: "var(--color-leaf-glow)",
                  }}
                >
                  +{result.futureScore - currentScore} pts
                </span>
              )}
            </div>
            <LivingEcosystem score={result.futureScore} label="Future" animated toggles={toggles} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
