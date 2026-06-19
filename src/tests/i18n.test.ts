import { describe, it, expect } from "vitest";
import { strings } from "../lib/i18n";
import type { Lang } from "../lib/i18n";

describe("i18n strings", () => {
  it("English and Hindi have the same keys", () => {
    const enKeys = Object.keys(strings.en).sort();
    const hiKeys = Object.keys(strings.hi).sort();
    expect(enKeys).toEqual(hiKeys);
  });

  it("all English strings are non-empty", () => {
    Object.entries(strings.en).forEach(([key, val]) => {
      expect(val.length, `Key "${key}" should not be empty`).toBeGreaterThan(0);
    });
  });

  it("all Hindi strings are non-empty", () => {
    Object.entries(strings.hi).forEach(([key, val]) => {
      expect(val.length, `Key "${key}" should not be empty`).toBeGreaterThan(0);
    });
  });

  it("English and Hindi strings for same key are different", () => {
    // At least 80% of keys should have different translations
    const keys = Object.keys(strings.en) as Array<keyof typeof strings.en>;
    const different = keys.filter((k) => strings.en[k] !== strings.hi[k]);
    expect(different.length / keys.length).toBeGreaterThan(0.8);
  });

  it("navigation keys exist in both languages", () => {
    const navKeys = ["nav_dashboard", "nav_coach", "nav_challenges", "nav_history", "nav_learn"] as const;
    navKeys.forEach((key) => {
      expect(strings.en[key]).toBeDefined();
      expect(strings.hi[key]).toBeDefined();
    });
  });

  it("onboarding keys present", () => {
    const onboardingKeys = ["onboarding_q1", "onboarding_q2", "onboarding_q3", "onboarding_q4", "onboarding_q5"] as const;
    onboardingKeys.forEach((key) => {
      expect(strings.en[key]).toBeTruthy();
      expect(strings.hi[key]).toBeTruthy();
    });
  });
});
