import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { TrendingUp, Star, Zap, Target, Globe2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/vasudha/AppShell";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import {
  type EarthProfile,
  generatePersonalizedInsights,
  type PersonalizedInsights,
} from "@/lib/carbon";
import { useCarbonProfile } from "@/hooks/useCarbonProfile";
import thriving from "@/assets/earth-thriving.png";
import balanced from "@/assets/earth-balanced.png";
import struggling from "@/assets/earth-struggling.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Earth Dashboard — Vasudha" },
      { name: "description", content: "Track your Vasudha Health Index, personal Earth story, and answer-specific eco recommendations." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AppShell>
        <DashboardPage />
      </AppShell>
    </I18nProvider>
  ),
});

const EARTH_IMGS = { thriving, balanced, struggling, critical: struggling };

// ─── Fake weekly trend ────────────────────────────────────────────────────────
function generateWeeklyData(score: number) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    score: Math.max(10, Math.min(100, score + Math.round((Math.random() - 0.5) * 12) + i)),
  }));
}

// ─── Health Gauge ─────────────────────────────────────────────────────────────
function HealthGauge({ score, state }: { score: number; state: string }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const dash = (score / 100) * half;
  const stateLabels: Record<string, string> = {
    thriving: "🌿 Thriving Earth",
    balanced: "🌎 Balanced Earth",
    struggling: "🌍 Struggling Earth",
    critical: "🔥 Critical Earth",
  };
  const stateColors: Record<string, string> = {
    thriving: "var(--color-leaf-glow)",
    balanced: "var(--color-earth-blue)",
    struggling: "oklch(0.72 0.18 55)",
    critical: "oklch(0.62 0.22 28)",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full" viewBox="0 0 160 160" aria-hidden="true">
          <path d="M 20 140 A 70 70 0 0 1 140 140" fill="none" stroke="var(--color-border)" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d="M 20 140 A 70 70 0 0 1 140 140"
            fill="none"
            stroke={stateColors[state] ?? "var(--color-accent)"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${half} ${half}`}
            animate={{ strokeDashoffset: half - dash }}
            initial={{ strokeDashoffset: half }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-display text-5xl font-bold"
            aria-label={`Vasudha Health Index: ${score} out of 100`}
          >
            {score}
          </motion.span>
          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>/100</span>
        </div>
      </div>
      <div className="font-display text-lg font-bold">{stateLabels[state]}</div>
    </div>
  );
}

// ─── Earth Status Summary ─────────────────────────────────────────────────────
function EarthStatusSummary({ summary }: { summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card w-full rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Globe2 className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          Earth Status
        </p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-foreground)" }}>
        {summary}
      </p>
    </motion.div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightTile({
  delay,
  icon,
  label,
  title,
  body,
  accentColor,
  action,
  actionLabel,
}: {
  delay: number;
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
  accentColor: string;
  action?: string;
  actionLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2" style={{ color: accentColor }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-display text-base font-bold leading-snug">{title}</p>
      <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--color-muted-foreground)" }}>{body}</p>
      {action && actionLabel && (
        <Link
          to={action as "/simulator" | "/challenges" | "/coach"}
          className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
          style={{ color: accentColor }}
        >
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Personalized Recommended Actions ────────────────────────────────────────
function PersonalizedActions({
  insights,
  profile,
}: {
  insights: PersonalizedInsights;
  profile: EarthProfile;
}) {
  const actions = [
    {
      icon: "🚌",
      title: insights.biggestImpactArea === "transport"
        ? "Switch Your Main Transport"
        : insights.biggestImpactArea === "food"
          ? "Try Plant-Based Meals"
          : insights.biggestImpactArea === "electricity"
            ? "Optimise Energy Use"
            : insights.biggestImpactArea === "shopping"
              ? "Shop More Mindfully"
              : "Improve Your Recycling",
      desc: insights.easiestWinTip,
      action: insights.biggestImpactArea === "transport" ? "/simulator"
        : insights.biggestImpactArea === "food" ? "/challenges"
        : "/coach",
    },
    {
      icon: profile.state === "thriving" ? "🌟" : "🌱",
      title: profile.state === "thriving"
        ? "Inspire Others Around You"
        : "Start One Eco Challenge",
      desc: profile.state === "thriving"
        ? "You're already thriving — share your habits and join a community challenge to amplify your impact."
        : `Your ${insights.bestAreaLabel} habits are strong. Build on that momentum with a weekly eco challenge.`,
      action: "/challenges",
    },
    {
      icon: "❓",
      title: "Ask Your Eco Coach",
      desc: `Get personalised advice on improving your ${insights.biggestImpactLabel.toLowerCase()} habits from our AI coach.`,
      action: "/coach",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((item, i) => (
        <Link
          key={i}
          to={item.action as "/simulator" | "/challenges" | "/coach"}
          className="glass-card group flex items-start gap-4 rounded-2xl p-5 transition hover:bg-white/5"
          aria-label={item.title}
        >
          <span className="text-3xl" aria-hidden="true">{item.icon}</span>
          <div>
            <p className="font-display text-sm font-bold group-hover:text-accent transition-colors">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>{item.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useTranslation();
  const { profile, answers, insights, isDemo } = useCarbonProfile();
  const [weeklyData, setWeeklyData] = useState<ReturnType<typeof generateWeeklyData>>([]);

  useEffect(() => {
    if (profile) {
      setWeeklyData(generateWeeklyData(profile.score));
    }
  }, [profile]);

  if (!profile) return null;

  const radarData = Object.entries(profile.categoryScores).map(([name, value]) => ({
    subject: name.charAt(0).toUpperCase() + name.slice(1),
    score: value,
  }));

  const earthImg = EARTH_IMGS[profile.state as keyof typeof EARTH_IMGS] ?? balanced;

  return (
    <div className="relative min-h-screen px-5 py-10 sm:px-8">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 60% 10%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 50%)",
        }}
      />

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          {t("nav_dashboard")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{t("dashboard_title")}</h1>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Health Index + Earth Image ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card flex flex-col items-center gap-5 rounded-3xl p-8 lg:col-span-1"
        >
          <HealthGauge score={profile.score} state={profile.state} />

          <div className="relative h-28 w-28">
            <div
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--color-leaf-glow) 40%, transparent), transparent 70%)" }}
              aria-hidden="true"
            />
            <img
              src={earthImg}
              alt={`${profile.state} Earth`}
              className="relative h-full w-full object-contain animate-float-y"
            />
          </div>

          {/* Earth status summary */}
          {insights && (
            <EarthStatusSummary summary={insights.earthStatusSummary} />
          )}
        </motion.div>

        {/* ── Charts + Insights column ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Weekly Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="glass-card rounded-3xl p-6"
            aria-label="Weekly progress chart"
          >
            <p className="mb-4 font-display text-base font-bold">{t("weekly_progress")}</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)" }}
                  cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-accent)" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar + Insight tiles row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-6"
              aria-label="Emissions breakdown radar chart"
            >
              <p className="mb-4 font-display text-base font-bold">{t("emissions_breakdown")}</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--color-leaf-glow)" fill="var(--color-leaf-glow)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Personalized Insight tiles */}
            {insights && (
              <div className="flex flex-col gap-3">
                <InsightTile
                  delay={0.25}
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  label="Biggest Impact"
                  title={insights.biggestImpactLabel}
                  body={`Addressing this could unlock up to +${insights.biggestImpactScoreBoost} VHI points.`}
                  accentColor="oklch(0.65 0.22 28)"
                  action="/simulator"
                  actionLabel="Simulate change"
                />
                <InsightTile
                  delay={0.32}
                  icon={<Star className="h-3.5 w-3.5" />}
                  label="Best Area"
                  title={insights.bestAreaLabel}
                  body="Your Earth shines brightest here. Keep this habit strong!"
                  accentColor="var(--color-leaf-glow)"
                />
                <InsightTile
                  delay={0.39}
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Easiest Win"
                  title={`+${insights.easiestWinScoreBoost} pts available`}
                  body={insights.easiestWinTip}
                  accentColor="var(--color-sunlight)"
                  action="/coach"
                  actionLabel="Ask Eco Coach"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Personalized Recommended Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-6 lg:col-span-3"
        >
          <p className="mb-5 font-display text-base font-bold">{t("recommended_actions")}</p>
          {insights && profile && !isDemo ? (
            <PersonalizedActions insights={insights} profile={profile} />
          ) : (
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Complete onboarding to see personalised recommendations.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
