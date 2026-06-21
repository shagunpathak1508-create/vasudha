// ─── Carbon Calculator ───────────────────────────────────────────────────────
// Pure functions only — no side effects, easily testable with Vitest.

// ─── Domain Types ────────────────────────────────────────────────────────────

/** Primary mode of transport chosen by the user during onboarding. */
export type TransportChoice =
  | "walking"
  | "cycling"
  | "public"
  | "two_wheeler"
  | "car"
  | "flights";

/** Primary dietary pattern chosen by the user during onboarding. */
export type FoodChoice = "vegetarian" | "eggetarian" | "mixed" | "heavy_meat";

/** Typical monthly household electricity consumption level. */
export type ElectricityChoice = "low" | "average" | "high" | "heavy_ac";

/** Frequency of non-essential consumer purchases. */
export type ShoppingChoice = "rare" | "monthly" | "frequent";

/** Household waste sorting and recycling practice. */
export type WasteChoice = "always_recycle" | "sometimes" | "rarely";

/**
 * The complete set of answers collected during the onboarding flow.
 * Each field maps to one of the five lifestyle category types.
 */
export interface OnboardingAnswers {
  transport: TransportChoice;
  food: FoodChoice;
  electricity: ElectricityChoice;
  shopping: ShoppingChoice;
  waste: WasteChoice;
}

/**
 * Qualitative Earth health state derived from the Vasudha Health Index score.
 * - `thriving`  — score ≥ 75
 * - `balanced`  — score ≥ 50
 * - `struggling` — score ≥ 30
 * - `critical`  — score < 30
 */
export type EarthState = "thriving" | "balanced" | "struggling" | "critical";

/**
 * Full Earth health profile for a user, computed from their onboarding answers.
 * Used throughout the dashboard, simulator, and insight panels.
 */
export interface EarthProfile {
  /** Vasudha Health Index — 0 (worst) to 100 (best). */
  score: number;
  /** Qualitative health state label. */
  state: EarthState;
  /** Key of the highest-impact emission category (e.g. "transport"). */
  topSource: string;
  /** Human-readable label for the top emission source. */
  topSourceLabel: string;
  /** Actionable improvement suggestion for the top source. */
  improvement: string;
  /** Per-category health scores (0–100). Keys: transport, food, electricity, shopping, waste. */
  categoryScores: Record<string, number>;
}

/** Simulator toggle state — one boolean per lifestyle-change action. */
export interface SimulatorToggles {
  publicTransport: boolean;
  reduceAC: boolean;
  reduceShopping: boolean;
  improveRecycling: boolean;
  plantBased: boolean;
}

/** Result of running the Future Earth Simulator for a given toggle/timeline combination. */
export interface SimulationResult {
  /** Projected Vasudha Health Index after applying the chosen changes. */
  futureScore: number;
  /** Estimated percentage reduction in total carbon emissions. */
  carbonReductionPercent: number;
  /** Number of trees whose annual absorption equals the CO₂ saved. */
  treesEquivalent: number;
  /** Approximate kilograms of CO₂ saved over the chosen timeline. */
  co2SavedKg: number;
}

// ─── Named Constants ─────────────────────────────────────────────────────────

/**
 * Average annual CO₂ emissions (in kg) for an Indian resident.
 * Source: World Bank / IEA — ~1.9 tonnes/year normalised to 100-point scale.
 */
export const AVERAGE_INDIAN_CO2_KG_YEAR = 1900;

/**
 * Approximate kg of CO₂ absorbed per tree per year.
 * Used to calculate "trees equivalent" metrics.
 */
export const TREE_CO2_KG_YEAR = 21;

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

/** Category contribution to overall score (must sum to 1.0). */
const CATEGORY_WEIGHTS = {
  transport: 0.35,
  food: 0.25,
  electricity: 0.20,
  shopping: 0.12,
  waste: 0.08,
};

/**
 * Convert a raw emission weight (0–100) to a health score (0–100).
 * Higher weight = higher emissions = lower score.
 */
function toScore(weight: number): number {
  return Math.round(100 - weight);
}

/**
 * Calculate per-category health scores (0–100) from onboarding answers.
 * Each score is 100 minus the emission weight for that category.
 *
 * @param answers - The user's completed onboarding answers
 * @returns A record mapping category keys to their 0–100 health scores
 *
 * @example
 * getCategoryScores({ transport: "cycling", food: "vegetarian", ... })
 * // → { transport: 98, food: 90, electricity: 65, shopping: 65, waste: 65 }
 */
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

/**
 * Calculate the overall Vasudha Health Index (0–100) from onboarding answers.
 * Uses a weighted average of all five category emission weights.
 *
 * @param answers - The user's completed onboarding answers
 * @returns Integer score from 0 (highest emissions) to 100 (lowest emissions)
 */
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

/**
 * Determine the qualitative Earth health state from a numeric score.
 *
 * @param score - Vasudha Health Index (0–100)
 * @returns One of: "thriving" | "balanced" | "struggling" | "critical"
 */
export function getEarthState(score: number): EarthState {
  if (score >= 75) return "thriving";
  if (score >= 50) return "balanced";
  if (score >= 30) return "struggling";
  return "critical";
}

/** Identify the highest-impact emission source from the user's answers. */
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

/**
 * Generate a full Earth profile including score, state, top emission source,
 * and improvement tip from the user's onboarding answers.
 *
 * @param answers - The user's completed onboarding answers
 * @returns A fully populated {@link EarthProfile} object
 */
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

// ─── Personalized Insights ───────────────────────────────────────────────────

/**
 * A rich set of personalized sustainability insights derived from the user's
 * Earth profile and onboarding answers. Displayed on the dashboard result screen.
 */
export interface PersonalizedInsights {
  /** Summary sentence describing the user's Earth state and top impact driver. */
  earthStatusSummary: string;
  /** Category key of the area with the largest potential improvement. */
  biggestImpactArea: string;
  /** Human-readable label for the biggest impact area. */
  biggestImpactLabel: string;
  /** Estimated VHI point gain if the biggest impact area is fully addressed. */
  biggestImpactScoreBoost: number;
  /** Category key of the area where the user already performs best. */
  bestArea: string;
  /** Human-readable label for the best area. */
  bestAreaLabel: string;
  /** Category key representing the easiest quick win. */
  easiestWin: string;
  /** Human-readable label for the easiest win. */
  easiestWinLabel: string;
  /** Estimated VHI point gain from the easiest win action. */
  easiestWinScoreBoost: number;
  /** Specific, actionable tip for the easiest win. */
  easiestWinTip: string;
}

// Human-readable choice labels for insight sentences
const TRANSPORT_LABELS: Record<TransportChoice, string> = {
  walking: "walking",
  cycling: "cycling",
  public: "public transport",
  two_wheeler: "a two-wheeler",
  car: "a personal car",
  flights: "frequent flights",
};

const FOOD_LABELS: Record<FoodChoice, string> = {
  vegetarian: "a vegetarian diet",
  eggetarian: "an eggetarian diet",
  mixed: "a mixed diet",
  heavy_meat: "a meat-heavy diet",
};

const ELECTRICITY_LABELS: Record<ElectricityChoice, string> = {
  low: "low electricity use",
  average: "average electricity use",
  high: "high electricity use",
  heavy_ac: "heavy AC usage",
};

const SHOPPING_LABELS: Record<ShoppingChoice, string> = {
  rare: "minimal shopping",
  monthly: "monthly shopping",
  frequent: "frequent shopping",
};

const WASTE_LABELS: Record<WasteChoice, string> = {
  always_recycle: "consistent recycling",
  sometimes: "occasional recycling",
  rarely: "infrequent recycling",
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transportation",
  food: "Food Habits",
  electricity: "Electricity Usage",
  shopping: "Shopping",
  waste: "Waste & Recycling",
};

// Specific actionable tips referencing the user's actual choice
function buildEasiestWinTip(
  key: string,
  answers: OnboardingAnswers,
): { tip: string; boost: number } {
  switch (key) {
    case "transport":
      if (answers.transport === "car")
        return { tip: "Replacing 2 weekly car trips with public transport could improve your score by 7 points.", boost: 7 };
      if (answers.transport === "flights")
        return { tip: "Replacing one domestic flight with train travel could improve your score by 9 points.", boost: 9 };
      if (answers.transport === "two_wheeler")
        return { tip: "Switching to public transport for your daily commute could improve your score by 5 points.", boost: 5 };
      return { tip: "Your transport choices are already eco-friendly — keep it up!", boost: 0 };
    case "food":
      if (answers.food === "heavy_meat")
        return { tip: "Replacing 3 meat meals per week with plant-based options could improve your score by 8 points.", boost: 8 };
      if (answers.food === "mixed")
        return { tip: "Adding 2 more vegetarian days per week could improve your score by 4 points.", boost: 4 };
      return { tip: "Your food habits are doing well — consider reducing food packaging waste.", boost: 2 };
    case "electricity":
      if (answers.electricity === "heavy_ac")
        return { tip: "Raising your AC temperature by 2°C could improve your Vasudha Health Index by 5 points.", boost: 5 };
      if (answers.electricity === "high")
        return { tip: "Using ceiling fans instead of AC for 3 hours daily could improve your score by 3 points.", boost: 3 };
      return { tip: "Setting appliances to eco mode could improve your score by 2 points.", boost: 2 };
    case "shopping":
      if (answers.shopping === "frequent")
        return { tip: "Reducing online orders by 50% and choosing local stores could improve your score by 3 points.", boost: 3 };
      return { tip: "A 48-hour wait rule before purchases can halve impulse buys — saving 2 points.", boost: 2 };
    case "waste":
      if (answers.waste === "rarely")
        return { tip: "Starting a simple dry/wet waste separation habit could improve your score by 3 points.", boost: 3 };
      return { tip: "Adding composting to your routine could improve your score by 2 points.", boost: 2 };
    default:
      return { tip: "Small consistent changes add up quickly.", boost: 2 };
  }
}

function buildEarthStatusSummary(
  answers: OnboardingAnswers,
  profile: EarthProfile,
): string {
  const stateWord =
    profile.state === "thriving" ? "thriving" :
    profile.state === "balanced" ? "balanced" :
    profile.state === "struggling" ? "under strain" : "in critical condition";

  const transportLabel = TRANSPORT_LABELS[answers.transport];
  const foodLabel = FOOD_LABELS[answers.food];
  const electricityLabel = ELECTRICITY_LABELS[answers.electricity];

  if (profile.topSource === "transport") {
    if (answers.transport === "car" || answers.transport === "flights") {
      return `Your Earth is ${stateWord} — relying on ${transportLabel} is your biggest source of emissions. Greener commutes would unlock significant healing.`;
    }
    return `Your Earth is ${stateWord}. Transportation is your top impact area — even small shifts help.`;
  }
  if (profile.topSource === "food") {
    if (answers.food === "heavy_meat") {
      return `Your Earth is ${stateWord} — ${foodLabel} puts significant pressure on land and water. Fewer meat days could transform your profile.`;
    }
    return `Your Earth is ${stateWord}. Food choices are leading your environmental impact — plant-forward meals make a big difference.`;
  }
  if (profile.topSource === "electricity") {
    if (answers.electricity === "heavy_ac") {
      return `Your Earth is ${stateWord} — ${electricityLabel} is your biggest drain. Raising the thermostat 2°C could make a measurable difference.`;
    }
    return `Your Earth is ${stateWord}. ${electricityLabel} is your largest impact area — energy-saving habits would help it recover.`;
  }
  if (profile.topSource === "shopping") {
    return `Your Earth is ${stateWord}. Frequent purchasing creates hidden emissions in production and shipping. Mindful shopping is a powerful lever.`;
  }
  // waste
  return `Your Earth is ${stateWord}. Improving waste sorting and recycling is the quickest way to strengthen your Vasudha Health Index.`;
}

/**
 * Generate answer-specific personalized insights for the dashboard and result screen.
 * Identifies the user's biggest impact area, best performing area, and easiest quick win.
 *
 * @param answers - The user's completed onboarding answers
 * @param profile - The pre-computed {@link EarthProfile} for this user
 * @returns A {@link PersonalizedInsights} object with tailored summaries and tips
 */
export function generatePersonalizedInsights(
  answers: OnboardingAnswers,
  profile: EarthProfile,
): PersonalizedInsights {
  const categoryScores = profile.categoryScores;

  // Sorted: worst → best
  const sorted = Object.entries(categoryScores).sort(([, a], [, b]) => a - b);
  const [worstKey] = sorted[0];
  const [bestKey] = sorted[sorted.length - 1];

  // Easiest win: highest score boost relative to effort
  const worstBoost = buildEasiestWinTip(worstKey, answers).boost;
  const midKey = sorted.length > 2 ? sorted[1][0] : worstKey;
  const midBoost = buildEasiestWinTip(midKey, answers).boost;
  const easiestKey = midBoost >= 3 && categoryScores[midKey] > categoryScores[worstKey] + 10 ? midKey : worstKey;
  const easiestResult = buildEasiestWinTip(easiestKey, answers);

  const biggestBoost = Math.round((100 - categoryScores[worstKey]) * CATEGORY_WEIGHTS[worstKey as keyof typeof CATEGORY_WEIGHTS] * 0.8);

  return {
    earthStatusSummary: buildEarthStatusSummary(answers, profile),
    biggestImpactArea: worstKey,
    biggestImpactLabel: CATEGORY_LABELS[worstKey],
    biggestImpactScoreBoost: Math.min(biggestBoost, 20),
    bestArea: bestKey,
    bestAreaLabel: CATEGORY_LABELS[bestKey],
    easiestWin: easiestKey,
    easiestWinLabel: CATEGORY_LABELS[easiestKey],
    easiestWinScoreBoost: easiestResult.boost,
    easiestWinTip: easiestResult.tip,
  };
}

// ─── Future Earth Simulator ──────────────────────────────────────────────────

/** Reduction factors per toggle (as emission weight reduction 0–1). */
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

/**
 * Simulate a user's projected future Earth score based on lifestyle changes and a time horizon.
 * Uses proportional emission reduction logic with a timeline multiplier.
 *
 * @param currentScore - The user's current Vasudha Health Index (0–100)
 * @param toggles - Which lifestyle changes are active
 * @param months - Time horizon: 0 (today), 6 (6 months), 12 (1 year), or 36 (3 years)
 * @returns A {@link SimulationResult} with future score, CO₂ savings, and tree equivalents
 *
 * @example
 * simulateReductions(52, { publicTransport: true, plantBased: true, ... }, 12)
 * // → { futureScore: 72, carbonReductionPercent: 41, treesEquivalent: 18, co2SavedKg: 380 }
 */
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

  // CO₂ saved: normalised against AVERAGE_INDIAN_CO2_KG_YEAR
  const co2SavedKg = Math.round(
    (currentEmission - reducedEmission) * 19 * (months / 12 || 0.1),
  );
  const treesEquivalent = Math.round(co2SavedKg / TREE_CO2_KG_YEAR);

  return {
    futureScore,
    carbonReductionPercent,
    treesEquivalent,
    co2SavedKg,
  };
}
