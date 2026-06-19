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

// ─── Living Ecosystem SVG ─────────────────────────────────────────────────────

interface EcosystemProps {
  score: number;
  label: string;
  animated?: boolean;
}

function LivingEcosystem({ score, label, animated }: EcosystemProps) {
  const norm = score / 100; // 0–1, higher = greener

  // Derived visual properties
  const skyBlue = `oklch(${0.25 + norm * 0.25} ${0.04 + norm * 0.08} ${210 + norm * 30})`;
  const groundGreen = `oklch(${0.2 + norm * 0.25} ${0.05 + norm * 0.12} ${140 + norm * 10})`;
  const hazeOpacity = Math.max(0, 0.7 - norm * 0.75);
  const treeCount = Math.round(2 + norm * 8);
  const birdVisible = norm > 0.65;
  const waterBlue = `oklch(${0.3 + norm * 0.2} ${0.06 + norm * 0.12} 235)`;

  const treeXPositions = [30, 60, 100, 150, 200, 240, 270, 300, 320, 340];

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: 240 }}>
      <svg viewBox="0 0 380 240" className="h-full w-full" aria-hidden="true">
        {/* Sky */}
        <defs>
          <linearGradient id={`sky-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyBlue} />
            <stop offset="100%" stopColor={groundGreen} />
          </linearGradient>
          <radialGradient id={`sun-${label}`} cx="80%" cy="15%" r="30%">
            <stop offset="0%" stopColor="oklch(0.9 0.15 90)" stopOpacity={norm * 0.8} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="380" height="240" fill={`url(#sky-${label})`} />

        {/* Sun halo */}
        <ellipse cx="304" cy="36" rx="90" ry="90" fill={`url(#sun-${label})`} />

        {/* Clouds (cleaner when score high) */}
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

        {/* Pollution haze */}
        <rect
          x="0" y="60" width="380" height="100"
          fill="oklch(0.4 0.05 40)"
          opacity={hazeOpacity}
        />

        {/* River */}
        <motion.path
          d="M 0 185 Q 95 175 190 182 Q 285 189 380 180"
          fill="none"
          stroke={waterBlue}
          strokeWidth={norm > 0.4 ? 12 : 6}
          animate={animated ? { d: ["M 0 185 Q 95 175 190 182 Q 285 189 380 180", "M 0 183 Q 95 177 190 184 Q 285 187 380 182"] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          opacity={0.4 + norm * 0.5}
        />

        {/* Ground */}
        <rect x="0" y="188" width="380" height="52" fill={groundGreen} />

        {/* Trees — appear progressively */}
        {treeXPositions.slice(0, treeCount).map((x, i) => {
          const h = 25 + (i % 3) * 15;
          const w = 18 + (i % 4) * 6;
          return (
            <motion.g
              key={i}
              initial={animated ? { scaleY: 0, opacity: 0 } : { scaleY: 1 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
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
            </motion.g>
          );
        })}

        {/* Birds — appear at high score */}
        <AnimatePresence>
          {birdVisible && [1, 2, 3].map((i) => (
            <motion.g
              key={i}
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

        {/* Label */}
        <text x="190" y="228" textAnchor="middle" fontSize="11" fill="white" opacity="0.55" fontFamily="Inter, sans-serif">
          {label} — {score}/100
        </text>
      </svg>
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

  function toggleSwitch(key: keyof SimulatorToggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const TOGGLE_ITEMS: { key: keyof SimulatorToggles; strKey: keyof typeof t extends (k: infer K) => string ? K : never; icon: string }[] = [
    { key: "publicTransport", strKey: "toggle_public_transport" as const, icon: "🚌" },
    { key: "reduceAC", strKey: "toggle_reduce_ac" as const, icon: "❄️" },
    { key: "reduceShopping", strKey: "toggle_reduce_shopping" as const, icon: "📦" },
    { key: "improveRecycling", strKey: "toggle_improve_recycling" as const, icon: "♻️" },
    { key: "plantBased", strKey: "toggle_plant_based" as const, icon: "🥗" },
  ];

  return (
    <div className="relative min-h-screen px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 5%, color-mix(in oklab, var(--color-earth-blue) 12%, transparent), transparent 45%)",
        }}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t("nav_simulator")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{t("simulator_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("simulator_subtitle")}</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex flex-col gap-5 rounded-3xl p-6 lg:col-span-2"
          aria-label="Lifestyle change controls"
        >
          <p className="font-display text-base font-bold">Lifestyle Changes</p>

          {TOGGLE_ITEMS.map(({ key, strKey, icon }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{icon}</span>
                <span className="text-sm font-medium">{t(strKey as Parameters<typeof t>[0])}</span>
              </div>
              <button
                role="switch"
                aria-checked={toggles[key]}
                aria-label={`Toggle ${key}`}
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
          ))}

          {/* Timeline */}
          <div className="mt-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Timeline</p>
            <div className="flex rounded-xl overflow-hidden bg-white/5" role="radiogroup" aria-label="Timeline selection">
              {TIMELINES.map(({ months: m, key }, i) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={timelineIdx === i}
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

          {/* Metrics */}
          <div className="mt-1 grid grid-cols-3 gap-3">
            {[
              { label: t("carbon_reduction"), value: `${result.carbonReductionPercent}%`, color: "var(--color-leaf-glow)" },
              { label: t("trees_equivalent"), value: result.treesEquivalent, color: "var(--color-accent)" },
              { label: t("co2_saved"), value: `${result.co2SavedKg}kg`, color: "var(--color-sunlight)" },
            ].map((m) => (
              <motion.div
                key={m.label}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.4 }}
                className="rounded-xl bg-white/5 p-3 text-center"
                aria-label={`${m.label}: ${m.value}`}
              >
                <div className="font-display text-xl font-bold" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{m.label}</div>
              </motion.div>
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("current_earth")}
            </p>
            <LivingEcosystem score={currentScore} label="Current" animated />
          </div>

          <div className="glass-card rounded-3xl p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {t("future_earth")} — {t(TIMELINES[timelineIdx].key as Parameters<typeof t>[0])}
            </p>
            <LivingEcosystem score={result.futureScore} label="Future" animated />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
