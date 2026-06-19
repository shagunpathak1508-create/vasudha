import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/vasudha/AppShell";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import { getImpactHistory } from "@/lib/firebase";
import { getOrCreateUserId, getCachedProfile } from "@/lib/user";
import type { EarthProfile } from "@/lib/carbon";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Impact History — Vasudha" },
      { name: "description", content: "Track your sustainability journey over time with Vasudha Health Index history and milestone log." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AppShell>
        <HistoryPage />
      </AppShell>
    </I18nProvider>
  ),
});

function HistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<{ date: string; score: number; state: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const profile = getCachedProfile<EarthProfile>();

  useEffect(() => {
    const userId = getOrCreateUserId();

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 4000)
    );

    Promise.race([getImpactHistory(userId), timeout])
      .then((entries) => {
        const formatted = entries.map((e, i) => ({
          date: `Assessment ${entries.length - i}`,
          score: e.score,
          state: e.state,
        })).reverse();
        setHistory(formatted);
      })
      .catch(() => {
        // Offline — show demo data
        if (profile) {
          setHistory([
            { date: "Today", score: profile.score, state: profile.state },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const STATE_ICONS: Record<string, string> = {
    thriving: "🌿",
    balanced: "🌎",
    struggling: "🌍",
    critical: "🔥",
  };

  return (
    <div className="relative min-h-screen px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 90%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 45%)",
        }}
      />

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t("nav_history")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{t("history_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("history_subtitle")}</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
            🌍
          </motion.div>
          <span className="ml-3">Loading your journey…</span>
        </div>
      ) : history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card mx-auto max-w-md rounded-3xl p-10 text-center"
        >
          <div className="mb-4 text-6xl">🌱</div>
          <h2 className="font-display text-xl font-bold">Your journey starts here</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("history_no_data")}</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Line chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6"
            aria-label="Vasudha Health Index over time"
          >
            <p className="mb-5 font-display text-base font-bold">{t("health_index")} Over Time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", color: "var(--color-foreground)" }}
                  cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* History log */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-6"
          >
            <p className="mb-5 font-display text-base font-bold">Assessment Log</p>
            <div className="space-y-3" role="list" aria-label="Assessment history">
              {history.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  role="listitem"
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{STATE_ICONS[entry.state] ?? "🌍"}</span>
                    <div>
                      <p className="text-sm font-semibold">{entry.date}</p>
                      <p className="text-xs text-muted-foreground capitalize">{entry.state} Earth</p>
                    </div>
                  </div>
                  <div className="font-display text-xl font-bold text-accent">{entry.score}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
