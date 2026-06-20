import { motion } from "framer-motion";

interface ChapterIntroScreenProps {
  chapter: number;
  totalChapters: number;
  title: string;
  subtitle: string;
  icon: string;
  context: string;
  onBegin: () => void;
}

export function ChapterIntroScreen({
  chapter,
  totalChapters,
  title,
  subtitle,
  icon,
  context,
  onBegin,
}: ChapterIntroScreenProps) {
  return (
    <motion.div
      key={`chapter-intro-${chapter}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-8 text-center max-w-lg"
    >
      {/* Chapter badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <div
          className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{
            background: "color-mix(in oklab, var(--color-accent) 25%, transparent)",
            border: "1px solid color-mix(in oklab, var(--color-accent) 40%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          Chapter {chapter} of {totalChapters}
        </div>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--color-leaf-glow) 35%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <span className="relative text-7xl" role="img" aria-label={title}>
          {icon}
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-accent)" }}
        >
          {subtitle}
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          {title}
        </h2>
      </motion.div>

      {/* Context paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="text-sm leading-relaxed max-w-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {context}
      </motion.p>

      {/* Begin CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onBegin}
        id={`chapter-${chapter}-begin-btn`}
        className="glow-primary rounded-full px-9 py-4 text-base font-bold transition-colors"
        style={{
          background: "linear-gradient(135deg, var(--color-secondary), var(--color-accent))",
          color: "var(--color-secondary-foreground)",
        }}
      >
        Begin Chapter →
      </motion.button>
    </motion.div>
  );
}
