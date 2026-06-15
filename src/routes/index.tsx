import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/vasudha/Header";
import { Hero } from "@/components/vasudha/Hero";
import { Features } from "@/components/vasudha/Features";
import { EarthStates } from "@/components/vasudha/EarthStates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vasudha — Understand your impact. Shape a greener future." },
      {
        name: "description",
        content:
          "Vasudha is an AI sustainability companion. Track your carbon footprint, learn green habits, and watch your digital Earth transform.",
      },
      { property: "og:title", content: "Vasudha — Your AI sustainability companion" },
      {
        property: "og:description",
        content:
          "Track, learn, and shape a greener future. Watch your digital Earth respond to every choice.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <EarthStates />
      <footer className="border-t border-border/40 py-10 text-center text-sm text-muted-foreground">
        <p>🌍 Vasudha · Crafted with care for a living planet</p>
      </footer>
    </main>
  );
}
