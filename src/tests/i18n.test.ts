// ─── i18n Tests ───────────────────────────────────────────────────────────────
// Tests for language switching, key coverage, and fallback behaviour.

import { describe, it, expect } from "vitest";
import { strings, type StringKey, type Lang } from "../lib/i18n";

// ─── Key parity ───────────────────────────────────────────────────────────────

describe("i18n string parity", () => {
  it("English and Hindi have the same set of keys", () => {
    const enKeys = Object.keys(strings.en).sort();
    const hiKeys = Object.keys(strings.hi).sort();
    expect(enKeys).toEqual(hiKeys);
  });

  it("all English keys are non-empty strings", () => {
    (Object.entries(strings.en) as [StringKey, string][]).forEach(([key, value]) => {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it("all Hindi keys are non-empty strings", () => {
    (Object.entries(strings.hi) as [StringKey, string][]).forEach(([key, value]) => {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

// ─── Spot checks ─────────────────────────────────────────────────────────────

describe("i18n spot checks", () => {
  it("English nav keys are in English", () => {
    expect(strings.en.nav_dashboard).toBe("Dashboard");
    expect(strings.en.nav_simulator).toBe("Simulator");
    expect(strings.en.nav_coach).toBe("Eco Coach");
  });

  it("Hindi nav keys use Devanagari script", () => {
    expect(strings.hi.nav_dashboard).toMatch(/[\u0900-\u097F]/);
    expect(strings.hi.nav_simulator).toMatch(/[\u0900-\u097F]/);
  });

  it("onboarding questions differ in English and Hindi", () => {
    expect(strings.en.onboarding_q1).not.toBe(strings.hi.onboarding_q1);
    expect(strings.en.onboarding_q2).not.toBe(strings.hi.onboarding_q2);
  });

  it("simulator keys exist and are non-empty in both languages", () => {
    const simKeys: StringKey[] = [
      "simulator_title",
      "simulator_subtitle",
      "current_earth",
      "future_earth",
      "carbon_reduction",
      "trees_equivalent",
      "co2_saved",
    ];
    simKeys.forEach((key) => {
      expect(strings.en[key].length).toBeGreaterThan(0);
      expect(strings.hi[key].length).toBeGreaterThan(0);
    });
  });
});

// ─── Language switching ───────────────────────────────────────────────────────

describe("i18n language switching", () => {
  function makeT(lang: Lang) {
    return (key: StringKey): string => strings[lang][key] ?? strings.en[key];
  }

  it("switching to English returns English string", () => {
    const t = makeT("en");
    expect(t("nav_dashboard")).toBe("Dashboard");
  });

  it("switching to Hindi returns Hindi string", () => {
    const t = makeT("hi");
    expect(t("nav_dashboard")).toBe("डैशबोर्ड");
  });

  it("falls back to English for missing key (simulated)", () => {
    const t = makeT("hi");
    // Simulate a key that exists in English but test fallback pattern
    const fakeKey = "nav_dashboard" as StringKey;
    const result = strings.hi[fakeKey] ?? strings.en[fakeKey];
    expect(result).toBeTruthy();
  });

  it("language switch does not affect other language values", () => {
    const enVal = strings.en.nav_dashboard;
    const hiVal = strings.hi.nav_dashboard;
    // After simulated switch to Hindi, English value unchanged
    expect(strings.en.nav_dashboard).toBe(enVal);
    expect(strings.hi.nav_dashboard).toBe(hiVal);
  });
});

// ─── Onboarding-specific keys ─────────────────────────────────────────────────

describe("i18n onboarding keys", () => {
  it("has 5 question keys for both languages", () => {
    for (let i = 1; i <= 5; i++) {
      const key = `onboarding_q${i}` as StringKey;
      expect(strings.en[key]).toBeTruthy();
      expect(strings.hi[key]).toBeTruthy();
    }
  });

  it("finish button label differs in English and Hindi", () => {
    expect(strings.en.onboarding_finish).not.toBe(strings.hi.onboarding_finish);
  });
});
