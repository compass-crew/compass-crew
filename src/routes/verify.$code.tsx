import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, ShieldAlert, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getCertificateByCode, CERT_TYPE_LABEL, certPdfUrl } from "@/lib/certificates";

export const Route = createFileRoute("/verify/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify certificate ${params.code} — Compass Crew` },
      { name: "description", content: "Verify a Compass Crew certificate." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { code } = Route.useParams();
  const certQ = useQuery({
    queryKey: ["cert", code],
    queryFn: () => getCertificateByCode(code),
  });
  const hack = certQ.data
    ? { title: certQ.data.hackathon_title, slug: certQ.data.hackathon_slug }
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Certificate verification"
        title={certQ.data ? "Verified ✓" : certQ.isLoading ? "Checking…" : "Not found"}
        description={`Certificate ID: ${code}`}
      />
      <Section>
        {certQ.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !certQ.data ? (
          <EmptyState
            icon={ShieldAlert}
            title="Invalid or revoked certificate"
            description="No Compass Crew certificate exists with this code. Double-check the ID or QR you scanned."
          />
        ) : (
          <Card className="mx-auto max-w-2xl border-primary/40">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <Badge variant="secondary">Verified</Badge>
                  <p className="mt-1 text-sm text-muted-foreground">Authentic Compass Crew certificate</p>
                </div>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient</dt>
                  <dd className="mt-0.5 font-display text-lg font-semibold">{certQ.data.recipient_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</dt>
                  <dd className="mt-0.5">{CERT_TYPE_LABEL[certQ.data.type]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hackathon</dt>
                  <dd className="mt-0.5">{hack?.title ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issued</dt>
                  <dd className="mt-0.5">{new Date(certQ.data.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Achievement</dt>
                  <dd className="mt-0.5 text-sm">{certQ.data.subtitle}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificate ID</dt>
                  <dd className="mt-0.5 font-mono text-sm">{certQ.data.code}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild>
                  <a href={certPdfUrl(certQ.data.code)} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> View PDF
                  </a>
                </Button>
                {hack?.slug && (
                  <Button asChild variant="outline">
                    <a href={`/hackathons/${hack.slug}`}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Hackathon
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </Section>
    </>
  );
}
