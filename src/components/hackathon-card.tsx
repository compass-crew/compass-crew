import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users, Trophy, ArrowUpRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDateRange,
  HACKATHON_MODE_LABEL,
  HACKATHON_STATUS_LABEL,
  type Hackathon,
} from "@/lib/hackathons";

/**
 * Status tone → semantic pill.
 * Live states get a pulsing dot to communicate urgency at a glance.
 */
const STATUS_TONE: Record<
  Hackathon["status"],
  { chip: string; dot: string; pulse: boolean }
> = {
  draft: { chip: "bg-muted/70 text-muted-foreground ring-border/60", dot: "bg-muted-foreground/60", pulse: false },
  published: { chip: "bg-primary/10 text-primary ring-primary/25", dot: "bg-primary", pulse: false },
  registrations_open: {
    chip: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
    dot: "bg-emerald-500",
    pulse: true,
  },
  ongoing: {
    chip: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
    dot: "bg-amber-500",
    pulse: true,
  },
  judging: {
    chip: "bg-purple-500/12 text-purple-600 ring-purple-500/25 dark:text-purple-400",
    dot: "bg-purple-500",
    pulse: false,
  },
  completed: {
    chip: "bg-blue-500/10 text-blue-600 ring-blue-500/25 dark:text-blue-400",
    dot: "bg-blue-500",
    pulse: false,
  },
  archived: { chip: "bg-muted/70 text-muted-foreground ring-border/60", dot: "bg-muted-foreground/60", pulse: false },
};

function prizeSummary(prizes: unknown): string | null {
  if (!Array.isArray(prizes) || prizes.length === 0) return null;
  return prizes.length === 1 ? "1 prize tier" : `${prizes.length} prize tiers`;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function HackathonCard({ h }: { h: Hackathon }) {
  const tone = STATUS_TONE[h.status];
  const prize = prizeSummary(h.prizes);
  const isLive = h.status === "registrations_open" || h.status === "ongoing";
  const closesIn = h.status === "registrations_open" ? daysUntil(h.registration_closes_at) : null;
  const startsIn = h.status === "published" ? daysUntil(h.starts_at) : null;

  return (
    <Card
      className="group relative flex h-full flex-col overflow-hidden border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant focus-within:border-primary/40"
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        {h.banner_url ? (
          <>
            <img
              src={h.banner_url}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          </>
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-gradient-brand" />
            <div aria-hidden className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </>
        )}

        {/* Status pill */}
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset backdrop-blur-md ${tone.chip}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {tone.pulse && (
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${tone.dot}`} />
            )}
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          </span>
          {HACKATHON_STATUS_LABEL[h.status]}
        </span>

        {h.is_featured && (
          <Badge className="absolute right-4 top-4 border-white/25 bg-white/15 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white shadow-elegant backdrop-blur-md">
            <Sparkles className="mr-1 h-3 w-3" /> Featured
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="font-display text-[19px] font-semibold leading-snug tracking-tight">
            {h.title}
          </h3>
          {h.tagline && (
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {h.tagline}
            </p>
          )}
        </div>

        {/* Meta list */}
        <ul className="grid gap-2.5 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
            <span className="truncate">{formatDateRange(h.starts_at, h.ends_at)}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
            <span className="truncate">
              {HACKATHON_MODE_LABEL[h.mode]}
              {h.location ? ` · ${h.location}` : ""}
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
            <span className="truncate">
              Teams of {h.min_team_size}–{h.max_team_size}
            </span>
          </li>
          {prize && (
            <li className="flex items-center gap-2.5">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
              <span className="truncate">{prize}</span>
            </li>
          )}
        </ul>

        {/* Urgency banner */}
        {(closesIn !== null && closesIn >= 0) || (startsIn !== null && startsIn >= 0) ? (
          <div
            className={`rounded-lg border border-dashed px-3 py-2 text-[12.5px] font-medium ${
              closesIn !== null && closesIn <= 7
                ? "border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-amber-400"
                : "border-border/70 bg-muted/40 text-foreground/80"
            }`}
          >
            {closesIn !== null ? (
              <>
                {closesIn === 0
                  ? "Registrations close today"
                  : closesIn === 1
                    ? "Registrations close tomorrow"
                    : `Registrations close in ${closesIn} days`}
              </>
            ) : (
              <>
                {startsIn === 0
                  ? "Kicks off today"
                  : startsIn === 1
                    ? "Kicks off tomorrow"
                    : `Kicks off in ${startsIn} days`}
              </>
            )}
          </div>
        ) : null}

        {/* CTA — full-width block link for a bigger tap target and keyboard target */}
        <div className="mt-auto pt-1">
          <Link
            to="/hackathons/$slug"
            params={{ slug: h.slug }}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              isLive
                ? "btn-premium hover:btn-premium-hover text-white"
                : "border border-border/70 bg-background text-foreground hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            {isLive ? "Register now" : "View details"}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
