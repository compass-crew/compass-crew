import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Github, Globe, Rocket, Save, Send, Video, Lock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getTeam, listTeamMembers } from "@/lib/teams";
import { listHackathonTracks } from "@/lib/hackathons";
import {
  getTeamSubmission, upsertDraft, submitFinal, withdrawSubmission,
  validateForFinalSubmit, type Submission,
} from "@/lib/submissions";

export const Route = createFileRoute("/_authenticated/teams/$teamId/submission")({
  ssr: false,
  component: SubmissionPage,
});

interface DraftForm {
  name: string;
  tagline: string;
  description: string;
  problem_statement: string;
  solution: string;
  future_scope: string;
  github_url: string;
  live_url: string;
  video_url: string;
  presentation_url: string;
  tech_stack: string[];
  ai_models: string[];
  track_id: string | null;
}

function toForm(s: Submission | null): DraftForm {
  return {
    name: s?.name ?? "",
    tagline: s?.tagline ?? "",
    description: s?.description ?? "",
    problem_statement: s?.problem_statement ?? "",
    solution: s?.solution ?? "",
    future_scope: s?.future_scope ?? "",
    github_url: s?.github_url ?? "",
    live_url: s?.live_url ?? "",
    video_url: s?.video_url ?? "",
    presentation_url: s?.presentation_url ?? "",
    tech_stack: s?.tech_stack ?? [],
    ai_models: s?.ai_models ?? [],
    track_id: s?.track_id ?? null,
  };
}

function parseChips(v: string): string[] {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function SubmissionPage() {
  const { teamId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const teamQ = useQuery({ queryKey: ["team", teamId], queryFn: () => getTeam(teamId) });
  const membersQ = useQuery({ queryKey: ["team", teamId, "members"], queryFn: () => listTeamMembers(teamId) });
  const subQ = useQuery({ queryKey: ["submission", teamId], queryFn: () => getTeamSubmission(teamId) });
  const tracksQ = useQuery({
    queryKey: ["hackathon", teamQ.data?.hackathon_id, "tracks"],
    queryFn: () => (teamQ.data ? listHackathonTracks(teamQ.data.hackathon_id) : Promise.resolve([])),
    enabled: !!teamQ.data?.hackathon_id,
  });

  const [form, setForm] = useState<DraftForm>(toForm(null));
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize form from server once
  useEffect(() => {
    if (!initialized.current && subQ.data !== undefined) {
      setForm(toForm(subQ.data));
      initialized.current = true;
    }
  }, [subQ.data]);

  const isLeader = teamQ.data?.leader_id === user?.id;
  const isSubmitted = subQ.data?.status === "submitted";
  const locked = isSubmitted;

  const patch = <K extends keyof DraftForm>(k: K, v: DraftForm[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  // Debounced autosave
  useEffect(() => {
    if (!dirty || !isLeader || locked || !teamQ.data) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setSaving(true);
        const saved = await upsertDraft({
          team_id: teamId,
          hackathon_id: teamQ.data!.hackathon_id,
          patch: { ...form, track_id: form.track_id || null },
        });
        qc.setQueryData(["submission", teamId], saved);
        setSavedAt(new Date());
        setDirty(false);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [form, dirty, isLeader, locked, teamId, teamQ.data, qc]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!subQ.data) throw new Error("Save a draft first");
      const err = validateForFinalSubmit({ ...subQ.data, ...form });
      if (err) throw new Error(err);
      return submitFinal(subQ.data.id);
    },
    onSuccess: (s) => {
      qc.setQueryData(["submission", teamId], s);
      toast.success("Submission locked in. Good luck!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      if (!subQ.data) throw new Error("No submission");
      return withdrawSubmission(subQ.data.id);
    },
    onSuccess: (s) => {
      qc.setQueryData(["submission", teamId], s);
      toast.success("Reverted to draft");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (teamQ.isLoading || subQ.isLoading) return <Section><Skeleton className="h-96 w-full" /></Section>;
  if (!teamQ.data) return <Section><EmptyState title="Team not found" description="You may not have access to this team." /></Section>;

  const validationError = validateForFinalSubmit({ ...(subQ.data ?? {}), ...form } as Partial<Submission>);

  return (
    <>
      <PageHeader
        eyebrow={teamQ.data.hackathon?.title ?? "Hackathon"}
        title="Project submission"
        description={`Team: ${teamQ.data.name}`}
      >
        <Button asChild variant="outline">
          <Link to="/teams/$teamId" params={{ teamId }}><ArrowLeft className="mr-2 h-4 w-4" />Team</Link>
        </Button>
      </PageHeader>

      <Section>
        {/* Status bar */}
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Submitted
                </Badge>
              ) : (
                <Badge variant="outline">Draft</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {saving ? "Saving…" : savedAt ? `Saved at ${savedAt.toLocaleTimeString()}` : "Autosave enabled"}
              </span>
            </div>
            <div className="flex gap-2">
              {isSubmitted && isLeader && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm"><Lock className="mr-1 h-4 w-4" />Withdraw</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Withdraw submission?</AlertDialogTitle>
                      <AlertDialogDescription>Your project returns to draft and won't be judged until you resubmit.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => withdraw.mutate()}>Withdraw</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {!isSubmitted && isLeader && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-brand text-white hover:opacity-90" disabled={!!validationError || submit.isPending}>
                      <Send className="mr-1 h-4 w-4" />{submit.isPending ? "Submitting…" : "Submit final"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit for judging?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You can still withdraw and edit before the deadline, but judges may see your project once submitted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Not yet</AlertDialogCancel>
                      <AlertDialogAction onClick={() => submit.mutate()}>Submit final</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {validationError && !isSubmitted && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-center gap-2 p-4 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">To submit: {validationError}</span>
            </CardContent>
          </Card>
        )}

        <fieldset disabled={locked || !isLeader} className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2"><CardContent className="grid gap-5 p-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Project name *</Label>
              <Input id="name" value={form.name} onChange={(e) => patch("name", e.target.value)} maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag">One-line tagline *</Label>
              <Input id="tag" value={form.tagline} onChange={(e) => patch("tagline", e.target.value)} maxLength={160}
                     placeholder="What does your project do in one sentence?" />
            </div>
            {(tracksQ.data ?? []).length > 0 && (
              <div className="grid gap-2">
                <Label>Track</Label>
                <Select value={form.track_id ?? ""} onValueChange={(v) => patch("track_id", v || null)}>
                  <SelectTrigger><SelectValue placeholder="Choose a track" /></SelectTrigger>
                  <SelectContent>
                    {(tracksQ.data ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent></Card>

          <Card><CardContent className="grid gap-5 p-6">
            <h3 className="font-display text-lg font-semibold">The problem & solution</h3>
            <div className="grid gap-2">
              <Label htmlFor="prob">Problem statement *</Label>
              <Textarea id="prob" rows={5} value={form.problem_statement} onChange={(e) => patch("problem_statement", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sol">Your solution *</Label>
              <Textarea id="sol" rows={5} value={form.solution} onChange={(e) => patch("solution", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description *</Label>
              <Textarea id="desc" rows={4} value={form.description} onChange={(e) => patch("description", e.target.value)}
                        placeholder="What did you build, how does it work?" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fs">Future scope</Label>
              <Textarea id="fs" rows={3} value={form.future_scope} onChange={(e) => patch("future_scope", e.target.value)} />
            </div>
          </CardContent></Card>

          <Card><CardContent className="grid gap-5 p-6">
            <h3 className="font-display text-lg font-semibold">Links & demo</h3>
            <div className="grid gap-2">
              <Label htmlFor="gh"><Github className="mr-1 inline h-3.5 w-3.5" />GitHub repository *</Label>
              <Input id="gh" type="url" value={form.github_url} onChange={(e) => patch("github_url", e.target.value)} placeholder="https://github.com/..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="live"><Globe className="mr-1 inline h-3.5 w-3.5" />Live demo URL</Label>
              <Input id="live" type="url" value={form.live_url} onChange={(e) => patch("live_url", e.target.value)} placeholder="https://your-demo.app" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vid"><Video className="mr-1 inline h-3.5 w-3.5" />Demo video (YouTube / Loom)</Label>
              <Input id="vid" type="url" value={form.video_url} onChange={(e) => patch("video_url", e.target.value)} placeholder="https://youtu.be/..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pd"><Rocket className="mr-1 inline h-3.5 w-3.5" />Pitch deck / slides URL</Label>
              <Input id="pd" type="url" value={form.presentation_url} onChange={(e) => patch("presentation_url", e.target.value)} placeholder="https://docs.google.com/..." />
              <p className="text-xs text-muted-foreground">Paste a public link to your deck (Google Slides, Notion, PDF, etc.).</p>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="ts">Tech stack * (comma separated)</Label>
              <Input id="ts" value={form.tech_stack.join(", ")} onChange={(e) => patch("tech_stack", parseChips(e.target.value))}
                     placeholder="React, TypeScript, Postgres, OpenAI" />
              <div className="flex flex-wrap gap-1">
                {form.tech_stack.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai">AI models used (comma separated)</Label>
              <Input id="ai" value={form.ai_models.join(", ")} onChange={(e) => patch("ai_models", parseChips(e.target.value))}
                     placeholder="GPT-4o, Whisper, Nano Banana" />
              <div className="flex flex-wrap gap-1">
                {form.ai_models.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
              </div>
            </div>
          </CardContent></Card>

          <Card className="lg:col-span-2"><CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold">Team roster</h3>
            <p className="text-sm text-muted-foreground">Members listed here will be credited on your submission and any certificates.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(membersQ.data ?? []).filter((m) => m.status === "active").map((m) => (
                <li key={m.id}>
                  <Badge variant="outline">{m.profile?.full_name ?? m.profile?.username ?? "Member"}</Badge>
                </li>
              ))}
            </ul>
          </CardContent></Card>
        </fieldset>

        {!isLeader && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Only the team leader can edit the submission. You can still view progress.
          </p>
        )}
      </Section>
    </>
  );
}
