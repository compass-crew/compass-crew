import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Calendar, BookOpen, Newspaper, GraduationCap, Sparkles, Github, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  listAnnouncements,
  listBlogPosts,
  listEvents,
  listResources,
  listCareers,
} from "@/lib/public-cms";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Compass Crew" },
      { name: "description", content: "A student-led community of builders in AI, tech and startups across India — announcements, events, resources and campus ambassadors." },
      { property: "og:title", content: "Community — Compass Crew" },
      { property: "og:description", content: "Student builders across India." },
    ],
    links: [{ rel: "canonical", href: "/community" }],
  }),
  component: CommunityPage,
});

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/compasscrew" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/compasscrew" },
  { icon: Github, label: "GitHub", href: "https://github.com/compasscrew" },
];

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CommunityPage() {
  const announcements = useQuery({ queryKey: ["site-announcements"], queryFn: () => listAnnouncements(5) });
  const blogs = useQuery({ queryKey: ["blog-posts"], queryFn: listBlogPosts });
  const events = useQuery({ queryKey: ["site-events"], queryFn: listEvents });
  const resources = useQuery({ queryKey: ["resources"], queryFn: listResources });
  const careers = useQuery({ queryKey: ["careers"], queryFn: listCareers });

  const upcomingEvents = (events.data ?? []).filter((e) => !e.starts_at || new Date(e.starts_at).getTime() >= Date.now()).slice(0, 3);
  const featuredBlogs = (blogs.data ?? []).slice(0, 3);
  const featuredResources = (resources.data ?? []).slice(0, 3);
  const opportunities = (careers.data ?? []).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title={<>A crew of <span className="text-gradient-brand">builders across India.</span></>}
        description="Students shipping in AI, product, design and engineering — connected across campuses."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/contact">Apply to join</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/partner">Start a chapter</Link>
        </Button>
      </PageHeader>

      {/* Announcements */}
      <Section>
        <SectionHeading eyebrow="Announcements" title="What's happening" />
        <div className="mt-8">
          {announcements.data && announcements.data.length > 0 ? (
            <div className="grid gap-3">
              {announcements.data.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {a.pinned && <Badge className="bg-gradient-brand text-white">Pinned</Badge>}
                        <p className="font-display font-semibold">{a.title}</p>
                      </div>
                      {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                      {a.published_at && <p className="mt-2 text-xs text-muted-foreground">{fmtDate(a.published_at)}</p>}
                    </div>
                    {a.link_url && (
                      <Button asChild size="sm" variant="outline">
                        <a href={a.link_url} target="_blank" rel="noreferrer">{a.link_label ?? "Read more"} <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={Megaphone} title="No announcements yet." description="Fresh community updates will appear here." />
          )}
        </div>
      </Section>

      {/* Featured events */}
      <Section className="border-t border-border bg-muted/30">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Events" title="Featured events" />
          <Button asChild variant="ghost" size="sm"><Link to="/events">View all →</Link></Button>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {upcomingEvents.map((e) => (
              <Card key={e.id}>
                <CardContent className="space-y-3 p-6">
                  <Badge variant="secondary" className="capitalize">{e.kind}</Badge>
                  <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                  {e.description && <p className="line-clamp-2 text-sm text-muted-foreground">{e.description}</p>}
                  {e.starts_at && <p className="text-xs text-muted-foreground"><Calendar className="mr-1 inline h-3.5 w-3.5" />{new Date(e.starts_at).toLocaleDateString()}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-8"><EmptyState icon={Calendar} title="No upcoming events." /></div>
        )}
      </Section>

      {/* Featured blog + resources */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-end justify-between">
              <SectionHeading eyebrow="Blog" title="Featured stories" />
              <Button asChild variant="ghost" size="sm"><Link to="/blog">View all →</Link></Button>
            </div>
            {featuredBlogs.length > 0 ? (
              <div className="mt-6 space-y-4">
                {featuredBlogs.map((p) => (
                  <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="block">
                    <Card><CardContent className="p-5">
                      <p className="font-display font-semibold">{p.title}</p>
                      {p.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6"><EmptyState icon={Newspaper} title="Stories coming soon." /></div>
            )}
          </div>
          <div>
            <div className="flex items-end justify-between">
              <SectionHeading eyebrow="Resources" title="Featured resources" />
              <Button asChild variant="ghost" size="sm"><Link to="/resources">View all →</Link></Button>
            </div>
            {featuredResources.length > 0 ? (
              <div className="mt-6 space-y-4">
                {featuredResources.map((r) => (
                  <Card key={r.id}><CardContent className="p-5">
                    <p className="font-display font-semibold">{r.title}</p>
                    {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-primary">Open →</a>}
                  </CardContent></Card>
                ))}
              </div>
            ) : (
              <div className="mt-6"><EmptyState icon={BookOpen} title="Resources coming soon." /></div>
            )}
          </div>
        </div>
      </Section>

      {/* Campus Ambassador */}
      <Section className="border-t border-border bg-muted/30">
        <Card className="overflow-hidden border-primary/40">
          <CardContent className="grid gap-8 p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <GraduationCap className="h-3.5 w-3.5" /> Program
              </span>
              <h3 className="mt-4 font-display text-3xl font-semibold">Become a Campus Ambassador</h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Lead Compass Crew at your campus — run meetups, host workshops and open opportunities for your peers.
                Earn points, tier badges and exclusive perks.
              </p>
            </div>
            <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
              <Link to="/contact">Apply now</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>

      {/* Latest opportunities */}
      <Section>
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Opportunities" title="Latest openings" />
          <Button asChild variant="ghost" size="sm"><Link to="/careers">View all →</Link></Button>
        </div>
        {opportunities.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {opportunities.map((c) => (
              <Card key={c.id}><CardContent className="p-5">
                <Badge variant="secondary" className="capitalize">{c.category.replace("_", " ")}</Badge>
                <p className="mt-2 font-display font-semibold">{c.title}</p>
                {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
                {c.apply_url && <a href={c.apply_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-primary">Apply →</a>}
              </CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="mt-8"><EmptyState icon={Sparkles} title="No openings currently available." description="Check back soon for new opportunities." /></div>
        )}
      </Section>

      {/* Socials + join */}
      <Section className="border-t border-border bg-muted/30">
        <SectionHeading eyebrow="Join us" title="Find us on social" align="center" />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:border-primary/40">
              <s.icon className="h-4 w-4" /> {s.label}
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
