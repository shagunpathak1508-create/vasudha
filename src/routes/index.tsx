import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/vasudha/Header";
import { Hero } from "@/components/vasudha/Hero";
import { Features } from "@/components/vasudha/Features";
import { EarthStates } from "@/components/vasudha/EarthStates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vasudha — For the Earth that gives us everything." },
      {
        name: "description",
        content:
          "Vasudha is a sustainability companion for a living Earth. Track your impact, learn green habits, and watch your digital Earth transform.",
      },
      { property: "og:title", content: "Vasudha — For the Earth that gives us everything." },
      {
        property: "og:description",
        content:
          "Understand your impact, build sustainable habits, and shape a thriving future for the planet.",
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
