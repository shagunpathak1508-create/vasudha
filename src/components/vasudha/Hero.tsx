import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import forestBg from "@/assets/forest-bg.jpg";
import earth from "@/assets/earth.png";
import { ParticleField } from "./ParticleField";


export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center overflow-hidden pt-24">
      {/* Background */}
      <img
        src={forestBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--color-sunlight) 18%, transparent), transparent 60%), linear-gradient(180deg, color-mix(in oklab, var(--color-background) 55%, transparent) 0%, var(--color-background) 95%)",
        }}
      />
      <ParticleField count={28} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Text */}
        <div className="flex flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl leading-[1.05] font-bold sm:text-6xl lg:text-7xl"
          >
            <span className="block">For the Earth</span>
            <span className="text-gradient-leaf">that gives us everything.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
          >
            Understand your impact, build sustainable habits, and watch your digital Earth respond to every choice you make.
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/onboarding"
              className="group glow-primary relative inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:scale-[1.03] hover:bg-accent"
              aria-label="Start your Earth journey — sustainability onboarding"
            >
              Start My Earth Journey
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/learn"
              className="glass-card rounded-full px-6 py-4 text-base font-semibold text-foreground transition hover:bg-white/10"
              aria-label="Learn what a carbon footprint is"
            >
              What is a Carbon Footprint?
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-12 flex items-center gap-6 text-sm text-muted-foreground"
          >
            <div>
              <div className="font-display text-2xl font-bold text-foreground">12k+</div>
              <div>Eco journeys</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-display text-2xl font-bold text-foreground">3.2M kg</div>
              <div>CO₂ avoided</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="font-display text-2xl font-bold text-foreground">28</div>
              <div>Habits unlocked</div>
            </div>
          </motion.div>
        </div>

        {/* Earth */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative aspect-square w-full max-w-[560px]"
          >
            {/* Glow halo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse-glow rounded-full"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--color-leaf-glow) 35%, transparent), transparent 65%)",
              }}
            />
            {/* Orbiting ring */}
            <div className="absolute inset-6 animate-spin-slow rounded-full border border-dashed border-accent/30" />
            <div
              className="absolute inset-12 rounded-full border border-accent/20"
              style={{ animation: "spin-slow 120s linear infinite reverse" }}
            />

            {/* Floating motifs */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-2 top-12 text-3xl"
            >
              🌿
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-2 top-6 text-3xl"
            >
              ☁️
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-2 bottom-16 text-2xl"
            >
              🕊️
            </motion.div>
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-8 left-6 text-2xl"
            >
              🌳
            </motion.div>

            {/* Earth */}
            <img
              src={earth}
              alt="Glowing 3D Earth representing your sustainability journey"
              width={1024}
              height={1024}
              className="relative h-full w-full animate-spin-slow object-contain drop-shadow-[0_20px_60px_rgba(67,160,71,0.4)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}