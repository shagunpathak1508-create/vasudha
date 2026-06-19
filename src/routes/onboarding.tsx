import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/vasudha/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/vasudha/onboarding/OptionCard";
import { ResultCard } from "@/components/vasudha/onboarding/ResultCard";
import { generateEarthProfile, type OnboardingAnswers } from "@/lib/carbon";
import { saveUserProfile } from "@/lib/firebase";
import { getOrCreateUserId, cacheProfile, cacheAnswers } from "@/lib/user";
import { I18nProvider, useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Start Your Earth Journey — Vasudha" },
      { name: "description", content: "Answer 5 quick questions to generate your personal Vasudha Earth profile and Eco Index." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <OnboardingPage />
    </I18nProvider>
  ),
});

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "transport" as const,
    questionKey: "onboarding_q1" as const,
    options: [
      { value: "walking", label: "Walking", icon: "🚶", desc: "Zero emissions" },
      { value: "cycling", label: "Cycling", icon: "🚴", desc: "Nearly zero" },
      { value: "public", label: "Public Transport", icon: "🚌", desc: "Low per-km" },
      { value: "two_wheeler", label: "Two Wheeler", icon: "🛵", desc: "Moderate" },
      { value: "car", label: "Car", icon: "🚗", desc: "High per-km" },
      { value: "flights", label: "Frequent Flights", icon: "✈️", desc: "Very high" },
    ],
  },
  {
    key: "food" as const,
    questionKey: "onboarding_q2" as const,
    options: [
      { value: "vegetarian", label: "Vegetarian", icon: "🥗", desc: "Lowest impact" },
      { value: "eggetarian", label: "Eggetarian", icon: "🥚", desc: "Low impact" },
      { value: "mixed", label: "Mixed Diet", icon: "🍱", desc: "Medium impact" },
      { value: "heavy_meat", label: "Frequent Meat", icon: "🍖", desc: "High impact" },
    ],
  },
  {
    key: "electricity" as const,
    questionKey: "onboarding_q3" as const,
    options: [
      { value: "low", label: "Low Usage", icon: "🕯️", desc: "< 150 units/mo" },
      { value: "average", label: "Average", icon: "💡", desc: "150–300 units" },
      { value: "high", label: "High Usage", icon: "⚡", desc: "300–500 units" },
      { value: "heavy_ac", label: "Heavy AC", icon: "❄️", desc: "500+ units/mo" },
    ],
  },
  {
    key: "shopping" as const,
    questionKey: "onboarding_q4" as const,
    options: [
      { value: "rare", label: "Rarely Buy", icon: "🧘", desc: "Minimal purchases" },
      { value: "monthly", label: "Monthly", icon: "🛒", desc: "Occasional buys" },
      { value: "frequent", label: "Frequent", icon: "📦", desc: "Weekly orders" },
    ],
  },
  {
    key: "waste" as const,
    questionKey: "onboarding_q5" as const,
    options: [
      { value: "always_recycle", label: "Always Recycle", icon: "♻️", desc: "Compost + separate" },
      { value: "sometimes", label: "Sometimes", icon: "🗑️", desc: "Partial recycling" },
      { value: "rarely", label: "Rarely", icon: "🚮", desc: "Most goes to landfill" },
    ],
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [showResult, setShowResult] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof generateEarthProfile> | null>(null);

  const currentStep = STEPS[step];
  const currentAnswer = answers[currentStep?.key];
  const isLast = step === STEPS.length - 1;

  function selectOption(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep.key]: value }));
  }

  function handleNext() {
    if (!currentAnswer) return;

    if (isLast) {
      const complete = answers as OnboardingAnswers;
      const earth = generateEarthProfile(complete);

      // Cache locally and show result immediately — no await blocking the UI
      setProfile(earth);
      cacheProfile(earth);
      cacheAnswers(complete);
      setShowResult(true);

      // True fire-and-forget: save to Firestore in background
      const userId = getOrCreateUserId();
      saveUserProfile(userId, complete, earth).catch((err) =>
        console.warn("Firestore save failed (will retry on next session):", err),
      );
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else navigate({ to: "/" });
  }

  if (showResult && profile) {
    return (
      <div className="min-h-screen bg-background overflow-y-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--color-leaf-glow) 15%, transparent), transparent 60%)",
          }}
        />
        <ResultCard profile={profile} />
      </div>
    );
  }

  return (
    <OnboardingLayout step={step + 1} totalSteps={STEPS.length}>
      {/* Question */}
      <div className="mb-8 text-center">
        <motion.h1
          key={`q-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold sm:text-3xl"
        >
          {t(currentStep.questionKey)}
        </motion.h1>
      </div>

      {/* Options grid */}
      <div
        className={`grid gap-4 ${
          currentStep.options.length <= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
        role="radiogroup"
        aria-label={t(currentStep.questionKey)}
      >
        {currentStep.options.map((opt) => (
          <OptionCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
            icon={opt.icon}
            description={opt.desc}
            selected={currentAnswer === opt.value}
            onSelect={selectOption}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground glass-card"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswer}
          className="glow-primary flex items-center gap-2 rounded-full bg-secondary px-7 py-3 text-sm font-semibold text-secondary-foreground transition hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={isLast ? "Generate your Earth profile" : "Next question"}
        >
          {isLast ? "Generate My Earth" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
