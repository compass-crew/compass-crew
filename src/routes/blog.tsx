import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS } from "@/data/site";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Compass Crew" },
      { name: "description", content: "Reports, playbooks and stories from India's student builder community." },
      { property: "og:title", content: "Blog — Compass Crew" },
      { property: "og:description", content: "Reports, playbooks and stories from the crew." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const hasPosts = BLOG_POSTS.length > 0;
  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Stories from the crew."
        description="Reports, playbooks and interviews from student builders across India."
      />
      <Section>
        {hasPosts ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((p) => (
              <Card key={p.slug} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elegant">
                <div className="h-40 bg-gradient-brand relative">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">{p.tag}</Badge>
                </div>
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.date}</span><span>·</span><span>{p.readTime}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-snug">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="pt-2 text-xs font-medium text-foreground/80">By {p.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold">Writing coming soon.</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              We're preparing our first reports, playbooks and interviews. Join the community to
              get them in your inbox first.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/community">Join the crew</Link>
              </Button>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
