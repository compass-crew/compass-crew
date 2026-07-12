import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  return (
    <>
      <PageHeader eyebrow="Blog" title="Stories from the crew." description="Reports, playbooks and interviews from student builders across India." />
      <Section>
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
      </Section>
    </>
  );
}
