import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/vasudha/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/vasudha/onboarding/OptionCard";
import { ResultCard } from "@/components/vasudha/onboarding/ResultCard";
import { ChapterIntroScreen } from "@/components/vasudha/onboarding/ChapterIntroScreen";
import { InsightPanel } from "@/components/vasudha/onboarding/InsightPanel";
import {
  generateEarthProfile,
  calculateScore,
  generatePersonalizedInsights,
  type OnboardingAnswers,
} from "@/lib/carbon";
import { saveUserProfile } from "@/lib/firebase";
import { getOrCreateUserId, cacheProfile, cacheAnswers } from "@/lib/user";
import { I18nProvider, useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build Your Earth — Vasudha" },
      {
        name: "description",
        content:
          "An interactive 5-chapter discovery journey to reveal your personal Earth and Vasudha Health Index.",
      },
    ],
  }),
  component: () => (
    <I18nProvider>
      <OnboardingPage />
    </I18nProvider>
  ),
});

// ─── Chapter definitions ──────────────────────────────────────────────────────

const CHAPTERS = [
  {
    key: "transport" as const,
    chapter: 1,
    intro: {
      title: "The Way You Move",
      subtitle: "Chapter 1 · Transport",
      icon: "🚗",
      context:
        "Every journey has a carbon cost — from zero-emission walks to high-altitude flights. How we commute accounts for up to 35% of personal carbon footprints. Let's discover your travel story.",
    },
    question: "How do you usually get around?",
    options: [
      { value: "walking", label: "Walking", icon: "🚶", desc: "Zero emissions" },
      { value: "cycling", label: "Cycling", icon: "🚴", desc: "Nearly zero" },
      { value: "public", label: "Public Transport", icon: "🚌", desc: "Low per-km" },
      { value: "two_wheeler", label: "Two Wheeler", icon: "🛵", desc: "Moderate" },
      { value: "car", label: "Car", icon: "🚗", desc: "High per-km" },
      { value: "flights", label: "Frequent Flights", icon: "✈️", desc: "Very high" },
    ],
    insights: {
      walking: { headline: "Every step heals the Earth.", body: "Walking produces zero greenhouse gases and improves air quality in cities. If 20% of car trips were replaced with walks, urban CO₂ levels would drop by 4%.", impactTag: "0 kg CO₂ per km" },
      cycling: { headline: "The humble bicycle is a superpower.", body: "Cycling produces ~5g CO₂/km versus ~170g for a car. The Netherlands saves 3 million tonnes of CO₂ annually just through cycling culture.", impactTag: "~5g CO₂ per km" },
      public: { headline: "Shared rides, shared responsibility.", body: "A single bus replaces up to 40 cars. Public transit users emit on average 45% less CO₂ than those who drive everywhere.", impactTag: "−45% vs car" },
      two_wheeler: { headline: "Lighter but not invisible.", body: "Two-wheelers emit roughly 70–100g CO₂/km — about half a car — but are often used for many short trips, adding up quickly.", impactTag: "~85g CO₂ per km" },
      car: { headline: "Cars are our most common climate cost.", body: "The average petrol car emits ~170g CO₂/km. Carpooling just 3 days a week can cut your transport footprint by 30%.", impactTag: "~170g CO₂ per km" },
      flights: { headline: "Aviation is the highest-altitude habit.", body: "One domestic flight can produce more CO₂ than a month of city driving. Train alternatives emit 80% less for most journeys.", impactTag: "Up to 255g CO₂ per km" },
    },
  },
  {
    key: "food" as const,
    chapter: 2,
    intro: {
      title: "Food & The Planet",
      subtitle: "Chapter 2 · Diet",
      icon: "🌾",
      context:
        "What's on your plate shapes the land, water, and air around us. The global food system contributes ~25% of total greenhouse emissions. Every meal is a vote for the kind of Earth you want.",
    },
    question: "What best describes your food habits?",
    options: [
      { value: "vegetarian", label: "Vegetarian", icon: "🥗", desc: "Lowest impact" },
      { value: "eggetarian", label: "Eggetarian", icon: "🥚", desc: "Low impact" },
      { value: "mixed", label: "Mixed Diet", icon: "🍱", desc: "Medium impact" },
      { value: "heavy_meat", label: "Frequent Meat", icon: "🍖", desc: "High impact" },
    ],
    insights: {
      vegetarian: { headline: "Plants fuel the Earth's healing.", body: "A vegetarian diet uses 2.5× less land and 55% less water than a meat-heavy one. Choosing plants for even one meal a day saves roughly 100 kg CO₂/year.", impactTag: "~1.5 kg CO₂/day" },
      eggetarian: { headline: "Eggs: a lighter footprint.", body: "Eggs produce about 4.5 kg CO₂/kg — much less than beef (60 kg) or chicken (6 kg). An eggetarian diet sits firmly in the low-impact zone.", impactTag: "~1.9 kg CO₂/day" },
      mixed: { headline: "Balance is the next step.", body: "Mixed diets average 3–5 kg CO₂/day. Swapping just 3 meals a week to plant-based could save 300 kg CO₂ annually — equal to planting 14 trees.", impactTag: "~3.5 kg CO₂/day" },
      heavy_meat: { headline: "Beef is the costliest bite.", body: "Producing 1 kg of beef emits ~60 kg CO₂ and uses 15,000 litres of water. Reducing meat to 3 days a week could shrink your food footprint by 45%.", impactTag: "~6 kg CO₂/day" },
    },
  },
  {
    key: "electricity" as const,
    chapter: 3,
    intro: {
      title: "Energy at Home",
      subtitle: "Chapter 3 · Electricity",
      icon: "⚡",
      context:
        "Electricity powers modern life — and in most countries it still comes partially from coal and gas. How much energy your home uses shapes the health of local air quality and global climate systems alike.",
    },
    question: "How would you describe your electricity usage?",
    options: [
      { value: "low", label: "Low Usage", icon: "🕯️", desc: "<150 units/mo" },
      { value: "average", label: "Average", icon: "💡", desc: "150–300 units" },
      { value: "high", label: "High Usage", icon: "⚡", desc: "300–500 units" },
      { value: "heavy_ac", label: "Heavy AC", icon: "❄️", desc: "500+ units/mo" },
    ],
    insights: {
      low: { headline: "Light touch, bright future.", body: "Using under 150 units/month puts you in the top 20% of low-energy households. That translates to roughly 75 kg less CO₂ vs the average home, each year.", impactTag: "~50 kg CO₂/month" },
      average: { headline: "Room to grow greener.", body: "Average Indian household usage is ~200 units/month. Switching to LED lighting and 5-star appliances can reduce this by 20–30% with no lifestyle change.", impactTag: "~100 kg CO₂/month" },
      high: { headline: "High use, high potential.", body: "High electricity usage often stems from old appliances and habits. Upgrading your AC to inverter technology cuts energy use by up to 40%.", impactTag: "~175 kg CO₂/month" },
      heavy_ac: { headline: "Every degree matters.", body: "Running AC at 18°C vs 24°C uses 40% more electricity. Raising your thermostat by just 2°C saves roughly 6% per degree — adding up to 200+ kg CO₂/year.", impactTag: "~250 kg CO₂/month" },
    },
  },
  {
    key: "shopping" as const,
    chapter: 4,
    intro: {
      title: "What You Buy",
      subtitle: "Chapter 4 · Shopping",
      icon: "🛍️",
      context:
        "Every product has a hidden carbon story — from the factory that made it to the delivery truck that brought it. The manufacturing and shipping of consumer goods creates over 10% of global emissions.",
    },
    question: "How often do you shop for new things?",
    options: [
      { value: "rare", label: "Rarely Buy", icon: "🧘", desc: "Minimal purchases" },
      { value: "monthly", label: "Monthly", icon: "🛒", desc: "Occasional buys" },
      { value: "frequent", label: "Frequent", icon: "📦", desc: "Weekly orders" },
    ],
    insights: {
      rare: { headline: "Less is a superpower.", body: "Minimal purchasing keeps embedded carbon low. Choosing secondhand or repairing extends product life and saves the equivalent of 300 kg CO₂ per item not manufactured.", impactTag: "Lowest embedded CO₂" },
      monthly: { headline: "Mindful, not minimal.", body: "Monthly shopping is already below average. Choosing durable, locally made products can cut your shopping footprint by a further 25%.", impactTag: "~Medium impact" },
      frequent: { headline: "Fast fashion, fast carbon.", body: "Frequent online orders increase packaging waste and courier emissions. A 48-hour 'want vs need' pause can reduce impulse purchases by 40%.", impactTag: "~High packaging CO₂" },
    },
  },
  {
    key: "waste" as const,
    chapter: 5,
    intro: {
      title: "The Cycle of Waste",
      subtitle: "Chapter 5 · Waste",
      icon: "♻️",
      context:
        "Landfills produce methane — a greenhouse gas 80× more potent than CO₂ over 20 years. How we handle our waste is the often-forgotten final act in every product's story.",
    },
    question: "How do you handle waste and recycling?",
    options: [
      { value: "always_recycle", label: "Always Recycle", icon: "♻️", desc: "Compost + separate" },
      { value: "sometimes", label: "Sometimes", icon: "🗑️", desc: "Partial recycling" },
      { value: "rarely", label: "Rarely", icon: "🚮", desc: "Most goes to landfill" },
    ],
    insights: {
      always_recycle: { headline: "You've closed the loop.", body: "Consistent recycling and composting can divert up to 60% of household waste from landfills. That prevents methane equivalent to taking a car off the road for 3 months.", impactTag: "−60% landfill waste" },
      sometimes: { headline: "Halfway there.", body: "Partial recycling is a great start. Adding a simple wet/dry waste bin system at home could double your diversion rate with minimal effort.", impactTag: "Room to grow" },
      rarely: { headline: "A small habit, huge impact.", body: "Most waste that enters landfills could be composted or recycled. Starting with just food scraps can save 500 kg of methane-equivalent emissions per year.", impactTag: "Big improvement potential" },
    },
  },
] as const;

// ─── Stage state machine ──────────────────────────────────────────────────────
// Each chapter goes: "intro" → "question" → "insight" → next chapter's "intro" → …

type Stage = "intro" | "question" | "insight";

// ─── Component ────────────────────────────────────────────────────────────────

function OnboardingPage() {
  const navigate = useNavigate();

  const [chapterIdx, setChapterIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [showResult, setShowResult] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof generateEarthProfile> | null>(null);

  const chapter = CHAPTERS[chapterIdx];
  const currentAnswer = answers[chapter.key] as string | undefined;
  const isLast = chapterIdx === CHAPTERS.length - 1;

  // Live score: computed from answers collected so far
  const liveScore =
    Object.keys(answers).length === 0
      ? undefined
      : (() => {
          // Build a partial answers object with defaults for missing fields
          const partial: OnboardingAnswers = {
            transport: answers.transport ?? "public",
            food: answers.food ?? "mixed",
            electricity: answers.electricity ?? "average",
            shopping: answers.shopping ?? "monthly",
            waste: answers.waste ?? "sometimes",
          };
          return calculateScore(partial);
        })();

  function selectOption(value: string) {
    setAnswers((prev) => ({ ...prev, [chapter.key]: value }));
  }

  function handleBeginChapter() {
    setStage("question");
  }

  function handleAnswerConfirm() {
    if (!currentAnswer) return;
    setStage("insight");
  }

  function handleInsightContinue() {
    if (isLast) {
      // Final chapter: generate profile and show dramatic reveal
      const complete = answers as OnboardingAnswers;
      const earth = generateEarthProfile(complete);
      const insights = generatePersonalizedInsights(complete, earth);

      setProfile({ ...earth, _insights: insights } as typeof earth & { _insights: typeof insights });
      cacheProfile({ ...earth, _insights: insights });
      cacheAnswers(complete);
      setShowResult(true);

      const userId = getOrCreateUserId();
      saveUserProfile(userId, complete, earth).catch((err) =>
        console.warn("Firestore save failed (will retry on next session):", err),
      );
    } else {
      setChapterIdx((i) => i + 1);
      setStage("intro");
    }
  }

  function handleBack() {
    if (stage === "question") {
      setStage("intro");
    } else if (stage === "insight") {
      setStage("question");
    } else if (chapterIdx > 0) {
      setChapterIdx((i) => i - 1);
      setStage("question");
    } else {
      navigate({ to: "/" });
    }
  }

  if (showResult && profile) {
    return (
      <div className="min-h-screen bg-background overflow-y-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--color-leaf-glow) 18%, transparent), transparent 60%)",
          }}
        />
        <ResultCard
          profile={profile}
          answers={answers as OnboardingAnswers}
        />
      </div>
    );
  }

  const chapterLabel =
    stage === "intro"
      ? `Discovering Chapter ${chapter.chapter} of ${CHAPTERS.length}`
      : stage === "question"
        ? `Chapter ${chapter.chapter} · ${chapter.intro.subtitle.split(" · ")[1]}`
        : `Earth Insight — Chapter ${chapter.chapter}`;

  return (
    <OnboardingLayout
      step={chapterIdx + 1}
      totalSteps={CHAPTERS.length}
      liveScore={liveScore}
      chapterLabel={chapterLabel}
    >
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <div key={`intro-${chapterIdx}`} className="flex justify-center">
            <ChapterIntroScreen
              chapter={chapter.chapter}
              totalChapters={CHAPTERS.length}
              title={chapter.intro.title}
              subtitle={chapter.intro.subtitle}
              icon={chapter.intro.icon}
              context={chapter.intro.context}
              onBegin={handleBeginChapter}
            />
          </div>
        )}

        {stage === "question" && (
          <motion.div
            key={`question-${chapterIdx}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Question header */}
            <div className="mb-8 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl font-bold sm:text-3xl"
              >
                {chapter.question}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-2 text-sm"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Choose the option that best fits your typical habits
              </motion.p>
            </div>

            {/* Options grid */}
            <div
              className={`grid gap-4 ${
                chapter.options.length <= 4
                  ? "grid-cols-2 sm:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
              role="radiogroup"
              aria-label={chapter.question}
            >
              {chapter.options.map((opt) => (
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
                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:text-foreground glass-card"
                style={{ color: "var(--color-muted-foreground)" }}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                onClick={handleAnswerConfirm}
                disabled={!currentAnswer}
                id={`chapter-${chapter.chapter}-confirm-btn`}
                className="glow-primary flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))",
                  color: "var(--color-secondary-foreground)",
                }}
                aria-label={currentAnswer ? "See Earth Insight" : "Select an option to continue"}
              >
                See Earth Insight
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {stage === "insight" && currentAnswer && (
          <div key={`insight-${chapterIdx}`} className="flex justify-center">
            <InsightPanel
              icon={chapter.insights[currentAnswer as keyof typeof chapter.insights]?.icon ?? chapter.intro.icon}
              headline={chapter.insights[currentAnswer as keyof typeof chapter.insights]?.headline ?? ""}
              body={chapter.insights[currentAnswer as keyof typeof chapter.insights]?.body ?? ""}
              impactTag={chapter.insights[currentAnswer as keyof typeof chapter.insights]?.impactTag}
              onContinue={handleInsightContinue}
              continueLabel={isLast ? "Reveal My Earth ✨" : `Begin Chapter ${chapterIdx + 2} →`}
            />
          </div>
        )}
      </AnimatePresence>
    </OnboardingLayout>
  );
}
