import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { I18nProvider, useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "What is a Carbon Footprint? — Vasudha" },
      { name: "description", content: "Explore carbon footprint interactively — transportation, energy, food, shopping and waste explained visually in English and Hindi." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <LearnPage />
    </I18nProvider>
  ),
});

// ─── Category data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "transport",
    icon: "🚗",
    color: "oklch(0.55 0.18 30)",
    bgGlow: "oklch(0.55 0.18 30)",
    titleEn: "Transportation",
    titleHi: "परिवहन",
    tagline: "How you move shapes your footprint most.",
    scene: "transport",
    examples: ["Every km driven emits ~130g CO₂", "A flight to Delhi = 200 kg CO₂", "Cycling emits nothing"],
    improvements: ["Switch 2 trips/week to public transport", "Try carpooling for longer commutes"],
    explanation: "When fuel burns in a car or plane engine, it releases CO₂ — the main gas warming our planet. Transport is the single biggest carbon source for most Indian households.",
  },
  {
    id: "energy",
    icon: "⚡",
    color: "oklch(0.75 0.2 80)",
    bgGlow: "oklch(0.75 0.2 80)",
    titleEn: "Home Energy",
    titleHi: "घरेलू ऊर्जा",
    tagline: "Every unit of electricity has a story.",
    scene: "energy",
    examples: ["Running AC for 8h = 6 kg CO₂", "One CFL bulb saves 65W vs incandescent", "Solar panels offset 1–2 tonnes/year"],
    improvements: ["Set AC to 24°C instead of 18°C", "Use 5-star rated appliances"],
    explanation: "Most electricity in India comes from coal-burning power plants. Every unit you save means less coal burned, less CO₂ released, and cleaner air for everyone.",
  },
  {
    id: "food",
    icon: "🍔",
    color: "oklch(0.62 0.2 145)",
    bgGlow: "oklch(0.62 0.2 145)",
    titleEn: "Food",
    titleHi: "भोजन",
    tagline: "What you eat feeds the Earth too.",
    scene: "food",
    examples: ["1 kg beef = 27 kg CO₂", "1 kg lentils = 0.9 kg CO₂", "Food waste creates methane in landfills"],
    improvements: ["3 plant-based meals/week = ~300 kg CO₂ saved/year", "Buy local, seasonal produce"],
    explanation: "Raising animals for meat needs huge amounts of land, water and feed — all emitting greenhouse gases. Plant foods have a fraction of the footprint.",
  },
  {
    id: "shopping",
    icon: "🛍",
    color: "oklch(0.6 0.18 270)",
    bgGlow: "oklch(0.6 0.18 270)",
    titleEn: "Shopping",
    titleHi: "खरीदारी",
    tagline: "Every product has a carbon price tag.",
    scene: "shopping",
    examples: ["1 t-shirt = 5.5 kg CO₂ to produce", "A smartphone ≈ 70 kg CO₂", "Packaging & shipping add 20–30% more"],
    improvements: ["Wait 48h before impulse buys", "Buy second-hand or refurbished tech"],
    explanation: "Making products requires energy, raw materials, and shipping across the world. The more we buy (especially new things), the more emissions we create.",
  },
  {
    id: "waste",
    icon: "🗑",
    color: "oklch(0.5 0.12 180)",
    bgGlow: "oklch(0.5 0.12 180)",
    titleEn: "Waste",
    titleHi: "कचरा",
    tagline: "What we throw away doesn't disappear.",
    scene: "waste",
    examples: ["Food waste in landfills produces methane", "Recycling aluminium saves 95% energy", "Composting returns nutrients to soil"],
    improvements: ["Start a small kitchen compost bin", "Separate dry and wet waste every day"],
    explanation: "When food rots in landfills without oxygen, it releases methane — a gas 80x more powerful than CO₂ over 20 years. Recycling and composting are the antidote.",
  },
];

// ─── Inline SVG Scenes ────────────────────────────────────────────────────────

function TransportScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      {/* Sky */}
      <rect width="320" height="180" fill="url(#tSky)" />
      <defs>
        <linearGradient id="tSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3a2a" />
          <stop offset="100%" stopColor="#0d1f17" />
        </linearGradient>
      </defs>
      {/* Road */}
      <rect x="0" y="130" width="320" height="50" fill="#1c2a20" />
      <rect x="0" y="152" width="320" height="4" fill="#2d4a35" />
      {/* Car */}
      <motion.g
        animate={active ? { x: [0, 30, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="60" y="110" width="60" height="28" rx="6" fill="#2d6a4f" />
        <rect x="68" y="102" width="44" height="20" rx="4" fill="#40916c" />
        <circle cx="76" cy="140" r="9" fill="#1b4332" />
        <circle cx="104" cy="140" r="9" fill="#1b4332" />
        {/* Exhaust */}
        <motion.g
          animate={active ? { opacity: [0.8, 0, 0.8] } : { opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <circle cx="55" cy="132" r="5" fill="#888" opacity="0.4" />
          <circle cx="48" cy="128" r="4" fill="#888" opacity="0.25" />
          <circle cx="40" cy="122" r="5" fill="#888" opacity="0.15" />
        </motion.g>
      </motion.g>
      {/* Trees */}
      <g>
        <rect x="210" y="95" width="8" height="38" fill="#2d4a35" />
        <ellipse cx="214" cy="88" rx="18" ry="22" fill="#40916c" />
        <rect x="240" y="100" width="7" height="32" fill="#2d4a35" />
        <ellipse cx="243" cy="92" rx="15" ry="18" fill="#52b788" />
        <rect x="270" y="90" width="9" height="42" fill="#2d4a35" />
        <ellipse cx="274" cy="82" rx="20" ry="24" fill="#40916c" />
      </g>
      {/* Cyclist */}
      <motion.g
        animate={active ? { x: [0, 80, 0] } : {}}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <circle cx="190" cy="134" r="7" fill="#52b788" />
        <circle cx="174" cy="134" r="7" fill="#52b788" />
        <line x1="174" y1="134" x2="182" y2="120" stroke="#95d5b2" strokeWidth="2" />
        <circle cx="182" cy="116" r="4" fill="#95d5b2" />
      </motion.g>
    </svg>
  );
}

function EnergyScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="eSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a1a" />
          <stop offset="100%" stopColor="#0d1a0d" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#eSky)" />
      {/* House */}
      <polygon points="90,60 160,20 230,60" fill="#2d4a35" />
      <rect x="95" y="60" width="130" height="80" fill="#1b4332" />
      {/* Window glow */}
      <motion.rect
        x="115" y="80" width="35" height="30" rx="3" fill="#d4a017"
        animate={active ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.rect
        x="170" y="80" width="35" height="30" rx="3" fill="#d4a017"
        animate={active ? { opacity: [1, 0.5, 1] } : { opacity: 0.1 }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      {/* Solar panels */}
      <rect x="105" y="30" width="50" height="20" rx="2" fill="#1565c0" opacity="0.8" />
      <rect x="160" y="30" width="50" height="20" rx="2" fill="#1565c0" opacity="0.8" />
      {/* Sun rays */}
      <motion.g
        animate={active ? { rotate: [0, 360] } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "270px 30px" }}
      >
        <circle cx="270" cy="30" r="14" fill="#ffd166" opacity="0.7" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="270"
            y1="30"
            x2={270 + 22 * Math.cos((deg * Math.PI) / 180)}
            y2={30 + 22 * Math.sin((deg * Math.PI) / 180)}
            stroke="#ffd166"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </motion.g>
    </svg>
  );
}

function FoodScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="fBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3320" />
          <stop offset="100%" stopColor="#0d1a10" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#fBg)" />
      {/* Plate */}
      <circle cx="160" cy="120" r="55" fill="#1b4332" />
      <circle cx="160" cy="120" r="48" fill="#2d6a4f" />
      {/* Veggie bowl */}
      <ellipse cx="160" cy="118" rx="32" ry="26" fill="#40916c" />
      <motion.g animate={active ? { y: [0, -3, 0] } : {}} transition={{ duration: 3, repeat: Infinity }}>
        <circle cx="148" cy="112" r="10" fill="#70e000" />
        <circle cx="170" cy="114" r="8" fill="#f4d03f" />
        <circle cx="157" cy="124" r="7" fill="#e74c3c" opacity="0.8" />
      </motion.g>
      {/* Floating leaves */}
      {[0, 1, 2].map((i) => (
        <motion.text
          key={i}
          x={80 + i * 70}
          y={60}
          fontSize="20"
          animate={active ? { y: [60, 40, 60], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
        >
          🌿
        </motion.text>
      ))}
    </svg>
  );
}

function ShoppingScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0d0d1a" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sBg)" />
      {/* Boxes */}
      {[40, 120, 200].map((x, i) => (
        <motion.g
          key={i}
          animate={active ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        >
          <rect x={x} y={90} width={55} height={55} rx="6" fill="#2d2d4a" />
          <rect x={x} y={90} width={55} height={14} rx="4" fill="#3a3a60" />
          <line x1={x + 27} y1={90} x2={x + 27} y2={145} stroke="#4a4a80" strokeWidth="2" />
        </motion.g>
      ))}
      {/* Clouds of emissions */}
      {active && (
        <motion.g animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <circle cx="90" cy="45" r="18" fill="#666" opacity="0.4" />
          <circle cx="108" cy="40" r="14" fill="#666" opacity="0.3" />
          <circle cx="75" cy="40" r="12" fill="#666" opacity="0.3" />
        </motion.g>
      )}
    </svg>
  );
}

function WasteScene({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="wBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a1a" />
          <stop offset="100%" stopColor="#0a160a" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#wBg)" />
      {/* Recycle bin */}
      <rect x="120" y="80" width="80" height="70" rx="8" fill="#1b4332" />
      <text x="160" y="122" textAnchor="middle" fontSize="28" fill="#52b788">♻</text>
      {/* Compost pile */}
      <motion.g animate={active ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 3, repeat: Infinity }}>
        <ellipse cx="240" cy="148" rx="40" ry="18" fill="#3a5a2a" />
        <ellipse cx="240" cy="140" rx="30" ry="14" fill="#52773a" />
      </motion.g>
      {/* Floating recycle symbols */}
      {active && [60, 100, 145].map((y, i) => (
        <motion.text
          key={i}
          x={i % 2 === 0 ? 50 : 260}
          y={y}
          fontSize="16"
          animate={{ x: [i % 2 === 0 ? 50 : 260, 160, i % 2 === 0 ? 50 : 260], opacity: [0, 0.8, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 1.2 }}
        >
          🌱
        </motion.text>
      ))}
    </svg>
  );
}

const SCENES: Record<string, React.FC<{ active: boolean }>> = {
  transport: TransportScene,
  energy: EnergyScene,
  food: FoodScene,
  shopping: ShoppingScene,
  waste: WasteScene,
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

function LearnPage() {
  const { t, lang } = useTranslation();
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number] | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Focus management for detail panel modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selected) return;
      if (e.key === "Escape") {
        setSelected(null);
        triggerRefs.current[selected.id]?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  useEffect(() => {
    if (selected) {
      // Focus the close button when panel opens
      closeBtnRef.current?.focus();
    }
  }, [selected]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 40% 15%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {lang === "hi" ? "खोजें" : "Explore"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            {t("learn_title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("learn_subtitle")}</p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5" role="list">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(cat)}
              ref={(el) => {
                triggerRefs.current[cat.id] = el;
              }}
              role="listitem"
              aria-label={`Explore ${cat.titleEn}`}
              className="glass-card group relative flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 40%, color-mix(in oklab, ${cat.bgGlow} 22%, transparent), transparent 65%)`,
                }}
                aria-hidden="true"
              />
              <span className="relative text-5xl">{cat.icon}</span>
              <span className="relative font-display text-sm font-bold">
                {lang === "hi" ? cat.titleHi : cat.titleEn}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card mt-10 overflow-hidden rounded-3xl"
              aria-label={`Details for ${selected.titleEn}`}
            >
              <div className="grid md:grid-cols-2">
                {/* Scene */}
                <div
                  className="relative flex h-52 items-center justify-center overflow-hidden md:h-72"
                  style={{
                    background: `radial-gradient(circle at 50% 60%, color-mix(in oklab, ${selected.bgGlow} 25%, transparent), transparent 70%)`,
                  }}
                >
                  {(() => {
                    const SceneComp = SCENES[selected.scene];
                    return <SceneComp active={true} />;
                  })()}
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold">
                      {lang === "hi" ? selected.titleHi : selected.titleEn}
                    </h2>
                    <button
                      ref={closeBtnRef}
                      onClick={() => {
                        setSelected(null);
                        triggerRefs.current[selected!.id]?.focus();
                      }}
                      className="rounded-full p-1 text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close panel"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    {selected.tagline}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/80 mb-5">
                    {selected.explanation}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
                      {t("learn_impact")}
                    </p>
                    <ul className="space-y-1.5" role="list">
                      {selected.examples.map((ex) => (
                        <li key={ex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-0.5 text-accent">•</span>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
                      {t("learn_improve")}
                    </p>
                    <ul className="space-y-1.5" role="list">
                      {selected.improvements.map((imp) => (
                        <li key={imp} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-leaf-glow">✓</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
