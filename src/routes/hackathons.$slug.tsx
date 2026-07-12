import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Compass,
  ScrollText,
  HelpCircle,
  Award,
  Play,
  Timer,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  getHackathonBySlug,
  listHackathonTracks,
  listScoringCriteria,
  registerForHackathon,
  formatDateRange,
  HACKATHON_MODE_LABEL,
  HACKATHON_STATUS_LABEL,
  type Hackathon,
} from "@/lib/hackathons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hackathons/$slug")({
  component: HackathonDetail,
});

/* ----------------------------- helpers ----------------------------- */

const STATUS_TONE: Record<
  Hackathon["status"],
  { chip: string; dot: string; pulse: boolean }
> = {
  draft: { chip: "bg-muted/70 text-muted-foreground ring-border/60", dot: "bg-muted-foreground/60", pulse: false },
  published: { chip: "bg-primary/15 text-primary ring-primary/25", dot: "bg-primary", pulse: false },
  registrations_open: {
    chip: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
    pulse: true,
  },
  ongoing: {
    chip: "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-400",
    dot: "bg-amber-500",
    pulse: true,
  },
  judging: {
    chip: "bg-purple-500/15 text-purple-600 ring-purple-500/30 dark:text-purple-400",
    dot: "bg-purple-500",
    pulse: false,
  },
  completed: {
    chip: "bg-blue-500/15 text-blue-600 ring-blue-500/30 dark:text-blue-400",
    dot: "bg-blue-500",
    pulse: false,
  },
  archived: { chip: "bg-muted/70 text-muted-foreground ring-border/60", dot: "bg-muted-foreground/60", pulse: false },
};

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function useCountdown(iso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [iso]);
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, past: true };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes, past: false };
}

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "tracks", label: "Tracks", icon: Flag },
  { id: "prizes", label: "Prizes", icon: Trophy },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "rules", label: "Rules", icon: ScrollText },
  { id: "judging", label: "Judging", icon: Award },
  { id: "sponsors", label: "Sponsors", icon: Handshake },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
] as const;

/* ----------------------------- component ----------------------------- */

function HackathonDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: h, isLoading } = useQuery({
    queryKey: ["hackathon", slug],
    queryFn: () => getHackathonBySlug(slug),
  });

  const { data: tracks } = useQuery({
    queryKey: ["hackathon", slug, "tracks"],
    queryFn: () => (h ? listHackathonTracks(h.id) : Promise.resolve([])),
    enabled: !!h,
  });

  const { data: criteria } = useQuery({
    queryKey: ["hackathon", slug, "criteria"],
    queryFn: () => (h ? listScoringCriteria(h.id) : Promise.resolve([])),
    enabled: !!h,
  });

  const { data: myReg } = useQuery({
    queryKey: ["hackathon", slug, "myReg", user?.id],
    queryFn: async () => {
      if (!h || !user) return null;
      const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("hackathon_id", h.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!h && !!user,
  });

  const register = useMutation({
    mutationFn: async () => {
      if (!h || !user) throw new Error("Sign in required");
      return registerForHackathon(h.id, user.id);
    },
    onSuccess: () => {
      toast.success("You're registered!");
      qc.invalidateQueries({ queryKey: ["hackathon", slug, "myReg"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not register"),
  });

  /* Section scroll spy */
  const [activeSection, setActiveSection] = useState<string>("overview");
  useEffect(() => {
    if (!h) return;
    const observers: IntersectionObserver[] = [];
    const cb = (entries: IntersectionObserverEntry[]) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length === 0) return;
      const top = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
      setActiveSection((top.target as HTMLElement).id);
    };
    const io = new IntersectionObserver(cb, { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] });
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    observers.push(io);
    return () => observers.forEach((o) => o.disconnect());
  }, [h]);

  /* Bookmark — local-only, purely presentational */
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    if (!h) return;
    try {
      const raw = localStorage.getItem("cc:bookmarked-hackathons");
      const list: string[] = raw ? JSON.parse(raw) : [];
      setBookmarked(list.includes(h.id));
    } catch {
      /* ignore */
    }
  }, [h]);
  const toggleBookmark = () => {
    if (!h) return;
    try {
      const raw = localStorage.getItem("cc:bookmarked-hackathons");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = list.includes(h.id) ? list.filter((x) => x !== h.id) : [...list, h.id];
      localStorage.setItem("cc:bookmarked-hackathons", JSON.stringify(next));
      setBookmarked(next.includes(h.id));
      toast.success(next.includes(h.id) ? "Bookmarked" : "Removed bookmark");
    } catch {
      /* ignore */
    }
  };

  const shareHackathon = async () => {
    if (!h) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: h.title, text: h.tagline ?? h.title, url });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  /* Loading */
  if (isLoading) return <DetailSkeleton />;

  if (!h) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center backdrop-blur">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">Hackathon not found</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            This hackathon may have been unpublished or the link is incorrect.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/hackathons">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to hackathons
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <DetailLoaded {...{ h, tracks, criteria, myReg, register, user, router, slug, activeSection, bookmarked, toggleBookmark, shareHackathon }} />;
}

/* Split into inner component so hooks that depend on `h` are unconditional. */
function DetailLoaded({
  h,
  tracks,
  criteria,
  myReg,
  register,
  user,
  router,
  slug,
  activeSection,
  bookmarked,
  toggleBookmark,
  shareHackathon,
}: {
  h: Hackathon;
  tracks: Awaited<ReturnType<typeof listHackathonTracks>> | undefined;
  criteria: Awaited<ReturnType<typeof listScoringCriteria>> | undefined;
  myReg: { id: string; status: string } | null | undefined;
  register: ReturnType<typeof useMutation<unknown, Error, void>>;
  user: ReturnType<typeof useAuth>["user"];
  router: ReturnType<typeof useRouter>;
  slug: string;
  activeSection: string;
  bookmarked: boolean;
  toggleBookmark: () => void;
  shareHackathon: () => void;
}) {
  const tone = STATUS_TONE[h.status];
  const prizes = Array.isArray(h.prizes) ? (h.prizes as Record<string, unknown>[]) : [];
  const faqs = Array.isArray(h.faqs) ? (h.faqs as Record<string, unknown>[]) : [];
  const sponsors = Array.isArray(h.sponsors_content)
    ? (h.sponsors_content as Record<string, unknown>[])
    : [];
  const canRegister = ["published", "registrations_open"].includes(h.status);
  const registered = !!myReg;

  const countdownTarget =
    h.status === "registrations_open"
      ? h.registration_closes_at
      : h.status === "published"
        ? h.starts_at
        : h.status === "ongoing"
          ? h.submission_deadline ?? h.ends_at
          : null;
  const countdownLabel =
    h.status === "registrations_open"
      ? "Registrations close in"
      : h.status === "published"
        ? "Kicks off in"
        : h.status === "ongoing"
          ? "Submissions close in"
          : "";
  const countdown = useCountdown(countdownTarget);

  const timeline = useMemo(() => {
    const items: { key: string; label: string; iso: string | null; icon: React.ComponentType<{ className?: string }> }[] = [
      { key: "reg_opens", label: "Registrations open", iso: h.registration_opens_at, icon: Play },
      { key: "reg_closes", label: "Registrations close", iso: h.registration_closes_at, icon: Timer },
      { key: "kickoff", label: "Kick-off", iso: h.starts_at, icon: Flag },
      { key: "submissions", label: "Submission deadline", iso: h.submission_deadline, icon: ScrollText },
      { key: "ends", label: "Hacking ends", iso: h.ends_at, icon: CheckCircle2 },
      { key: "results", label: "Results announced", iso: h.results_at, icon: Award },
    ];
    return items.filter((i) => !!i.iso);
  }, [h]);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-border">
        {h.banner_url ? (
          <>
            <img
              src={h.banner_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
            <div aria-hidden className="absolute inset-0 bg-grid opacity-10" />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-gradient-brand" />
            <div aria-hidden className="absolute inset-0 bg-grid opacity-20 mix-blend-overlay" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </>
        )}

        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-16">
          <Link
            to="/hackathons"
            className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-foreground/70 transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All hackathons
          </Link>

          {/* Meta pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset backdrop-blur",
                tone.chip,
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                {tone.pulse && (
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${tone.dot}`} />
                )}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tone.dot}`} />
              </span>
              {HACKATHON_STATUS_LABEL[h.status]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur">
              <MapPin className="h-3 w-3" />
              {HACKATHON_MODE_LABEL[h.mode]}
              {h.location ? ` · ${h.location}` : ""}
            </span>
            {h.theme && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur">
                <Sparkles className="h-3 w-3 text-primary" /> {h.theme}
              </span>
            )}
            {h.is_featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]">
            {h.title}
          </h1>
          {h.tagline && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
              {h.tagline}
            </p>
          )}

          {/* Quick meta strip */}
          <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickMeta icon={Calendar} label="Dates" value={formatDateRange(h.starts_at, h.ends_at)} />
            <QuickMeta icon={Users} label="Team size" value={`${h.min_team_size}–${h.max_team_size}`} />
            <QuickMeta icon={Trophy} label="Prizes" value={prizes.length > 0 ? `${prizes.length} tier${prizes.length > 1 ? "s" : ""}` : "TBA"} />
            <QuickMeta icon={Flag} label="Tracks" value={(tracks?.length ?? 0) > 0 ? String(tracks!.length) : "TBA"} />
          </dl>

          {/* Countdown */}
          {countdown && !countdown.past && countdownLabel && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 backdrop-blur">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Timer className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {countdownLabel}
                </p>
                <div className="mt-0.5 flex items-baseline gap-2 font-display text-xl font-semibold tabular-nums">
                  <span>{countdown.days}<span className="ml-0.5 text-xs font-medium text-muted-foreground">d</span></span>
                  <span>{countdown.hours}<span className="ml-0.5 text-xs font-medium text-muted-foreground">h</span></span>
                  <span>{countdown.minutes}<span className="ml-0.5 text-xs font-medium text-muted-foreground">m</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Primary CTAs — mobile only (desktop uses sidebar) */}
          <div className="mt-8 flex flex-wrap gap-3 lg:hidden">
            <PrimaryCTA
              registered={registered}
              canRegister={canRegister}
              register={register}
              user={user}
              router={router}
              slug={slug}
              hackathonId={h.id}
            />
          </div>
        </div>
      </section>

      {/* ============================ STICKY SECTION NAV ============================ */}
      <div className="sticky top-16 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <nav aria-label="Sections" className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <ul className="-mx-1 flex snap-x snap-mandatory items-center gap-1 overflow-x-auto py-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <li key={id} className="snap-start">
                  <a
                    href={`#${id}`}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition",
                      active
                        ? "bg-foreground text-background shadow-elegant"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ============================ CONTENT ============================ */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:px-8 lg:py-16">
        <main className="min-w-0 space-y-14 scroll-smooth">
          {/* Overview */}
          <Section id="overview" title="Overview">
            <Card className="border-border/70">
              <CardContent className="p-7 sm:p-9">
                {h.description ? (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                    {h.description}
                  </p>
                ) : (
                  <EmptyLine text="Full details coming soon." />
                )}
              </CardContent>
            </Card>
          </Section>

          {/* Tracks */}
          <Section id="tracks" title="Tracks" subtitle="Where your team can compete.">
            {(tracks ?? []).length === 0 ? (
              <EmptyBlock text="Tracks will be announced soon." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(tracks ?? []).map((t, i) => (
                  <Card
                    key={t.id}
                    className="group border-border/70 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
                  >
                    <CardContent className="flex gap-4 p-6">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-mono text-[13px] font-semibold text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-[16px] font-semibold tracking-tight">{t.name}</h3>
                        {t.description && (
                          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Section>

          {/* Prizes */}
          <Section id="prizes" title="Prizes" subtitle="What winning teams take home.">
            {prizes.length === 0 ? (
              <EmptyBlock text="Prizes will be revealed soon." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prizes.map((p, i) => {
                  const rank = i + 1;
                  const emphasis = rank === 1;
                  return (
                    <Card
                      key={i}
                      className={cn(
                        "relative overflow-hidden border-border/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-elegant",
                        emphasis && "border-primary/30",
                      )}
                    >
                      {emphasis && (
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-gradient-brand opacity-20 blur-3xl" />
                      )}
                      <CardContent className="relative p-6">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <Trophy className={cn("h-3.5 w-3.5", emphasis ? "text-primary" : "text-muted-foreground")} />
                          <span>{rank === 1 ? "Grand prize" : rank === 2 ? "Runner-up" : `Prize ${rank}`}</span>
                        </div>
                        <h3 className="mt-3 font-display text-[17px] font-semibold tracking-tight">
                          {(p.title as string) ?? (p.name as string) ?? `Prize ${rank}`}
                        </h3>
                        {(p.amount as string | number | undefined) && (
                          <p className="mt-1 font-display text-2xl font-semibold text-gradient-brand tabular-nums">
                            {p.amount as string}
                          </p>
                        )}
                        {(p.description as string | undefined) && (
                          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                            {p.description as string}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Timeline */}
          <Section id="timeline" title="Timeline" subtitle="Key dates for the event.">
            {timeline.length === 0 ? (
              <EmptyBlock text="Timeline will be published closer to the event." />
            ) : (
              <ol className="relative ml-3 space-y-6 border-l border-border/70 pl-6">
                {timeline.map((t) => (
                  <li key={t.key} className="relative">
                    <span className="absolute -left-[33px] top-1 grid h-6 w-6 place-items-center rounded-full border border-border/70 bg-card text-primary">
                      <t.icon className="h-3 w-3" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {t.label}
                    </p>
                    <p className="mt-1 text-[14.5px] font-medium">{fmtDateTime(t.iso) ?? fmtDate(t.iso)}</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {/* Rules */}
          <Section id="rules" title="Rules & Eligibility">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold tracking-tight">Eligibility</h3>
                  </div>
                  {h.eligibility ? (
                    <p className="mt-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted-foreground">
                      {h.eligibility}
                    </p>
                  ) : (
                    <EmptyLine className="mt-4" text="Details coming soon." />
                  )}
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ScrollText className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-[16px] font-semibold tracking-tight">Rules</h3>
                  </div>
                  {h.rules ? (
                    <p className="mt-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted-foreground">
                      {h.rules}
                    </p>
                  ) : (
                    <EmptyLine className="mt-4" text="Details coming soon." />
                  )}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Judging */}
          <Section id="judging" title="Judging" subtitle="How submissions are evaluated.">
            {(criteria ?? []).length === 0 ? (
              <EmptyBlock text="Judging criteria will be shared before evaluation begins." />
            ) : (
              <Card className="overflow-hidden border-border/70">
                <ul className="divide-y divide-border/70">
                  {(criteria ?? []).map((c) => (
                    <li key={c.id} className="flex items-start justify-between gap-6 p-6">
                      <div className="min-w-0">
                        <h4 className="text-[14.5px] font-semibold tracking-tight">{c.name}</h4>
                        {c.description && (
                          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                            {c.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-lg font-semibold tabular-nums">/{c.max_score}</p>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          weight {Number(c.weight).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </Section>

          {/* Sponsors */}
          <Section id="sponsors" title="Sponsors" subtitle="Partners powering this hackathon.">
            {sponsors.length === 0 ? (
              <EmptyBlock text="Sponsors will be announced soon." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sponsors.map((s, i) => {
                  const name = (s.name as string) ?? (s.title as string) ?? `Sponsor ${i + 1}`;
                  const tier = (s.tier as string) ?? null;
                  const url = (s.url as string) ?? null;
                  const logo = (s.logo_url as string) ?? (s.logo as string) ?? null;
                  const content = (
                    <Card className="h-full border-border/70 transition hover:border-primary/30 hover:shadow-elegant">
                      <CardContent className="flex items-center gap-4 p-5">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg border border-border/70 bg-background object-contain p-1"
                            loading="lazy"
                          />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Handshake className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold tracking-tight">{name}</p>
                          {tier && (
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                              {tier}
                            </p>
                          )}
                        </div>
                        {url && <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      </CardContent>
                    </Card>
                  );
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={i}>{content}</div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* FAQs */}
          <Section id="faqs" title="FAQs">
            {faqs.length === 0 ? (
              <EmptyBlock text="FAQs will be posted soon." />
            ) : (
              <Card className="border-border/70">
                <CardContent className="p-2 sm:p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((f, i) => {
                      const q = (f.q as string) ?? (f.question as string) ?? `Question ${i + 1}`;
                      const a = (f.a as string) ?? (f.answer as string) ?? "";
                      return (
                        <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                          <AccordionTrigger className="text-left text-[14.5px] font-medium hover:no-underline">
                            {q}
                          </AccordionTrigger>
                          <AccordionContent className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted-foreground">
                            {a}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </Section>
        </main>

        {/* ============================ SIDEBAR ============================ */}
        <aside className="mt-12 hidden lg:mt-0 lg:block">
          <div className="sticky top-32 space-y-4">
            {/* Registration card */}
            <Card className="overflow-hidden border-border/70 shadow-elegant">
              <div className="border-b border-border/70 bg-muted/30 px-5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Registration
                </p>
              </div>
              <CardContent className="space-y-4 p-5">
                {registered && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    You're registered
                  </div>
                )}

                <dl className="space-y-3 text-[13px]">
                  <SideRow label="Status" value={HACKATHON_STATUS_LABEL[h.status]} />
                  <SideRow
                    label="Reg. closes"
                    value={fmtDate(h.registration_closes_at) ?? "TBA"}
                    emphasis={h.status === "registrations_open"}
                  />
                  <SideRow label="Kick-off" value={fmtDate(h.starts_at) ?? "TBA"} />
                  <SideRow label="Team size" value={`${h.min_team_size}–${h.max_team_size}`} />
                  <SideRow label="Mode" value={`${HACKATHON_MODE_LABEL[h.mode]}${h.location ? ` · ${h.location}` : ""}`} />
                </dl>

                <PrimaryCTA
                  registered={registered}
                  canRegister={canRegister}
                  register={register}
                  user={user}
                  router={router}
                  slug={slug}
                  hackathonId={h.id}
                />

                <div className="flex items-center gap-2 border-t border-border/70 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start gap-2"
                    onClick={toggleBookmark}
                    aria-pressed={bookmarked}
                  >
                    {bookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-primary" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" onClick={shareHackathon}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prize summary */}
            {prizes.length > 0 && (
              <Card className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Prize pool
                    </p>
                  </div>
                  <p className="mt-3 font-display text-lg font-semibold tracking-tight">
                    {prizes.length} prize tier{prizes.length > 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    See the full breakdown in the Prizes section.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

/* ----------------------------- primitives ----------------------------- */

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <header className="mb-5">
        <h2 className="font-display text-[22px] font-semibold tracking-tight sm:text-[26px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function QuickMeta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 truncate text-[13.5px] font-semibold">{value}</p>
    </div>
  );
}

function SideRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("truncate text-right font-medium", emphasis && "text-primary")}>{value}</dd>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-4 w-4" />
      </span>
      <p className="mt-3 text-[13.5px] text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyLine({ text, className }: { text: string; className?: string }) {
  return <p className={cn("text-[13.5px] italic text-muted-foreground", className)}>{text}</p>;
}

function PrimaryCTA({
  registered,
  canRegister,
  register,
  user,
  router,
  slug,
  hackathonId,
}: {
  registered: boolean;
  canRegister: boolean;
  register: ReturnType<typeof useMutation<unknown, Error, void>>;
  user: ReturnType<typeof useAuth>["user"];
  router: ReturnType<typeof useRouter>;
  slug: string;
  hackathonId: string;
}) {
  if (registered) {
    return (
      <div className="space-y-2">
        <Button className="h-11 w-full rounded-lg bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400" disabled>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Registered
        </Button>
        <Button asChild variant="outline" className="h-10 w-full rounded-lg border-border/70">
          <Link to="/teams/new" search={{ hackathon: hackathonId }}>
            Create team
          </Link>
        </Button>
      </div>
    );
  }
  if (!user) {
    return (
      <Button
        className="h-11 w-full rounded-lg text-sm font-semibold btn-premium hover:btn-premium-hover text-white"
        onClick={() => router.navigate({ to: "/auth", search: { redirect: `/hackathons/${slug}` } })}
      >
        Sign in to register
      </Button>
    );
  }
  return (
    <Button
      className="h-11 w-full rounded-lg text-sm font-semibold btn-premium hover:btn-premium-hover text-white disabled:opacity-60"
      disabled={!canRegister || register.isPending}
      onClick={() => register.mutate()}
    >
      {register.isPending ? "Registering…" : canRegister ? "Register now" : "Registrations closed"}
    </Button>
  );
}

/* ----------------------------- skeleton ----------------------------- */

function DetailSkeleton() {
  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-32" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-12 w-3/4" />
          <Skeleton className="mt-4 h-5 w-1/2" />
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:px-8">
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="mt-10 hidden lg:mt-0 lg:block">
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    </>
  );
}
