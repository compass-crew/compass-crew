import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { BookOpen, Search, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { listBlogPosts, type BlogPost } from "@/lib/public-cms";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Compass Crew" },
      { name: "description", content: "Reports, playbooks and stories from India's student builder community." },
      { property: "og:title", content: "Blog — Compass Crew" },
      { property: "og:description", content: "Reports, playbooks and interviews from student builders." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function BlogCard({ p, featured = false }: { p: BlogPost; featured?: boolean }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elegant">
        <div className={`${featured ? "h-56" : "h-40"} relative overflow-hidden bg-gradient-brand`}>
          {p.cover_url ? (
            <img src={p.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-grid opacity-30" />
          )}
          {p.category && (
            <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">
              {p.category}
            </Badge>
          )}
          {p.featured && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
              <Star className="h-3 w-3" /> Featured
            </span>
          )}
        </div>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {p.published_at && <span>{fmtDate(p.published_at)}</span>}
            {p.reading_minutes ? (<><span>·</span><span>{p.reading_minutes} min read</span></>) : null}
          </div>
          <h3 className={`font-display font-semibold leading-snug ${featured ? "text-2xl" : "text-lg"}`}>{p.title}</h3>
          {p.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
          {p.author_name && <p className="pt-2 text-xs font-medium text-foreground/80">By {p.author_name}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function BlogPage() {
  const { data, isLoading } = useQuery({ queryKey: ["blog-posts"], queryFn: listBlogPosts });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const posts = data ?? [];
  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => !!c))),
    [posts],
  );
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        (p.excerpt ?? "").toLowerCase().includes(query) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [posts, q, cat]);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Stories from the crew."
        description="Reports, playbooks and interviews from student builders across India."
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Writing coming soon."
            description="We're preparing our first reports, playbooks and interviews. Join the community to get them in your inbox first."
            action={
              <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/community">Join the crew</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search posts, tags…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search posts"
                />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCat(null)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${!cat ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={Search} title="No posts match your search." description="Try a different keyword or clear filters." />
            ) : (
              <>
                {featured && (
                  <div className="mb-10">
                    <BlogCard p={featured} featured />
                  </div>
                )}
                {rest.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p) => <BlogCard key={p.id} p={p} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Section>
    </>
  );
}
