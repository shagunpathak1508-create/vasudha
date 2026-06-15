import { useState } from "react";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";

export function Header() {
  const [lang, setLang] = useState<"en" | "hi">("en");

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Globe2 className="h-7 w-7 text-accent animate-pulse-glow" />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Vasudha
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition hover:text-accent">
            Features
          </a>
          <a href="#earth" className="text-sm text-muted-foreground transition hover:text-accent">
            Your Earth
          </a>
          <a href="#about" className="text-sm text-muted-foreground transition hover:text-accent">
            About
          </a>
        </nav>

        <div className="glass-card flex items-center rounded-full p-1 text-xs font-semibold">
          {(["en", "hi"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`relative rounded-full px-3 py-1.5 transition ${
                lang === code ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {lang === code && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 rounded-full bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{code === "en" ? "EN" : "हिं"}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.header>
  );
}