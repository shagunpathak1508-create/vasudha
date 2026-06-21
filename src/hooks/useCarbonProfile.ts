/**
 * useCarbonProfile
 *
 * Reusable hook that resolves the current user's Earth profile, onboarding answers,
 * and personalized insights from localStorage cache.
 *
 * Encapsulates the repeated pattern previously duplicated across dashboard.tsx,
 * history.tsx, and coach.tsx. Falls back to a sensible demo profile when no
 * cached data is found (unauthenticated / pre-onboarding state).
 *
 * @returns {CarbonProfileResult} The resolved profile, answers, insights, and a flag
 *   indicating whether the demo fallback is active.
 */

import { useState, useEffect } from "react";
import { getCachedProfile, getCachedAnswers } from "@/lib/user";
import {
  generateEarthProfile,
  generatePersonalizedInsights,
  type EarthProfile,
  type OnboardingAnswers,
  type PersonalizedInsights,
} from "@/lib/carbon";

/** Default answers used when no onboarding data is cached. */
const DEMO_ANSWERS: OnboardingAnswers = {
  transport: "public",
  food: "vegetarian",
  electricity: "average",
  shopping: "monthly",
  waste: "sometimes",
};

/** Shape returned by the {@link useCarbonProfile} hook. */
export interface CarbonProfileResult {
  /** The user's Earth profile (from cache or demo fallback). Never null after mount. */
  profile: EarthProfile | null;
  /** The user's onboarding answers (from cache or demo fallback). Never null after mount. */
  answers: OnboardingAnswers | null;
  /** Personalized insights derived from the profile and answers. */
  insights: PersonalizedInsights | null;
  /**
   * `true` when no cached profile was found and the demo profile is being shown.
   * Use this to display prompts like "Complete onboarding to see your real data."
   */
  isDemo: boolean;
}

/**
 * Resolve the current user's Earth profile, answers, and insights from localStorage.
 * Provides a demo profile as a fallback for unauthenticated or pre-onboarding users.
 *
 * @example
 * function MyComponent() {
 *   const { profile, insights, isDemo } = useCarbonProfile();
 *   if (!profile) return null;
 *   return <div>{profile.score}/100 {isDemo && "(demo)"}</div>;
 * }
 */
export function useCarbonProfile(): CarbonProfileResult {
  const [profile, setProfile] = useState<EarthProfile | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers | null>(null);
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    type CachedProfile = EarthProfile & { _insights?: PersonalizedInsights };
    const cachedProfile = getCachedProfile<CachedProfile>();
    const cachedAnswers = getCachedAnswers<OnboardingAnswers>();

    if (cachedProfile) {
      setProfile(cachedProfile);

      if (cachedAnswers) {
        setAnswers(cachedAnswers);
        // Reuse pre-computed insights if available; otherwise compute now
        const resolvedInsights =
          cachedProfile._insights ??
          generatePersonalizedInsights(cachedAnswers, cachedProfile);
        setInsights(resolvedInsights);
      } else {
        // Profile cached but answers are missing — build a minimal fallback
        const fallbackInsights: PersonalizedInsights = {
          earthStatusSummary: `Your Earth is ${cachedProfile.state}. Complete onboarding to get fully personalised insights.`,
          biggestImpactArea: cachedProfile.topSource,
          biggestImpactLabel: cachedProfile.topSourceLabel,
          biggestImpactScoreBoost: 8,
          bestArea: "waste",
          bestAreaLabel: "Waste & Recycling",
          easiestWin: cachedProfile.topSource,
          easiestWinLabel: cachedProfile.topSourceLabel,
          easiestWinScoreBoost: 5,
          easiestWinTip: cachedProfile.improvement,
        };
        setInsights(fallbackInsights);
      }
    } else {
      // No cached data — show demo profile
      const demoProfile = generateEarthProfile(DEMO_ANSWERS);
      const demoInsights = generatePersonalizedInsights(DEMO_ANSWERS, demoProfile);
      setProfile(demoProfile);
      setAnswers(DEMO_ANSWERS);
      setInsights(demoInsights);
      setIsDemo(true);
    }
  }, []);

  return { profile, answers, insights, isDemo };
}
