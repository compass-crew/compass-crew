import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, Plus, Trash2, Trophy, Users, Gavel, Megaphone, ListChecks, Download, Award, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  HACKATHON_STATUS_LABEL, formatDateRange, listHackathonTracks, listScoringCriteria,
} from "@/lib/hackathons";
import {
  upsertTrack, deleteTrack, upsertCriterion, deleteCriterion,
  savePrizes, listRegistrations, updateRegistrationStatus,
  listJudgeAssignments, assignJudgeByEmail, removeJudge,
  listAnnouncements, createAnnouncement, deleteAnnouncement,
  type Prize,
} from "@/lib/organizer";
import { toCsv, downloadCsv } from "@/lib/csv";
import { generateCertificate, bulkGenerateParticipation, revokeCertificate, publishResults } from "@/lib/certificates.functions";
import { computeLeaderboard } from "@/lib/leaderboard";

export const Route = createFileRoute("/_authenticated/organizer/hackathons/$hackathonId")({
  ssr: false,
  beforeLoad: async ({ context, params }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data: hack } = await supabase
      .from("hackathons")
      .select("id, created_by")
      .eq("id", params.hackathonId)
      .maybeSingle();
    if (!hack) throw redirect({ to: "/organizer/hackathons" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const list = (roles ?? []).map((r) => r.role);
    if (hack.created_by !== user.id && !list.includes("super_admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: OrganizerConsole,
});

function OrganizerConsole() {
  const { hackathonId } = Route.useParams();
  const { user } = useAuth();

  const hackQ = useQuery({
    queryKey: ["organizer", "hackathon", hackathonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("hackathons").select("*").eq("id", hackathonId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (hackQ.isLoading) return <Section><Skeleton className="h-96 w-full" /></Section>;
  if (!hackQ.data) return <Section><EmptyState title="Hackathon not found" /></Section>;
  const h = hackQ.data;

  return (
    <>
      <PageHeader
        eyebrow="Organizer console"
        title={h.title}
        description={`${HACKATHON_STATUS_LABEL[h.status]} · ${formatDateRange(h.starts_at, h.ends_at)}`}
      >
        <Button asChild variant="outline">
          <Link to="/organizer/hackathons"><ArrowLeft className="mr-2 h-4 w-4" />All hackathons</Link>
        </Button>
      </PageHeader>

      <Section>
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="criteria">Criteria</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab hackathonId={hackathonId} status={h.status} />
          </TabsContent>
          <TabsContent value="tracks" className="mt-6"><TracksTab hackathonId={hackathonId} /></TabsContent>
          <TabsContent value="criteria" className="mt-6"><CriteriaTab hackathonId={hackathonId} /></TabsContent>
          <TabsContent value="prizes" className="mt-6"><PrizesTab hackathonId={hackathonId} existing={(h.prizes as unknown as Prize[]) ?? []} /></TabsContent>
          <TabsContent value="registrations" className="mt-6"><RegistrationsTab hackathonId={hackathonId} title={h.title} /></TabsContent>
          <TabsContent value="judges" className="mt-6"><JudgesTab hackathonId={hackathonId} /></TabsContent>
          <TabsContent value="results" className="mt-6"><ResultsTab hackathonId={hackathonId} slug={h.slug} publishedAt={h.results_published_at} /></TabsContent>
          <TabsContent value="certificates" className="mt-6"><CertificatesTab hackathonId={hackathonId} /></TabsContent>
          <TabsContent value="announcements" className="mt-6"><AnnouncementsTab hackathonId={hackathonId} authorId={user!.id} /></TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

/* ============================== Overview ============================== */
function OverviewTab({ hackathonId, status }: { hackathonId: string; status: string }) {
  const qc = useQueryClient();
  const statsQ = useQuery({
    queryKey: ["organizer", "stats", hackathonId],
    queryFn: async () => {
      const [regs, teams, subs] = await Promise.all([
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
        supabase.from("teams").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("hackathon_id", hackathonId).eq("status", "submitted"),
      ]);
      return {
        registrations: regs.count ?? 0,
        teams: teams.count ?? 0,
        submissions: subs.count ?? 0,
      };
    },
  });

  const changeStatus = useMutation({
    mutationFn: async (next: string) => {
      const { error } = await supabase.from("hackathons").update({ status: next as never }).eq("id", hackathonId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["organizer", "hackathon", hackathonId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statuses = ["draft", "published", "registrations_open", "ongoing", "judging", "completed", "archived"];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Registrations" value={statsQ.data?.registrations ?? "—"} />
      <StatCard label="Teams" value={statsQ.data?.teams ?? "—"} />
      <StatCard label="Submissions" value={statsQ.data?.submissions ?? "—"} />
      <Card className="md:col-span-3">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Lifecycle status</h3>
            <p className="text-sm text-muted-foreground">Move the hackathon through its phases.</p>
          </div>
          <Select value={status} onValueChange={(v) => changeStatus.mutate(v)}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card><CardContent className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </CardContent></Card>
  );
}

/* ============================== Tracks ============================== */
function TracksTab({ hackathonId }: { hackathonId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["hackathon", hackathonId, "tracks"], queryFn: () => listHackathonTracks(hackathonId) });
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const add = useMutation({
    mutationFn: () => upsertTrack({ hackathon_id: hackathonId, name: name.trim(), description: desc.trim() || null, sort_order: (q.data?.length ?? 0) }),
    onSuccess: () => {
      setName(""); setDesc("");
      toast.success("Track added");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "tracks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTrack(id),
    onSuccess: () => {
      toast.success("Track deleted");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "tracks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Tracks</h3>
        {q.isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : (q.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No tracks yet. Add one on the right.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {(q.data ?? []).map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Add track</h3>
        <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) add.mutate(); }}>
          <div className="grid gap-2">
            <Label htmlFor="tn">Name</Label>
            <Input id="tn" value={name} onChange={(e) => setName(e.target.value)} placeholder="AI for Education" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="td">Description</Label>
            <Textarea id="td" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <Button type="submit" disabled={add.isPending}><Plus className="mr-1 h-4 w-4" />Add track</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

/* ============================== Criteria ============================== */
function CriteriaTab({ hackathonId }: { hackathonId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["hackathon", hackathonId, "criteria"], queryFn: () => listScoringCriteria(hackathonId) });
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [max, setMax] = useState(10);
  const [weight, setWeight] = useState(1);
  const add = useMutation({
    mutationFn: () => upsertCriterion({
      hackathon_id: hackathonId, name: name.trim(), description: desc.trim() || null,
      max_score: max, weight, sort_order: (q.data?.length ?? 0),
    }),
    onSuccess: () => {
      setName(""); setDesc(""); setMax(10); setWeight(1);
      toast.success("Criterion added");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "criteria"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteCriterion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "criteria"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const totalWeight = (q.data ?? []).reduce((s, c) => s + Number(c.weight), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Scoring criteria</h3>
          <Badge variant="outline">Total weight: {totalWeight.toFixed(2)}</Badge>
        </div>
        {q.isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : (q.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No criteria yet. Judges will need at least one.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {(q.data ?? []).map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Max {c.max_score} · weight {Number(c.weight).toFixed(2)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Add criterion</h3>
        <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) add.mutate(); }}>
          <div className="grid gap-2">
            <Label htmlFor="cn">Name</Label>
            <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Innovation" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd">Description</Label>
            <Textarea id="cd" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="mx">Max score</Label>
              <Input id="mx" type="number" min={1} max={100} value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wt">Weight</Label>
              <Input id="wt" type="number" step="0.1" min={0} max={10} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>
          </div>
          <Button type="submit" disabled={add.isPending}><Plus className="mr-1 h-4 w-4" />Add criterion</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

/* ============================== Prizes ============================== */
function PrizesTab({ hackathonId, existing }: { hackathonId: string; existing: Prize[] }) {
  const qc = useQueryClient();
  const [prizes, setPrizes] = useState<Prize[]>(existing);
  const save = useMutation({
    mutationFn: () => savePrizes(hackathonId, prizes),
    onSuccess: () => {
      toast.success("Prizes saved");
      qc.invalidateQueries({ queryKey: ["organizer", "hackathon", hackathonId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const add = () =>
    setPrizes((p) => [...p, { id: crypto.randomUUID(), title: `Prize ${p.length + 1}`, amount: "", description: "" }]);

  return (
    <Card><CardContent className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Prizes</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={add}><Plus className="mr-1 h-4 w-4" />Add prize</Button>
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </div>
      </div>
      {prizes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No prizes configured yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {prizes.map((p, i) => (
            <div key={p.id} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_180px_2fr_auto]">
              <div className="grid gap-1">
                <Label>Title</Label>
                <Input value={p.title} onChange={(e) => setPrizes((x) => x.map((y, j) => j === i ? { ...y, title: e.target.value } : y))} />
              </div>
              <div className="grid gap-1">
                <Label>Amount</Label>
                <Input value={p.amount ?? ""} onChange={(e) => setPrizes((x) => x.map((y, j) => j === i ? { ...y, amount: e.target.value } : y))} placeholder="₹1,00,000" />
              </div>
              <div className="grid gap-1">
                <Label>Description</Label>
                <Input value={p.description ?? ""} onChange={(e) => setPrizes((x) => x.map((y, j) => j === i ? { ...y, description: e.target.value } : y))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPrizes((x) => x.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

/* ============================== Registrations ============================== */
function RegistrationsTab({ hackathonId, title }: { hackathonId: string; title: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["hackathon", hackathonId, "registrations"], queryFn: () => listRegistrations(hackathonId) });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "pending" | "rejected" | "waitlist" | "withdrawn" }) => updateRegistrationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "registrations"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    const rows = (q.data ?? []).map((r) => ({
      full_name: r.profile?.full_name ?? "",
      username: r.profile?.username ?? "",
      college: r.profile?.college ?? "",
      branch: r.profile?.branch ?? "",
      year: r.profile?.year_of_study ?? "",
      status: r.status,
      registered_at: r.created_at,
    }));
    const csv = toCsv(rows, [
      { key: "full_name", header: "Full name" },
      { key: "username", header: "Username" },
      { key: "college", header: "College" },
      { key: "branch", header: "Branch" },
      { key: "year", header: "Year" },
      { key: "status", header: "Status" },
      { key: "registered_at", header: "Registered at" },
    ]);
    downloadCsv(`${title.replace(/\s+/g, "-")}-registrations.csv`, csv);
  };

  return (
    <Card><CardContent className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Registrations</h3>
          <p className="text-sm text-muted-foreground">{q.data?.length ?? 0} total</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={!(q.data?.length)}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      {q.isLoading ? <Skeleton className="mt-4 h-40 w-full" /> : (q.data ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No registrations yet" description="Once your hackathon is public, registered users will show up here." />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-2">Participant</th>
                <th className="py-2 pr-2">College</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Registered</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-3 pr-2">
                    <p className="font-medium">{r.profile?.full_name ?? "—"}</p>
                    {r.profile?.username && <p className="text-xs text-muted-foreground">@{r.profile.username}</p>}
                  </td>
                  <td className="py-3 pr-2 text-muted-foreground">
                    {r.profile?.college ?? "—"}
                    {r.profile?.branch && <span> · {r.profile.branch}</span>}
                  </td>
                  <td className="py-3 pr-2">
                    <Badge variant="outline">{r.status}</Badge>
                  </td>
                  <td className="py-3 pr-2 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="py-3 pr-2 text-right">
                    <Select value={r.status} onValueChange={(v) => setStatus.mutate({ id: r.id, status: v as never })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["approved", "pending", "waitlist", "rejected", "withdrawn"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent></Card>
  );
}

/* ============================== Judges ============================== */
function JudgesTab({ hackathonId }: { hackathonId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["hackathon", hackathonId, "judges"], queryFn: () => listJudgeAssignments(hackathonId) });
  const [email, setEmail] = useState("");
  const add = useMutation({
    mutationFn: () => assignJudgeByEmail(hackathonId, email),
    onSuccess: () => {
      setEmail("");
      toast.success("Judge assigned");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "judges"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeJudge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "judges"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Judges</h3>
        {q.isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : (q.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No judges yet. Add one by email on the right.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {(q.data ?? []).map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{j.profile?.full_name ?? j.profile?.username ?? "Judge"}</p>
                  {j.profile?.username && <p className="text-xs text-muted-foreground">@{j.profile.username}</p>}
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(j.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Assign judge</h3>
        <p className="mt-1 text-xs text-muted-foreground">User must have signed up already.</p>
        <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (email.trim()) add.mutate(); }}>
          <div className="grid gap-2">
            <Label htmlFor="je">Email</Label>
            <Input id="je" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={add.isPending}><Gavel className="mr-1 h-4 w-4" />Assign</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

/* ============================== Announcements ============================== */
function AnnouncementsTab({ hackathonId, authorId }: { hackathonId: string; authorId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["hackathon", hackathonId, "announcements"], queryFn: () => listAnnouncements(hackathonId) });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "participants" | "judges" | "mentors" | "teams">("all");

  const post = useMutation({
    mutationFn: () => createAnnouncement({ hackathon_id: hackathonId, author_id: authorId, title: title.trim(), body: body.trim(), audience }),
    onSuccess: () => {
      setTitle(""); setBody("");
      toast.success("Announcement posted");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "announcements"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "announcements"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Announcements</h3>
        {q.isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : (q.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(q.data ?? []).map((a) => (
              <li key={a.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.title}</p>
                      <Badge variant="outline">{a.audience}</Badge>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>
      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Post announcement</h3>
        <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (title.trim() && body.trim()) post.mutate(); }}>
          <div className="grid gap-2">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as never)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
                <SelectItem value="judges">Judges</SelectItem>
                <SelectItem value="mentors">Mentors</SelectItem>
                <SelectItem value="teams">Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="at">Title</Label>
            <Input id="at" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ab">Body</Label>
            <Textarea id="ab" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <Button type="submit" disabled={post.isPending}><Megaphone className="mr-1 h-4 w-4" />Post</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

/* ============================== Results ============================== */
function ResultsTab({ hackathonId, slug, publishedAt }: { hackathonId: string; slug: string; publishedAt: string | null }) {
  const qc = useQueryClient();
  const publish = useServerFn(publishResults);
  const [busy, setBusy] = useState(false);

  const lbQ = useQuery({
    queryKey: ["organizer", "leaderboard-preview", hackathonId],
    queryFn: () => computeLeaderboard(hackathonId),
  });

  const doPublish = async (freeze: boolean) => {
    setBusy(true);
    try {
      await publish({ data: { hackathonId, freeze } });
      toast.success(freeze ? "Results published & leaderboard frozen" : "Results published");
      qc.invalidateQueries({ queryKey: ["organizer", "hackathon", hackathonId] });
      qc.invalidateQueries({ queryKey: ["organizer", "leaderboard-preview", hackathonId] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h3 className="font-display text-lg font-semibold">Publish results</h3>
          <p className="text-sm text-muted-foreground">
            {publishedAt ? `Published on ${new Date(publishedAt).toLocaleString("en-IN")}` : "Not published yet. Ranks and awards will be assigned automatically."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/hackathons/$slug/leaderboard" params={{ slug }}>
              <Trophy className="mr-2 h-4 w-4" /> Preview public leaderboard
            </Link>
          </Button>
          <Button onClick={() => doPublish(true)} disabled={busy}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {publishedAt ? "Re-publish & freeze" : "Publish & freeze"}
          </Button>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Live leaderboard preview</h3>
        <p className="text-sm text-muted-foreground">Only finalised judge scores are counted.</p>
        {lbQ.isLoading ? <Skeleton className="mt-4 h-40 w-full" /> : !lbQ.data?.length ? (
          <p className="mt-4 text-sm text-muted-foreground">No finalised scores yet.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {lbQ.data.slice(0, 20).map((e) => (
              <li key={e.submission_id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-6">#{e.rank}</span>
                  <span className="font-medium">{e.submission.name}</span>
                  {e.track_name && <Badge variant="outline">{e.track_name}</Badge>}
                </div>
                <span className="font-display font-semibold text-primary">{e.weighted_score.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent></Card>
    </div>
  );
}

/* ============================== Certificates ============================== */
function CertificatesTab({ hackathonId }: { hackathonId: string }) {
  const qc = useQueryClient();
  const genFn = useServerFn(generateCertificate);
  const bulkFn = useServerFn(bulkGenerateParticipation);
  const revokeFn = useServerFn(revokeCertificate);

  const [email, setEmail] = useState("");
  const [type, setType] = useState<"participation" | "winner" | "runner_up" | "special_mention" | "judge" | "mentor" | "organizer" | "campus_ambassador" | "volunteer">("participation");
  const [achievement, setAchievement] = useState("");

  const certsQ = useQuery({
    queryKey: ["hackathon", hackathonId, "certs"],
    queryFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.from("certificates").select("*").eq("hackathon_id", hackathonId).order("issued_at", { ascending: false });
      return data ?? [];
    },
  });

  const [busy, setBusy] = useState(false);
  const issueOne = async () => {
    if (!email.trim()) return toast.error("Enter recipient email");
    setBusy(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: uid } = await supabase.rpc("find_user_id_by_email", { _email: email.trim().toLowerCase() });
      if (!uid) throw new Error("No user found with that email");
      await genFn({ data: { hackathonId, userId: uid as unknown as string, type, achievement: achievement.trim() || undefined } });
      toast.success("Certificate issued");
      setEmail(""); setAchievement("");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "certs"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const issueBulk = async () => {
    setBusy(true);
    try {
      const res = await bulkFn({ data: { hackathonId } });
      toast.success(`Issued ${res.issued} participation certificates`);
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "certs"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this certificate? The PDF will be removed.")) return;
    try {
      await revokeFn({ data: { certificateId: id } });
      toast.success("Certificate revoked");
      qc.invalidateQueries({ queryKey: ["hackathon", hackathonId, "certs"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card><CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Issued certificates</h3>
          <Button size="sm" variant="outline" onClick={issueBulk} disabled={busy}>
            <Award className="mr-2 h-4 w-4" /> Bulk: participation
          </Button>
        </div>
        {certsQ.isLoading ? <Skeleton className="mt-4 h-40 w-full" /> : !certsQ.data?.length ? (
          <p className="mt-4 text-sm text-muted-foreground">No certificates issued yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {certsQ.data.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.recipient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.type} · <span className="font-mono">{c.code}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/api/public/certificates/${c.code}`} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => revoke(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-6">
        <h3 className="font-display text-lg font-semibold">Issue certificate</h3>
        <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); issueOne(); }}>
          <div className="grid gap-2">
            <Label>Recipient email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["participation","winner","runner_up","special_mention","judge","mentor","organizer","campus_ambassador","volunteer"].map((t) => (
                  <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Achievement (optional)</Label>
            <Input value={achievement} onChange={(e) => setAchievement(e.target.value)} placeholder="e.g. Best AI Project" />
          </div>
          <Button type="submit" disabled={busy}><Award className="mr-2 h-4 w-4" />Issue</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

