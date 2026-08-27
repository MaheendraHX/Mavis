import { createFileRoute } from "@tanstack/react-router";

import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Nav } from "@/components/landing/Nav";
import { TechStack } from "@/components/landing/TechStack";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mavis — The AI that stays in the loop" },
      {
        name: "description",
        content:
          "Mavis is a multimodal AI assistant that searches the live web, reads your files, writes code and keeps every thread organized.",
      },
      {
        property: "og:title",
        content: "Mavis — The AI that stays in the loop",
      },
      {
        property: "og:description",
        content:
          "A multimodal AI assistant with live web search, file reading and saved threads. Open the demo, no account needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="landing-shell landing-noise min-h-screen w-full">
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <TechStack />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
