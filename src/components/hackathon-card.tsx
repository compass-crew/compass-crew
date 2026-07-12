import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateRange, HACKATHON_MODE_LABEL, HACKATHON_STATUS_LABEL, type Hackathon } from "@/lib/hackathons";

const STATUS_TONE: Record<Hackathon["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/15 text-primary",
  registrations_open: "bg-emerald-500/15 text-emerald-500",
  ongoing: "bg-amber-500/15 text-amber-500",
  judging: "bg-purple-500/15 text-purple-500",
  completed: "bg-blue-500/15 text-blue-500",
  archived: "bg-muted text-muted-foreground",
};

export function HackathonCard({ h }: { h: Hackathon }) {
  return (
    <Card className="group overflow-hidden transition hover:shadow-elegant">
      <div className="relative h-32 bg-gradient-brand">
        {h.banner_url ? (
          <img src={h.banner_url} alt={h.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-grid opacity-30" />
        )}
        <Badge className={`absolute left-4 top-4 border-none ${STATUS_TONE[h.status]}`}>
          {HACKATHON_STATUS_LABEL[h.status]}
        </Badge>
        {h.is_featured && (
          <Badge className="absolute right-4 top-4 border-white/30 bg-white/20 text-white backdrop-blur">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="font-display text-xl font-semibold leading-tight">{h.title}</h3>
          {h.tagline && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{h.tagline}</p>}
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDateRange(h.starts_at, h.ends_at)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {HACKATHON_MODE_LABEL[h.mode]}
            {h.location ? ` · ${h.location}` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams of {h.min_team_size}–{h.max_team_size}
          </div>
        </div>
        <Button asChild className="w-full bg-gradient-brand text-white hover:opacity-90">
          <Link to="/hackathons/$slug" params={{ slug: h.slug }}>View details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
