import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface OptionCardProps {
  value: string;
  label: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: (value: string) => void;
  description?: string;
}

export function OptionCard({
  value,
  label,
  icon,
  selected,
  onSelect,
  description,
}: OptionCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        selected
          ? "glow-primary ring-2 ring-accent/70"
          : "glass-card hover:border-accent/40"
      }`}
      style={
        selected
          ? {
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 28%, transparent), color-mix(in oklab, var(--color-secondary) 22%, transparent))",
            }
          : {}
      }
    >
      {/* Selection indicator */}
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground"
          aria-hidden="true"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      )}

      {/* Icon */}
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>

      {/* Label */}
      <span className="font-display text-base font-bold text-foreground leading-tight">
        {label}
      </span>

      {/* Optional description */}
      {description && (
        <span className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </span>
      )}
    </motion.button>
  );
}
