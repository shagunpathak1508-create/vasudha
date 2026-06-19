import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/vasudha/AppShell";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import { joinChallenge, updateChallengeProgress, getChallengeProgress } from "@/lib/firebase";
import { getOrCreateUserId } from "@/lib/user";
import type { ChallengeProgress } from "@/lib/firebase";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Weekly Eco Challenges — Vasudha" },
      { name: "description", content: "Join Vasudha's weekly sustainability challenges, track progress, and earn eco badges." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AppShell>
        <ChallengesPage />
      </AppShell>
    </I18nProvider>
  ),
});

// ─── Challenge definitions ─────────────────────────────────────────────────────

const CHALLENGES = [
  {
    id: "plant_based_week",
    icon: "🌱",
    title: "Plant-Based Week",
    titleHi: "पौधे-आधारित सप्ताह",
    desc: "Eat only vegetarian or vegan meals for 7 days.",
    descHi: "7 दिनों तक केवल शाकाहारी भोजन खाएं।",
    color: "var(--color-leaf-glow)",
    badge: "🌿",
    badgeName: "Green Plate",
  },
  {
    id: "green_commute",
    icon: "🚴",
    title: "Green Commute",
    titleHi: "हरित आवागमन",
    desc: "Use public transport or cycle to work every day this week.",
    descHi: "इस सप्ताह हर दिन सार्वजनिक परिवहन या साइकिल से काम करें।",
    color: "var(--color-earth-blue)",
    badge: "🚲",
    badgeName: "Clean Commuter",
  },
  {
    id: "energy_saver",
    icon: "💡",
    title: "Energy Saver",
    titleHi: "ऊर्जा बचतकर्ता",
    desc: "Set AC to 24°C and switch off lights when leaving rooms.",
    descHi: "AC को 24°C पर सेट करें और कमरा छोड़ते समय लाइट बंद करें।",
    color: "var(--color-sunlight)",
    badge: "⚡",
    badgeName: "Watt Warrior",
  },
  {
    id: "recycling_hero",
    icon: "♻",
    title: "Recycling Hero",
    titleHi: "रीसाइक्लिंग हीरो",
    desc: "Separate dry and wet waste every day and compost food scraps.",
    descHi: "हर दिन सूखा और गीला कचरा अलग करें और भोजन के अवशेष खाद बनाएं।",
    color: "oklch(0.55 0.12 180)",
    badge: "🌍",
    badgeName: "Earth Guardian",
  },
];

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ days, color }: { days: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (days / 7) * circ;

  return (
    <div className="relative h-16 w-16">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          initial={{ strokeDashoffset: circ }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-sm font-bold" style={{ color }} aria-label={`${days} of 7 days`}>
          {days}/7
        </span>
      </div>
    </div>
  );
}

// ─── Badge Reveal ─────────────────────────────────────────────────────────────

function BadgeReveal({ badge, name, show }: { badge: string; name: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex flex-col items-center gap-1"
          aria-label={`Badge earned: ${name}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/40 text-3xl shadow-lg glow-primary">
            {badge}
          </div>
          <span className="text-xs font-semibold text-accent">{name}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

interface ChallengeCardProps {
  challenge: (typeof CHALLENGES)[number];
  progress?: ChallengeProgress;
  onJoin: (id: string) => void;
  onProgress: (id: string, days: number) => void;
  lang: "en" | "hi";
}

function ChallengeCard({ challenge, progress, onJoin, onProgress, lang }: ChallengeCardProps) {
  const isJoined = !!progress;
  const isCompleted = progress?.completed ?? false;
  const days = progress?.daysCompleted ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card relative overflow-hidden rounded-3xl p-6 transition-all"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 20%, color-mix(in oklab, ${challenge.color} 60%, transparent), transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">{challenge.icon}</span>
          <div>
            <h2 className="font-display text-lg font-bold">
              {lang === "hi" ? challenge.titleHi : challenge.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
              {lang === "hi" ? challenge.descHi : challenge.desc}
            </p>
          </div>
        </div>

        {/* Badge */}
        <BadgeReveal badge={challenge.badge} name={challenge.badgeName} show={isCompleted} />
      </div>

      {/* Progress ring + actions */}
      <div className="relative flex items-center justify-between">
        {isJoined ? (
          <>
            <ProgressRing days={days} color={challenge.color} />
            {isCompleted ? (
              <span className="rounded-full bg-secondary/30 px-4 py-2 text-sm font-semibold text-accent">
                ✓ Completed!
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onProgress(challenge.id, Math.max(0, days - 1))}
                  disabled={days === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm transition hover:bg-white/20 disabled:opacity-30"
                  aria-label="Remove one day"
                >
                  −
                </button>
                <button
                  onClick={() => onProgress(challenge.id, Math.min(7, days + 1))}
                  disabled={days >= 7}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 text-sm font-bold transition hover:bg-secondary disabled:opacity-30"
                  aria-label="Add one day"
                >
                  +
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => onJoin(challenge.id)}
            className="glow-primary rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition hover:bg-accent"
            aria-label={`Join ${challenge.title} challenge`}
          >
            Join Challenge
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Challenges Page ──────────────────────────────────────────────────────────

function ChallengesPage() {
  const { t, lang } = useTranslation();
  const [progressMap, setProgressMap] = useState<Record<string, ChallengeProgress>>({});
  const [userId] = useState(() => getOrCreateUserId());

  // Load Firestore progress
  useEffect(() => {
    getChallengeProgress(userId)
      .then(setProgressMap)
      .catch((err) => console.warn("Firestore read failed:", err));
  }, [userId]);

  async function handleJoin(challengeId: string) {
    const entry: ChallengeProgress = {
      challengeId,
      joinedAt: new Date(),
      daysCompleted: 0,
      completed: false,
    };
    setProgressMap((prev) => ({ ...prev, [challengeId]: entry }));
    try {
      await joinChallenge(userId, challengeId);
    } catch (err) {
      console.warn("Firestore join failed:", err);
    }
  }

  async function handleProgress(challengeId: string, days: number) {
    const prev = progressMap[challengeId];
    if (!prev) return;
    const updated: ChallengeProgress = { ...prev, daysCompleted: days, completed: days >= 7 };
    setProgressMap((p) => ({ ...p, [challengeId]: updated }));
    try {
      await updateChallengeProgress(userId, challengeId, days);
    } catch (err) {
      console.warn("Firestore update failed:", err);
    }
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;

  return (
    <div className="relative min-h-screen px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 45%)",
        }}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t("nav_challenges")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{t("challenges_title")}</h1>
        {completedCount > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            🏆 {completedCount} challenge{completedCount > 1 ? "s" : ""} completed this week
          </p>
        )}
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2" role="list" aria-label="Weekly eco challenges">
        {CHALLENGES.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            role="listitem"
          >
            <ChallengeCard
              challenge={ch}
              progress={progressMap[ch.id]}
              onJoin={handleJoin}
              onProgress={handleProgress}
              lang={lang}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
