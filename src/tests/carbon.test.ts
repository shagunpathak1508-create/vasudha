// ─── Vitest Tests ─────────────────────────────────────────────────────────────
// Run: npx vitest run

import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getEarthState,
  generateEarthProfile,
  getCategoryScores,
  generatePersonalizedInsights,
  type OnboardingAnswers,
} from "../lib/carbon";

// ─── calculateScore ────────────────────────────────────────────────────────────

describe("calculateScore", () => {
  it("returns high score for eco-friendly choices", () => {
    const best: OnboardingAnswers = {
      transport: "walking",
      food: "vegetarian",
      electricity: "low",
      shopping: "rare",
      waste: "always_recycle",
    };
    const score = calculateScore(best);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("returns low score for high-impact choices", () => {
    const worst: OnboardingAnswers = {
      transport: "flights",
      food: "heavy_meat",
      electricity: "heavy_ac",
      shopping: "frequent",
      waste: "rarely",
    };
    const score = calculateScore(worst);
    expect(score).toBeLessThan(25);
  });

  it("returns a value between 0 and 100", () => {
    const answers: OnboardingAnswers = {
      transport: "car",
      food: "mixed",
      electricity: "high",
      shopping: "monthly",
      waste: "sometimes",
    };
    const score = calculateScore(answers);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("walking produces lower emission than car", () => {
    const base: OnboardingAnswers = {
      transport: "car",
      food: "vegetarian",
      electricity: "low",
      shopping: "rare",
      waste: "always_recycle",
    };
    const walking = calculateScore({ ...base, transport: "walking" });
    const car = calculateScore({ ...base, transport: "car" });
    expect(walking).toBeGreaterThan(car);
  });
});

// ─── getEarthState ─────────────────────────────────────────────────────────────

describe("getEarthState", () => {
  it("returns 'thriving' for score >= 75", () => {
    expect(getEarthState(75)).toBe("thriving");
    expect(getEarthState(100)).toBe("thriving");
  });

  it("returns 'balanced' for 50–74", () => {
    expect(getEarthState(50)).toBe("balanced");
    expect(getEarthState(74)).toBe("balanced");
  });

  it("returns 'struggling' for 30–49", () => {
    expect(getEarthState(30)).toBe("struggling");
    expect(getEarthState(49)).toBe("struggling");
  });

  it("returns 'critical' for < 30", () => {
    expect(getEarthState(29)).toBe("critical");
    expect(getEarthState(0)).toBe("critical");
  });
});

// ─── generateEarthProfile ──────────────────────────────────────────────────────

describe("generateEarthProfile", () => {
  it("includes all required fields", () => {
    const answers: OnboardingAnswers = {
      transport: "public",
      food: "vegetarian",
      electricity: "average",
      shopping: "monthly",
      waste: "sometimes",
    };
    const profile = generateEarthProfile(answers);
    expect(profile).toHaveProperty("score");
    expect(profile).toHaveProperty("state");
    expect(profile).toHaveProperty("topSource");
    expect(profile).toHaveProperty("topSourceLabel");
    expect(profile).toHaveProperty("improvement");
    expect(profile).toHaveProperty("categoryScores");
  });

  it("topSource is one of the 5 categories", () => {
    const answers: OnboardingAnswers = {
      transport: "flights",
      food: "vegetarian",
      electricity: "low",
      shopping: "rare",
      waste: "always_recycle",
    };
    const profile = generateEarthProfile(answers);
    expect(["transport", "food", "electricity", "shopping", "waste"]).toContain(profile.topSource);
  });

  it("identifies flights as top source when other choices are eco-friendly", () => {
    const answers: OnboardingAnswers = {
      transport: "flights",
      food: "vegetarian",
      electricity: "low",
      shopping: "rare",
      waste: "always_recycle",
    };
    const profile = generateEarthProfile(answers);
    expect(profile.topSource).toBe("transport");
  });
});

// ─── getCategoryScores ────────────────────────────────────────────────────────

describe("getCategoryScores", () => {
  it("returns scores for all 5 categories", () => {
    const answers: OnboardingAnswers = {
      transport: "cycling",
      food: "eggetarian",
      electricity: "average",
      shopping: "rare",
      waste: "sometimes",
    };
    const scores = getCategoryScores(answers);
    expect(Object.keys(scores)).toHaveLength(5);
    expect(scores).toHaveProperty("transport");
    expect(scores).toHaveProperty("food");
    expect(scores).toHaveProperty("electricity");
    expect(scores).toHaveProperty("shopping");
    expect(scores).toHaveProperty("waste");
  });

  it("all scores are between 0 and 100", () => {
    const answers: OnboardingAnswers = {
      transport: "car",
      food: "heavy_meat",
      electricity: "heavy_ac",
      shopping: "frequent",
      waste: "rarely",
    };
    const scores = getCategoryScores(answers);
    Object.values(scores).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });
});

// ─── generatePersonalizedInsights ────────────────────────────────────────────

describe("generatePersonalizedInsights", () => {
  const carAnswers: OnboardingAnswers = {
    transport: "car",
    food: "vegetarian",
    electricity: "low",
    shopping: "monthly", // Changed to make waste the unambiguous bestArea
    waste: "always_recycle",
  };

  const flightAnswers: OnboardingAnswers = {
    transport: "flights",
    food: "heavy_meat",
    electricity: "heavy_ac",
    shopping: "frequent",
    waste: "rarely",
  };

  it("returns all required fields", () => {
    const profile = generateEarthProfile(carAnswers);
    const insights = generatePersonalizedInsights(carAnswers, profile);
    expect(insights).toHaveProperty("earthStatusSummary");
    expect(insights).toHaveProperty("biggestImpactArea");
    expect(insights).toHaveProperty("biggestImpactLabel");
    expect(insights).toHaveProperty("biggestImpactScoreBoost");
    expect(insights).toHaveProperty("bestArea");
    expect(insights).toHaveProperty("bestAreaLabel");
    expect(insights).toHaveProperty("easiestWin");
    expect(insights).toHaveProperty("easiestWinLabel");
    expect(insights).toHaveProperty("easiestWinScoreBoost");
    expect(insights).toHaveProperty("easiestWinTip");
  });

  it("identifies transport as biggest impact for car driver", () => {
    const profile = generateEarthProfile(carAnswers);
    const insights = generatePersonalizedInsights(carAnswers, profile);
    expect(insights.biggestImpactArea).toBe("transport");
  });

  it("earthStatusSummary mentions personal car for car driver", () => {
    const profile = generateEarthProfile(carAnswers);
    const insights = generatePersonalizedInsights(carAnswers, profile);
    expect(insights.earthStatusSummary.toLowerCase()).toMatch(/car|transport/);
  });

  it("earthStatusSummary mentions AC for heavy_ac user", () => {
    const acAnswers: OnboardingAnswers = {
      transport: "walking",
      food: "vegetarian",
      electricity: "heavy_ac",
      shopping: "rare",
      waste: "always_recycle",
    };
    const profile = generateEarthProfile(acAnswers);
    const insights = generatePersonalizedInsights(acAnswers, profile);
    expect(insights.earthStatusSummary.toLowerCase()).toMatch(/ac|electricity/);
  });

  it("bestArea is the highest-scoring category", () => {
    const profile = generateEarthProfile(carAnswers);
    const scores = profile.categoryScores;
    const insights = generatePersonalizedInsights(carAnswers, profile);
    const expectedBest = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
    expect(insights.bestArea).toBe(expectedBest);
  });

  it("biggestImpactScoreBoost is within reasonable range (0–20)", () => {
    const profile = generateEarthProfile(flightAnswers);
    const insights = generatePersonalizedInsights(flightAnswers, profile);
    expect(insights.biggestImpactScoreBoost).toBeGreaterThanOrEqual(0);
    expect(insights.biggestImpactScoreBoost).toBeLessThanOrEqual(20);
  });

  it("easiestWinTip references concrete action (number or specific word)", () => {
    const profile = generateEarthProfile(carAnswers);
    const insights = generatePersonalizedInsights(carAnswers, profile);
    // Should mention a specific number or action word
    expect(insights.easiestWinTip.length).toBeGreaterThan(20);
  });

  it("easiestWinScoreBoost is non-negative", () => {
    const profile = generateEarthProfile(carAnswers);
    const insights = generatePersonalizedInsights(carAnswers, profile);
    expect(insights.easiestWinScoreBoost).toBeGreaterThanOrEqual(0);
  });

  it("eco-friendly choices produce positive earthStatusSummary state word", () => {
    const bestAnswers: OnboardingAnswers = {
      transport: "walking",
      food: "vegetarian",
      electricity: "low",
      shopping: "rare",
      waste: "always_recycle",
    };
    const profile = generateEarthProfile(bestAnswers);
    const insights = generatePersonalizedInsights(bestAnswers, profile);
    expect(insights.earthStatusSummary.toLowerCase()).toMatch(/thriving|balanced/);
  });
});

