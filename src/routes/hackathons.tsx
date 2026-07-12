import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
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

function HackathonsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hackathons"
        title={<>Build in a weekend. <span className="text-gradient-brand">Ship in a season.</span></>}
        description="From short-form sprints to multi-week campus seasons — our hackathons pair students with mentors, real users and opportunities worth chasing."
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
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {h.status}
                    </div>
                    <div className="border-t border-border pt-4">
                      <Button asChild className="w-full bg-gradient-brand text-white hover:opacity-90">
                        <Link to="/community">Register interest</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold">Recap coming soon</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  We'll publish recaps, winners and highlights from our hackathons here as soon as the first season wraps.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
