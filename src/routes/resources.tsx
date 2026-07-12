import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { BookOpen, Search, ExternalLink, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { listResources } from "@/lib/public-cms";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Compass Crew" },
      { name: "description", content: "Guides, starter kits, videos and templates curated for student builders in India." },
      { property: "og:title", content: "Resources — Compass Crew" },
      { property: "og:description", content: "Guides, starter kits and templates for student builders." },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["resources"], queryFn: listResources });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const items = data ?? [];
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
        eyebrow="Resources"
        title="Everything you need. In one place."
        description="Handbooks, starter kits, videos and templates — curated for Indian student builders."
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Resources coming soon."
            description="Our team is curating the first set of handbooks and starter kits. Check back shortly."
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search resources…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search resources" />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCat(null)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${!cat ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>All</button>
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={Search} title="Nothing matches." description="Try a different keyword or clear filters." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => (
                  <Card key={r.id} className="group flex h-full flex-col transition hover:-translate-y-0.5 hover:shadow-elegant">
                    {r.cover_url && (
                      <div className="h-32 overflow-hidden rounded-t-lg bg-muted">
                        <img src={r.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="flex flex-1 flex-col space-y-3 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.category && <Badge variant="secondary">{r.category}</Badge>}
                        {r.tags?.slice(0, 2).map((t: string) => <Badge key={t} variant="outline">#{t}</Badge>)}
                      </div>
                      <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                      {r.description && <p className="flex-1 text-sm text-muted-foreground">{r.description}</p>}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Open <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {r.download_url && (
                          <a href={r.download_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Download <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
