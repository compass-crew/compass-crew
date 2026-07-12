import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Trophy, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getHackathonBySlug,
  listHackathonTracks,
  listScoringCriteria,
  registerForHackathon,
  formatDateRange,
  HACKATHON_MODE_LABEL,
  HACKATHON_STATUS_LABEL,
} from "@/lib/hackathons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/hackathons/$slug")({
  component: HackathonDetail,
});

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

  if (isLoading) return <Section><Skeleton className="h-96 w-full" /></Section>;

  if (!h) {
    return (
      <Section>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-16 text-center">
            <h1 className="font-display text-2xl font-semibold">Hackathon not found</h1>
            <p className="text-sm text-muted-foreground">This hackathon may have been unpublished or the link is incorrect.</p>
            <Button asChild variant="outline">
              <Link to="/hackathons"><ArrowLeft className="mr-2 h-4 w-4" /> Back to hackathons</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    );
  }

  const prizes = Array.isArray(h.prizes) ? h.prizes : [];
  const faqs = Array.isArray(h.faqs) ? h.faqs : [];

  const canRegister = ["published", "registrations_open"].includes(h.status);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-brand">
        <div className="absolute inset-0 bg-grid opacity-20" />
        {h.banner_url && (
          <img src={h.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-white sm:px-6 lg:px-8">
          <Link to="/hackathons" className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All hackathons
          </Link>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">
              {HACKATHON_STATUS_LABEL[h.status]}
            </Badge>
            <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">
              {HACKATHON_MODE_LABEL[h.mode]}
            </Badge>
            {h.theme && (
              <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">{h.theme}</Badge>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{h.title}</h1>
          {h.tagline && <p className="mt-3 max-w-3xl text-lg text-white/90">{h.tagline}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            {myReg ? (
              <>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Registered
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link to="/teams/new" search={{ hackathon: h.id }}>Create team</Link>
                </Button>
              </>
            ) : user ? (
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                disabled={!canRegister || register.isPending}
                onClick={() => register.mutate()}
              >
                {register.isPending ? "Registering…" : canRegister ? "Register now" : "Registrations closed"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => router.navigate({ to: "/auth", search: { redirect: `/hackathons/${slug}` } })}
              >
                Sign in to register
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <a href="#tracks">Explore tracks</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <Section className="!pt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetaCard icon={Calendar} title="Dates" body={formatDateRange(h.starts_at, h.ends_at)} />
          <MetaCard icon={MapPin} title="Mode" body={`${HACKATHON_MODE_LABEL[h.mode]}${h.location ? ` · ${h.location}` : ""}`} />
          <MetaCard icon={Users} title="Team size" body={`${h.min_team_size} – ${h.max_team_size} members`} />
        </div>
      </Section>

      <Section className="!pt-4">
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracks" id="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
            <TabsTrigger value="rules">Rules & Eligibility</TabsTrigger>
            <TabsTrigger value="rubric">Judging</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <Card><CardContent className="prose prose-sm max-w-none p-8 dark:prose-invert">
              {h.description ? (
                <p className="whitespace-pre-wrap text-foreground">{h.description}</p>
              ) : (
                <p className="text-muted-foreground">Full details coming soon.</p>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="tracks" className="mt-8">
            {(tracks ?? []).length === 0 ? (
              <EmptyBlock body="Tracks will be announced soon." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(tracks ?? []).map((t) => (
                  <Card key={t.id}><CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                    {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
                  </CardContent></Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prizes" className="mt-8">
            {prizes.length === 0 ? (
              <EmptyBlock body="Prizes will be revealed soon." />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {prizes.map((p: any, i: number) => (
                  <Card key={i}><CardContent className="p-6">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h3 className="mt-3 font-display text-lg font-semibold">{p.title ?? p.name ?? `Prize ${i + 1}`}</h3>
                    {p.amount && <p className="mt-1 text-xl font-semibold text-gradient-brand">{p.amount}</p>}
                    {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                  </CardContent></Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card><CardContent className="p-6">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h3 className="font-display text-lg font-semibold">Eligibility</h3></div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{h.eligibility || "Details coming soon."}</p>
              </CardContent></Card>
              <Card><CardContent className="p-6">
                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-display text-lg font-semibold">Rules</h3></div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{h.rules || "Details coming soon."}</p>
              </CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="rubric" className="mt-8">
            {(criteria ?? []).length === 0 ? (
              <EmptyBlock body="Judging criteria will be shared before evaluation begins." />
            ) : (
              <Card><CardContent className="divide-y divide-border p-0">
                {(criteria ?? []).map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-6 p-6">
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-mono">/{c.max_score}</p>
                      <p className="text-muted-foreground">weight {Number(c.weight).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="faqs" className="mt-8">
            {faqs.length === 0 ? (
              <EmptyBlock body="FAQs will be posted soon." />
            ) : (
              <div className="space-y-4">
                {faqs.map((f: any, i: number) => (
                  <Card key={i}><CardContent className="p-6">
                    <h4 className="font-semibold">{f.q ?? f.question}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{f.a ?? f.answer}</p>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

function MetaCard({ icon: Icon, title, body }: { icon: typeof Calendar; title: string; body: string }) {
  return (
    <Card><CardContent className="flex items-start gap-4 p-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="mt-1 font-medium">{body}</p>
      </div>
    </CardContent></Card>
  );
}

function EmptyBlock({ body }: { body: string }) {
  return (
    <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">{body}</CardContent></Card>
  );
}
