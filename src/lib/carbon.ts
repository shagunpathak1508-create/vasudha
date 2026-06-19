// ─── Carbon Calculator ───────────────────────────────────────────────────────
// Pure functions only — no side effects, easily testable with Vitest.

export type TransportChoice =
  | "walking"
  | "cycling"
  | "public"
  | "two_wheeler"
  | "car"
  | "flights";

export type FoodChoice = "vegetarian" | "eggetarian" | "mixed" | "heavy_meat";
export type ElectricityChoice = "low" | "average" | "high" | "heavy_ac";
export type ShoppingChoice = "rare" | "monthly" | "frequent";
export type WasteChoice = "always_recycle" | "sometimes" | "rarely";

export interface OnboardingAnswers {
  transport: TransportChoice;
  food: FoodChoice;
  electricity: ElectricityChoice;
  shopping: ShoppingChoice;
  waste: WasteChoice;
}

export type EarthState = "thriving" | "balanced" | "struggling" | "critical";

export interface EarthProfile {
  score: number; // 0–100 (100 = best)
  state: EarthState;
  topSource: string;
  topSourceLabel: string;
  improvement: string;
  categoryScores: Record<string, number>; // 0–100 per category
}

export interface SimulatorToggles {
  publicTransport: boolean;
  reduceAC: boolean;
  reduceShopping: boolean;
  improveRecycling: boolean;
  plantBased: boolean;
}

export interface SimulationResult {
  futureScore: number;
  carbonReductionPercent: number;
  treesEquivalent: number;
  co2SavedKg: number;
}

// ─── Emission weights (higher = worse) ──────────────────────────────────────

const TRANSPORT_WEIGHTS: Record<TransportChoice, number> = {
  walking: 0,
  cycling: 2,
  public: 15,
  two_wheeler: 40,
  car: 80,
  flights: 100,
};

const FOOD_WEIGHTS: Record<FoodChoice, number> = {
  vegetarian: 10,
  eggetarian: 22,
  mixed: 50,
  heavy_meat: 80,
};

const ELECTRICITY_WEIGHTS: Record<ElectricityChoice, number> = {
  low: 10,
  average: 35,
  high: 60,
  heavy_ac: 85,
};

const SHOPPING_WEIGHTS: Record<ShoppingChoice, number> = {
  rare: 5,
  monthly: 35,
  frequent: 70,
};

const WASTE_WEIGHTS: Record<WasteChoice, number> = {
  always_recycle: 5,
  sometimes: 35,
  rarely: 70,
};

// Category contribution to overall score (must sum to 1.0)
const CATEGORY_WEIGHTS = {
  transport: 0.35,
  food: 0.25,
  electricity: 0.20,
  shopping: 0.12,
  waste: 0.08,
};

/** Convert a raw emission weight (0–100) to a health score (0–100) */
function toScore(weight: number): number {
  return Math.round(100 - weight);
}

/** Calculate per-category health scores (0–100) */
export function getCategoryScores(
  answers: OnboardingAnswers,
): Record<string, number> {
  return {
    transport: toScore(TRANSPORT_WEIGHTS[answers.transport]),
    food: toScore(FOOD_WEIGHTS[answers.food]),
    electricity: toScore(ELECTRICITY_WEIGHTS[answers.electricity]),
    shopping: toScore(SHOPPING_WEIGHTS[answers.shopping]),
    waste: toScore(WASTE_WEIGHTS[answers.waste]),
  };
}

/** Calculate the overall Vasudha Health Index (0–100) */
export function calculateScore(answers: OnboardingAnswers): number {
  const t = TRANSPORT_WEIGHTS[answers.transport] * CATEGORY_WEIGHTS.transport;
  const f = FOOD_WEIGHTS[answers.food] * CATEGORY_WEIGHTS.food;
  const e =
    ELECTRICITY_WEIGHTS[answers.electricity] * CATEGORY_WEIGHTS.electricity;
  const s = SHOPPING_WEIGHTS[answers.shopping] * CATEGORY_WEIGHTS.shopping;
  const w = WASTE_WEIGHTS[answers.waste] * CATEGORY_WEIGHTS.waste;

  const totalEmission = t + f + e + s + w;
  return Math.round(Math.max(0, Math.min(100, 100 - totalEmission)));
}

/** Determine Earth state from health score */
export function getEarthState(score: number): EarthState {
  if (score >= 75) return "thriving";
  if (score >= 50) return "balanced";
  if (score >= 30) return "struggling";
  return "critical";
}

/** Identify the highest-impact emission source */
function getTopSource(answers: OnboardingAnswers): {
  key: string;
  label: string;
  weight: number;
} {
  const sources = [
    {
      key: "transport",
      label: "Transportation",
      weight: TRANSPORT_WEIGHTS[answers.transport] * CATEGORY_WEIGHTS.transport,
    },
    {
      key: "food",
      label: "Food Habits",
      weight: FOOD_WEIGHTS[answers.food] * CATEGORY_WEIGHTS.food,
    },
    {
      key: "electricity",
      label: "Electricity Usage",
      weight:
        ELECTRICITY_WEIGHTS[answers.electricity] * CATEGORY_WEIGHTS.electricity,
    },
    {
      key: "shopping",
      label: "Shopping",
      weight: SHOPPING_WEIGHTS[answers.shopping] * CATEGORY_WEIGHTS.shopping,
    },
    {
      key: "waste",
      label: "Waste & Recycling",
      weight: WASTE_WEIGHTS[answers.waste] * CATEGORY_WEIGHTS.waste,
    },
  ];

  return sources.reduce((a, b) => (a.weight > b.weight ? a : b));
}

const IMPROVEMENT_TIPS: Record<string, string> = {
  transport:
    "Replace 2 weekly car trips with public transport to cut transport emissions by up to 30%.",
  food: "Add 3 plant-based meals per week — you could save 300 kg CO₂ annually.",
  electricity:
    "Set AC to 24°C and use ceiling fans — reduces energy use by up to 20%.",
  shopping:
    "Wait 48 hours before non-essential purchases. This alone can halve impulse buys.",
  waste:
    "Start composting food scraps — diverts up to 50% of household waste from landfill.",
};

/** Generate Earth profile with top source and improvement suggestion */
export function generateEarthProfile(
  answers: OnboardingAnswers,
): EarthProfile {
  const score = calculateScore(answers);
  const state = getEarthState(score);
  const top = getTopSource(answers);
  const categoryScores = getCategoryScores(answers);

  return {
    score,
    state,
    topSource: top.key,
    topSourceLabel: top.label,
    improvement: IMPROVEMENT_TIPS[top.key],
    categoryScores,
  };
}

// ─── Future Earth Simulator ──────────────────────────────────────────────────

/** Reduction factors per toggle (as emission weight reduction 0–1) */
const TOGGLE_REDUCTIONS: Record<keyof SimulatorToggles, number> = {
  publicTransport: 0.28, // 28% emission reduction
  reduceAC: 0.15,
  reduceShopping: 0.08,
  improveRecycling: 0.05,
  plantBased: 0.18,
};

const TIMELINE_MULTIPLIERS: Record<string, number> = {
  "0": 0,
  "6": 0.5,
  "12": 1.0,
  "36": 2.2,
};

/** Simulate future score based on lifestyle changes and timeline */
export function simulateReductions(
  currentScore: number,
  toggles: SimulatorToggles,
  months: 0 | 6 | 12 | 36,
): SimulationResult {
  const timeMultiplier = TIMELINE_MULTIPLIERS[String(months)] ?? 1;

  // Total emission reduction fraction
  const totalReduction = Object.entries(toggles).reduce((acc, [key, on]) => {
    if (!on) return acc;
    return acc + (TOGGLE_REDUCTIONS[key as keyof SimulatorToggles] ?? 0);
  }, 0);

  // Current emissions (inverse of score)
  const currentEmission = 100 - currentScore;

  // Reduced emissions
  const reducedEmission = Math.max(
    0,
    currentEmission * (1 - totalReduction * Math.min(timeMultiplier, 1.5)),
  );

  const futureScore = Math.min(100, Math.round(100 - reducedEmission));
  const carbonReductionPercent = Math.round(
    ((currentEmission - reducedEmission) / Math.max(currentEmission, 1)) * 100,
  );

  // Approx CO2 saved: average Indian emits ~1.9 tonnes/year → normalised
  const co2SavedKg = Math.round(
    (currentEmission - reducedEmission) * 19 * (months / 12 || 0.1),
  );
  const treesEquivalent = Math.round(co2SavedKg / 21); // 1 tree ≈ 21 kg CO2/year

  return {
    futureScore,
    carbonReductionPercent,
    treesEquivalent,
    co2SavedKg,
  };
}
