import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Plus, Compass, X, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HackathonCard } from "@/components/hackathon-card";
import { listPublicHackathons, type Hackathon, type HackathonMode } from "@/lib/hackathons";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/hackathons")({
  beforeLoad: requireAuth({ requireOnboarding: false }),
  head: () => ({
    meta: [
      { title: "Hackathons — Compass Crew" },
      {
        name: "description",
        content:
          "Browse live, upcoming and past hackathons run by the Compass Crew community across India.",
      },
      { property: "og:title", content: "Hackathons — Compass Crew" },
      {
        property: "og:description",
        content: "Flagship hackathons, weekend sprints and campus seasons across India.",
      },
    ],
  }),
  component: HackathonsPage,
});

type StatusFilter = "all" | "live" | "upcoming" | "past";
type ModeFilter = "all" | HackathonMode;
type SortOrder = "soonest" | "newest" | "featured";

const STATUS_TABS: { key: StatusFilter; label: string; hint: string }[] = [
  { key: "all", label: "All", hint: "Every hackathon" },
  { key: "live", label: "Live", hint: "Registrations open or ongoing" },
  { key: "upcoming", label: "Upcoming", hint: "Announced, not yet open" },
  { key: "past", label: "Past", hint: "Completed & archived" },
];

function bucketOf(h: Hackathon): Exclude<StatusFilter, "all"> {
  if (h.status === "registrations_open" || h.status === "ongoing") return "live";
  if (h.status === "published") return "upcoming";
  return "past";
}

function HackathonsPage() {
  const { hasAnyRole } = useAuth();
  const canCreate = hasAnyRole(["organizer", "super_admin"]);

  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["hackathons", "public"],
    queryFn: listPublicHackathons,
  });

  const [status, setStatus] = useState<StatusFilter>("all");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("soonest");
  const [query, setQuery] = useState("");

  const all = useMemo(() => hackathons ?? [], [hackathons]);

  // Counts per bucket for the segmented control
  const counts = useMemo(() => {
    const c = { all: all.length, live: 0, upcoming: 0, past: 0 };
    for (const h of all) c[bucketOf(h)] += 1;
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = all.filter((h) => {
      if (status !== "all" && bucketOf(h) !== status) return false;
      if (mode !== "all" && h.mode !== mode) return false;
      if (q) {
        const hay =
          `${h.title} ${h.tagline ?? ""} ${h.theme ?? ""} ${h.location ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "featured") {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      }
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // soonest (default): future dates ascending, undated last
      const at = a.starts_at ? new Date(a.starts_at).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.starts_at ? new Date(b.starts_at).getTime() : Number.POSITIVE_INFINITY;
      return at - bt;
    });
    return rows;
  }, [all, status, mode, sort, query]);

  const hasFilters = status !== "all" || mode !== "all" || query.trim() !== "";

  return (
    <>
      <PageHeader
        eyebrow="Hackathons"
        title={
          <>
            Build in a weekend. <span className="text-gradient-brand">Ship in a season.</span>
          </>
        }
        description="From short-form sprints to multi-week campus seasons — our hackathons pair students with mentors, real users and opportunities worth chasing."
      >
        {canCreate ? (
          <Button
            asChild
            size="lg"
            className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
          >
            <Link to="/organizer/hackathons/new">
              <Plus className="mr-1.5 h-4 w-4" /> Create hackathon
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
          >
            <Link to="/dashboard">My dashboard</Link>
          </Button>
        )}
        <Button asChild size="lg" variant="outline" className="h-11 rounded-lg border-border/70">
          <Link to="/sponsors">Sponsor a hackathon</Link>
        </Button>
      </PageHeader>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Segmented tabs */}
            <div
              role="tablist"
              aria-label="Filter hackathons by status"
              className="-mx-1 flex snap-x snap-mandatory items-center gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-1 backdrop-blur lg:mx-0"
            >
              {STATUS_TABS.map((t) => {
                const active = status === t.key;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active}
                    title={t.hint}
                    onClick={() => setStatus(t.key)}
                    className={cn(
                      "relative inline-flex shrink-0 snap-start items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition",
                      active
                        ? "bg-foreground text-background shadow-elegant"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {t.key === "live" && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    {t.label}
                    <span
                      className={cn(
                        "ml-0.5 rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums",
                        active
                          ? "bg-background/20 text-background"
                          : "bg-muted/70 text-muted-foreground",
                      )}
                    >
                      {counts[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search + Mode + Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hackathons…"
                  aria-label="Search hackathons"
                  className="h-9 pl-9 pr-9"
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Select value={mode} onValueChange={(v) => setMode(v as ModeFilter)}>
                <SelectTrigger className="h-9 w-[130px]" aria-label="Filter by mode">
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="in_person">In-person</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
                <SelectTrigger className="h-9 w-[140px]" aria-label="Sort hackathons">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soonest">Soonest</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="featured">Featured first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Section density="compact">
        {/* Result meta */}
        <div className="mb-6 flex items-center justify-between text-[13px] text-muted-foreground">
          <p>
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-32 align-middle" />
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "hackathon" : "hackathons"}
                {hasFilters && all.length > filtered.length && (
                  <>
                    {" "}
                    of <span className="tabular-nums">{all.length}</span>
                  </>
                )}
              </>
            )}
          </p>
          {hasFilters && !isLoading && (
            <button
              onClick={() => {
                setStatus("all");
                setMode("all");
                setQuery("");
              }}
              className="text-[13px] font-medium text-primary transition hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          hasFilters ? (
            <EmptyState
              title="No hackathons match your filters"
              body="Try broadening the status, mode or clearing your search."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus("all");
                    setMode("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No hackathons announced yet"
              body="We're planning the next season. Join the community and we'll notify you the moment registrations open."
              action={
                <Button asChild className="btn-premium hover:btn-premium-hover text-white">
                  <Link to="/community">Join community</Link>
                </Button>
              }
            />
          )
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => (
              <HackathonCard key={h.id} h={h} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-border/70">
          <Skeleton className="h-36 w-full rounded-none" />
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3.5 w-full" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center backdrop-blur sm:p-8">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-4 w-4" />
      </span>
      <h3 className="mt-3.5 font-display text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
