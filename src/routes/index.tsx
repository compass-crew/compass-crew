import { createFileRoute } from "@tanstack/react-router";
import { LandingNarrativeController } from "@/components/landing/LandingNarrativeController";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compass Crew — India's Student Innovation Platform" },
      {
        name: "description",
        content:
          "Compass Crew is India's AI-first student innovation platform — hackathons, team matching, verified certificates, mentorship and a builder community for the next generation.",
      },
      { property: "og:title", content: "Compass Crew — India's Student Innovation Platform" },
      {
        property: "og:description",
        content:
          "AI-first student community. Hackathons, teams, certificates, mentorship — for the next generation of Indian builders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative w-full bg-[#09090B] text-[#F5F2EA] min-h-screen [overflow-x:clip]">
      {/*
       * LandingNarrativeController
       *
       * Architecture:
       *   - ImmersiveWorld: fixed WebGL canvas (z-0) — ONE persistent 3D world
       *   - 8 independent <section> elements stacked vertically
       *     Each section has its own scroll height and sticky content panel
       *     so sections feel like real pages while sharing the same visual world
       *
       * Scroll journey:
       *   HERO → DISCOVER → BUILD → LEARN → CONNECT → COMPETE → SHIP → GROW
       */}
      <LandingNarrativeController />
    </div>
  );
}
