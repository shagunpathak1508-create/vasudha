import { motion } from "framer-motion";
import { Sprout, Brain, Globe, Trophy } from "lucide-react";

const features = [
  {
    icon: Sprout,
    title: "Track Your Impact",
    desc: "Log daily choices — travel, meals, energy — and see real CO₂ numbers behind them.",
  },
  {
    icon: Brain,
    title: "AI Eco Coach",
    desc: "A personal companion that nudges you toward greener habits, in your own pace.",
  },
  {
    icon: Globe,
    title: "Future Earth Simulator",
    desc: "Project decades ahead and watch how your habits ripple across the planet.",
  },
  {
    icon: Trophy,
    title: "Weekly Eco Challenges",
    desc: "Small, playful missions that build into lasting, measurable change.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Why Vasudha
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          A living companion for a living planet
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Tools designed not to alarm, but to inspire — turning every small action into a
          visible signal on your personal Earth.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            whileHover={{ y: -8 }}
            className="glass-card group relative rounded-3xl p-6 transition-shadow hover:shadow-2xl"
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/30 text-accent transition group-hover:bg-secondary group-hover:text-secondary-foreground">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition group-hover:opacity-100"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}