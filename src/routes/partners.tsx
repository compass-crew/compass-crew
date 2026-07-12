import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Handshake, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listPartners } from "@/lib/public-cms";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Compass Crew" },
      { name: "description", content: "Academic, community, media and technology partners powering Compass Crew programs." },
      { property: "og:title", content: "Partners — Compass Crew" },
      { property: "og:description", content: "The organizations powering Compass Crew." },
    ],
    links: [{ rel: "canonical", href: "/partners" }],
  }),
  component: PartnersPage,
});

const KIND_ORDER = ["academic", "technology", "ecosystem", "community", "media"] as const;
const KIND_LABEL: Record<string, string> = {
  academic: "Academic Partners",
  technology: "Technology Partners",
  ecosystem: "Ecosystem Partners",
  community: "Community Partners",
  media: "Media Partners",
};

function PartnersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["partners"], queryFn: listPartners });
  const partners = data ?? [];
  const grouped = KIND_ORDER.map((k) => ({ kind: k, items: partners.filter((p) => p.kind === k) })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Powered by an ecosystem."
        description="The academic, community, media and technology partners we work with to build for student builders across India."
      >
        <Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/partner">Partner with us</Link></Button>
      </PageHeader>
      <Section>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : partners.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="No partners announced yet."
            description="We'll announce our founding partners here soon."
            action={<Button asChild variant="outline"><Link to="/partner">Become a partner</Link></Button>}
          />
        ) : (
          <div className="space-y-12">
            {grouped.map((g) => (
              <div key={g.kind}>
                <h2 className="mb-6 font-display text-xl font-semibold">{KIND_LABEL[g.kind]}</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {g.items.map((p) => (
                    <a
                      key={p.id}
                      href={p.url ?? "#"}
                      target={p.url ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-elegant"
                    >
                      <div className="flex items-center gap-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain" loading="lazy" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 font-display font-bold text-primary">{p.name.charAt(0)}</span>
                        )}
                        <p className="font-display font-semibold">{p.name}</p>
                        {p.url && <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />}
                      </div>
                      {p.blurb && <p className="text-sm text-muted-foreground">{p.blurb}</p>}
                      <Badge variant="secondary" className="w-fit capitalize">{p.kind}</Badge>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
