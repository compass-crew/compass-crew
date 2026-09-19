import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { BookOpen, Search, ExternalLink, Download, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { listResources } from "@/lib/public-cms";
import { safeExternalUrl } from "@/lib/safe-redirect";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Compass Crew" },
      {
        name: "description",
        content:
          "Guides, starter kits, videos and templates curated for student builders in India.",
      },
      { property: "og:title", content: "Resources — Compass Crew" },
      {
        property: "og:description",
        content: "Guides, starter kits and templates for student builders.",
      },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["resources"], queryFn: listResources });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const items = useMemo(() => data ?? [], [data]);

  const categories = useMemo(
    () => Array.from(new Set(items.map((r) => r.category).filter((c): c is string => !!c))),
    [items],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (!query) return true;
      return (
        r.title.toLowerCase().includes(query) ||
        (r.description ?? "").toLowerCase().includes(query) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [items, q, cat]);

  return (
    <>
      <PageHeader
        eyebrow="Resources & Toolkits"
        title="Everything you need. In one place."
        description="Engineering playbooks, starter kits, templates, and hackathon cheat sheets curated for student builders."
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No resources published yet."
            description="Our team is actively curating starter kits, engineering playbooks, and templates. Explore our active hackathons or get in touch."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                  <Link to="/hackathons">Explore Hackathons</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact">Contact Team</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search resources by title or tag…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search resources"
                />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCat(null)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      !cat
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        cat === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nothing matches your criteria."
                description="Try searching with a different keyword or reset the category filters."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQ("");
                      setCat(null);
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => {
                  const safeUrl = safeExternalUrl(r.url);
                  const safeDownload = safeExternalUrl(r.download_url);

                  return (
                    <Card
                      key={r.id}
                      className="group flex h-full flex-col transition hover:-translate-y-0.5 hover:shadow-elegant border-border/60 bg-card/60"
                    >
                      {r.cover_url && (
                        <div className="h-36 overflow-hidden rounded-t-lg bg-muted">
                          <img
                            src={r.cover_url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="flex flex-1 flex-col space-y-3 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {r.category && (
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {r.category}
                            </Badge>
                          )}
                          {r.tags?.slice(0, 2).map((t: string) => (
                            <Badge key={t} variant="outline" className="text-[10px]">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          <Link
                            to="/resources/$slug"
                            params={{ slug: r.slug }}
                            className="hover:text-primary transition-colors"
                          >
                            {r.title}
                          </Link>
                        </h3>
                        {r.description && (
                          <p className="flex-1 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {r.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
                          <Link
                            to="/resources/$slug"
                            params={{ slug: r.slug }}
                            className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
                          >
                            Read Guide <ArrowRight className="h-3 w-3" />
                          </Link>

                          <div className="flex items-center gap-2">
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                Source <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {safeDownload && (
                              <a
                                href={safeDownload}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-emerald-500 hover:underline"
                              >
                                Download <Download className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
