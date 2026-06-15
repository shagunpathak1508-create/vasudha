import { motion } from "framer-motion";
import thriving from "@/assets/earth-thriving.png";
import balanced from "@/assets/earth-balanced.png";
import struggling from "@/assets/earth-struggling.png";

const states = [
  {
    img: thriving,
    emoji: "🌿",
    title: "Thriving Earth",
    desc: "Forests reclaim the land, oceans run clean. Your habits compound into abundance.",
    glow: "var(--color-leaf-glow)",
  },
  {
    img: balanced,
    emoji: "🌎",
    title: "Balanced Earth",
    desc: "Steady as today. A liveable middle, awaiting your next decision.",
    glow: "var(--color-earth-blue)",
  },
  {
    img: struggling,
    emoji: "🔥",
    title: "Struggling Earth",
    desc: "Heat rises, ecosystems strain. Small daily choices can still rewrite this path.",
    glow: "oklch(0.7 0.2 40)",
  },
];

export function EarthStates() {
  return (
    <section id="earth" className="relative mx-auto max-w-7xl px-5 pb-32 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Living Simulation
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Your choices shape Vasudha
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Every action you log nudges your Earth into one of three futures. Hover to feel
          the shift.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {states.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
            whileHover={{ y: -10 }}
            className="glass-card group relative overflow-hidden rounded-3xl p-8 text-center"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at 50% 40%, color-mix(in oklab, ${s.glow} 30%, transparent), transparent 65%)`,
              }}
            />
            <div className="relative mx-auto h-56 w-56">
              <motion.img
                src={s.img}
                alt={s.title}
                width={768}
                height={768}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                style={{
                  filter: `drop-shadow(0 15px 40px color-mix(in oklab, ${s.glow} 45%, transparent))`,
                }}
              />
            </div>
            <div className="relative mt-6">
              <div className="font-display text-2xl font-bold">
                <span className="mr-2">{s.emoji}</span>
                {s.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="glass-card mx-auto mt-20 flex max-w-4xl flex-col items-center gap-6 rounded-3xl p-10 text-center sm:flex-row sm:text-left"
      >
        <div className="flex-1">
          <h3 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to plant your first seed?
          </h3>
          <p className="mt-2 text-muted-foreground">
            Join thousands shaping a thriving Vasudha — one habit at a time.
          </p>
        </div>
        <button className="glow-primary inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:scale-[1.03] hover:bg-accent">
          Begin Your Journey
        </button>
      </motion.div>
    </section>
  );
}