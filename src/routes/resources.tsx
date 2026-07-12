import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Wrench, Video, Github, Zap, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Compass Crew" },
      { name: "description", content: "Guides, starter kits, videos and templates curated for student builders in India." },
      { property: "og:title", content: "Resources — Compass Crew" },
      { property: "og:description", content: "Guides, starter kits and templates for student builders." },
    ],
  }),
  component: ResourcesPage,
});

const resources = [
  { icon: BookOpen, tag: "Guide", title: "The Student Builder Handbook", body: "60 pages on going from first commit to first users — free download." },
  { icon: Wrench, tag: "Starter", title: "AI App Starter Kit", body: "Next.js + Vercel + OpenAI template with auth, billing and observability wired up." },
  { icon: Video, tag: "Video", title: "Hackathon Winners Series", body: "12 interviews with hackathon winners on scope, storytelling and shipping." },
  { icon: Github, tag: "Repo", title: "Compass Labs on GitHub", body: "Community-maintained OSS projects. Perfect for your first PR." },
  { icon: Zap, tag: "Playbook", title: "How to Cold-Email a Founder", body: "The 4-line email framework our members use to land intros and internships." },
  { icon: GraduationCap, tag: "Course", title: "AI Engineering Bootcamp", body: "Cohort-based 3-week deep dive on shipping production LLM apps." },
];

function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Everything you need. In one place."
        description="Handbooks, starter kits, videos and templates — curated for Indian student builders."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <Card key={r.title} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">{r.tag}</Badge>
                </div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.body}</p>
                <a href="#" className="inline-flex text-sm font-medium text-primary">Open →</a>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
