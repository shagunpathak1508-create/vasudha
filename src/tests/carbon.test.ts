// ─── Vitest Tests ─────────────────────────────────────────────────────────────
// Run: npx vitest run

import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getEarthState,
  generateEarthProfile,
  getCategoryScores,
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
