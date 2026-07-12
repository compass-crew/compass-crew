import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HACKATHONS } from "@/data/site";

export const Route = createFileRoute("/hackathons")({
  head: () => ({
    meta: [
      { title: "Hackathons — Compass Crew" },
      { name: "description", content: "Flagship hackathons, weekend sprints and campus seasons — build, ship and win with the Compass Crew community." },
      { property: "og:title", content: "Hackathons — Compass Crew" },
      { property: "og:description", content: "Flagship hackathons, weekend sprints and campus seasons across India." },
    ],
  }),
  component: HackathonsPage,
});

const PAST = [
  { title: "BuildHack 2025", date: "Feb 2025", winners: "Team Notedeck", stat: "1,200 hackers" },
  { title: "AI Frontier 2025", date: "Aug 2025", winners: "Team Reagent", stat: "600 hackers" },
  { title: "Campus Cup 2025", date: "May 2025", winners: "IIT Delhi", stat: "12 campuses" },
];

function HackathonsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hackathons"
        title={<>Build in a weekend. <span className="text-gradient-brand">Ship in a season.</span></>}
        description="From 48-hour sprints to multi-week campus seasons — our hackathons pair students with mentors, real users and prizes worth chasing."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/community">Register interest</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/partner">Sponsor a hackathon</Link>
        </Button>
      </PageHeader>

      <Section>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past hackathons</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {HACKATHONS.map((h) => (
                <Card key={h.slug} className="overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${h.color} relative`}>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">{h.tag}</Badge>
                  </div>
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{h.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{h.theme}</p>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><Calendar className="h-4 w-4" />{h.date}</li>
                      <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{h.location}</li>
                      <li className="flex items-center gap-2"><Trophy className="h-4 w-4" />{h.prize}</li>
                    </ul>
                    <div className="border-t border-border pt-4">
                      <Button className="w-full bg-gradient-brand text-white hover:opacity-90">Register</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            <div className="grid gap-6 md:grid-cols-3">
              {PAST.map((p) => (
                <Card key={p.title}>
                  <CardContent className="space-y-3 p-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.date}</p>
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" />{p.stat}</p>
                    <p className="text-sm">Winner: <span className="font-medium">{p.winners}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
