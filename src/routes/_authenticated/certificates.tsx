import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { listMyCertificates, CERT_TYPE_LABEL, certPdfUrl } from "@/lib/certificates";
import type { CertificateType } from "@/lib/certificates";

export const Route = createFileRoute("/_authenticated/certificates")({
  ssr: false,
  beforeLoad: ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
  },
  component: MyCertificatesPage,
});

function MyCertificatesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CertificateType>("all");

  const q = useQuery({
    queryKey: ["certificates", "mine", user?.id],
    queryFn: () => listMyCertificates(user!.id),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const all = q.data ?? [];
    return all.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (search && !`${c.title} ${c.recipient_name} ${c.code}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [q.data, search, typeFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Recognition"
        title="Your certificates"
        description="Every certificate the crew has issued in your name, ready to download and share."
      />
      <Section>
        <Card className="mb-4"><CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, hackathon or code" className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(CERT_TYPE_LABEL) as CertificateType[]).map((k) => (
                <SelectItem key={k} value={k}>{CERT_TYPE_LABEL[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent></Card>

        {q.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
        ) : !filtered.length ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Your certificates will appear here after organizers issue them."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((c) => (
              <Card key={c.id} className="transition hover:shadow-elegant">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary"><Award className="mr-1 h-3 w-3" />{CERT_TYPE_LABEL[c.type]}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(c.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono">{c.code}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <a href={certPdfUrl(c.code)} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-1 h-4 w-4" /> Download
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href={`/verify/${c.code}`} target="_blank" rel="noopener noreferrer">Verify link</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
