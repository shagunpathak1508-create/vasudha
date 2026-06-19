import { describe, it, expect } from "vitest";
import { simulateReductions, type SimulatorToggles } from "../lib/carbon";

const BASE_SCORE = 52;

const NO_TOGGLES: SimulatorToggles = {
  publicTransport: false,
  reduceAC: false,
  reduceShopping: false,
  improveRecycling: false,
  plantBased: false,
};

const ALL_TOGGLES: SimulatorToggles = {
  publicTransport: true,
  reduceAC: true,
  reduceShopping: true,
  improveRecycling: true,
  plantBased: true,
};

describe("simulateReductions", () => {
  it("returns current score when no toggles and 0 months", () => {
    const result = simulateReductions(BASE_SCORE, NO_TOGGLES, 0);
    expect(result.futureScore).toBe(BASE_SCORE);
    expect(result.carbonReductionPercent).toBe(0);
  });

  it("improves score when all toggles enabled", () => {
    const result = simulateReductions(BASE_SCORE, ALL_TOGGLES, 12);
    expect(result.futureScore).toBeGreaterThan(BASE_SCORE);
  });

  it("greater improvement over longer timeline", () => {
    const r6 = simulateReductions(BASE_SCORE, ALL_TOGGLES, 6);
    const r36 = simulateReductions(BASE_SCORE, ALL_TOGGLES, 36);
    expect(r36.futureScore).toBeGreaterThanOrEqual(r6.futureScore);
  });

  it("future score never exceeds 100", () => {
    const result = simulateReductions(95, ALL_TOGGLES, 36);
    expect(result.futureScore).toBeLessThanOrEqual(100);
  });

  it("future score never goes below 0", () => {
    const result = simulateReductions(5, ALL_TOGGLES, 36);
    expect(result.futureScore).toBeGreaterThanOrEqual(0);
  });

  it("carbon reduction percent is non-negative", () => {
    const result = simulateReductions(BASE_SCORE, ALL_TOGGLES, 12);
    expect(result.carbonReductionPercent).toBeGreaterThanOrEqual(0);
  });

  it("trees equivalent is non-negative", () => {
    const result = simulateReductions(BASE_SCORE, ALL_TOGGLES, 12);
    expect(result.treesEquivalent).toBeGreaterThanOrEqual(0);
  });

  it("single toggle shows partial improvement", () => {
    const withOne = simulateReductions(BASE_SCORE, { ...NO_TOGGLES, publicTransport: true }, 12);
    const withNone = simulateReductions(BASE_SCORE, NO_TOGGLES, 12);
    expect(withOne.futureScore).toBeGreaterThanOrEqual(withNone.futureScore);
  });

  it("returns correct timeline multiplier for 6 months vs 12 months", () => {
    const r6 = simulateReductions(40, { ...NO_TOGGLES, publicTransport: true }, 6);
    const r12 = simulateReductions(40, { ...NO_TOGGLES, publicTransport: true }, 12);
    expect(r12.futureScore).toBeGreaterThanOrEqual(r6.futureScore);
  });
});
