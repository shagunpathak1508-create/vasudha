import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Globe2,
  LayoutDashboard,
  Leaf,
  Zap,
  MessageCircle,
  Trophy,
  History,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, key: "nav_dashboard" as const },
  { to: "/learn", icon: BookOpen, key: "nav_learn" as const },
  { to: "/simulator", icon: Zap, key: "nav_simulator" as const },
  { to: "/coach", icon: MessageCircle, key: "nav_coach" as const },
  { to: "/challenges", icon: Trophy, key: "nav_challenges" as const },
  { to: "/history", icon: History, key: "nav_history" as const },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useTranslation();
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed left-0 top-0 z-40 flex h-full w-16 flex-col items-center gap-2 py-4 md:w-56 md:items-start md:gap-1 md:px-3"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 25%, transparent), color-mix(in oklab, var(--color-background) 90%, transparent))",
          backdropFilter: "blur(20px) saturate(130%)",
          borderRight:
            "1px solid color-mix(in oklab, var(--color-accent) 18%, transparent)",
        }}
        aria-label="App navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="mb-4 flex items-center gap-2 px-2 py-3 text-foreground transition hover:text-accent"
          aria-label="Vasudha home"
        >
          <Globe2 className="h-7 w-7 shrink-0 text-accent animate-pulse-glow" />
          <span className="hidden font-display text-lg font-bold tracking-tight md:block">
            Vasudha
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex w-full flex-col items-center gap-1 md:items-stretch" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, key }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-2 py-3 text-sm font-medium transition-all duration-200 md:px-3 ${
                  active
                    ? "bg-secondary/40 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--color-secondary) 35%, transparent), color-mix(in oklab, var(--color-primary) 25%, transparent))",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative h-5 w-5 shrink-0" />
                <span className="relative hidden md:block">{t(key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Language Toggle */}
        <div
          className="glass-card mb-2 flex items-center rounded-full p-1 text-xs font-semibold"
          aria-label="Language switcher"
        >
          {(["en", "hi"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`relative rounded-full px-3 py-1.5 transition ${
                lang === code ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {lang === code && (
                <motion.span
                  layoutId="lang-pill-app"
                  className="absolute inset-0 rounded-full bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{code === "en" ? "EN" : "हिं"}</span>
            </button>
          ))}
        </div>

        {/* Back to landing */}
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground transition hover:text-accent"
          aria-label="Back to landing page"
        >
          <ArrowLeft className="h-3 w-3" />
          <span className="hidden md:block">Home</span>
        </Link>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex min-h-screen flex-1 flex-col pl-16 md:pl-56"
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
