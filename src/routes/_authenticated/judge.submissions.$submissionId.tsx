import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Github,
  Globe,
  Video,
  FileText,
  Users,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  getSubmissionForJudge,
  listTeamMembers,
  getMyScores,
  saveDraftScores,
  finalizeScores,
  computeWeighted,
} from "@/lib/judging";
import { listScoringCriteria } from "@/lib/hackathons";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/judge/submissions/$submissionId")({
  ssr: false,
  beforeLoad: requireRole(["judge", "super_admin"]),
  component: ScoringPage,
});

interface Entry {
  criterion_id: string;
  score: number;
  comment: string;
}

function ScoringPage() {
  const { submissionId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const subQ = useQuery({
    queryKey: ["judge", "submission", submissionId],
    queryFn: () => getSubmissionForJudge(submissionId),
  });
  const critQ = useQuery({
    queryKey: ["hackathon", subQ.data?.hackathon_id, "criteria"],
    queryFn: () => listScoringCriteria(subQ.data!.hackathon_id),
    enabled: !!subQ.data,
  });
  const membersQ = useQuery({
    queryKey: ["team", subQ.data?.team_id, "members"],
    queryFn: () => listTeamMembers(subQ.data!.team_id),
    enabled: !!subQ.data,
  });
  const myScoresQ = useQuery({
    queryKey: ["scores", submissionId, user?.id],
    queryFn: () => getMyScores(submissionId, user!.id),
    enabled: !!user,
  });

  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (!critQ.data) return;
    const byCrit = new Map((myScoresQ.data ?? []).map((s) => [s.criterion_id, s]));
    const finalised = (myScoresQ.data ?? []).some((s) => s.is_final);
    setIsFinal(finalised);
    setEntries(
      critQ.data.map((c) => {
        const existing = byCrit.get(c.id);
        return {
          criterion_id: c.id,
          score: existing ? Number(existing.score) : 0,
          comment: existing?.comment ?? "",
        };
      }),
    );
  }, [critQ.data, myScoresQ.data]);

  const weighted = useMemo(() => computeWeighted(entries, critQ.data ?? []), [entries, critQ.data]);

  const saveDraft = useMutation({
    mutationFn: () => saveDraftScores({ submission_id: submissionId, judge_id: user!.id, entries }),
    onSuccess: () => {
      toast.success("Draft saved");
      qc.invalidateQueries({ queryKey: ["scores", submissionId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: () => finalizeScores({ submission_id: submissionId, judge_id: user!.id, entries }),
    onSuccess: () => {
      toast.success("Scores submitted");
      qc.invalidateQueries({ queryKey: ["scores", submissionId] });
      qc.invalidateQueries({ queryKey: ["judge"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const validate = (): string | null => {
    if (!critQ.data?.length) return "This hackathon has no scoring criteria yet";
    for (const e of entries) {
      const c = critQ.data.find((x) => x.id === e.criterion_id);
      if (!c) continue;
      if (Number.isNaN(e.score) || e.score < 0 || e.score > Number(c.max_score)) {
        return `Score for "${c.name}" must be between 0 and ${c.max_score}`;
      }
    }
    return null;
  };

  if (subQ.isLoading)
    return (
      <Section>
        <Skeleton className="h-96 w-full" />
      </Section>
    );
  if (!subQ.data)
    return (
      <Section>
        <EmptyState title="Submission not found" />
      </Section>
    );
  const s = subQ.data;

  return (
    <>
      <PageHeader eyebrow="Scoring" title={s.name} description={s.tagline ?? undefined}>
        <Button asChild variant="outline">
          <Link to="/judge/hackathons/$hackathonId" params={{ hackathonId: s.hackathon_id }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to queue
          </Link>
        </Button>
      </PageHeader>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Project details */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap gap-2">
                  {s.track?.name && <Badge variant="secondary">{s.track.name}</Badge>}
                  {s.team?.name && (
                    <Badge variant="outline">
                      <Users className="mr-1 h-3 w-3" /> {s.team.name}
                    </Badge>
                  )}
                </div>
                <ProjectField label="Problem statement" value={s.problem_statement} />
                <ProjectField label="Solution" value={s.solution} />
                <ProjectField label="Description" value={s.description} />
                <ProjectField label="Future scope" value={s.future_scope} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {s.tech_stack?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tech stack
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.tech_stack.map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {s.ai_models?.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        AI models
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.ai_models.map((t) => (
                          <Badge key={t} variant="outline">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <Separator />
                <div className="flex flex-wrap gap-3 text-sm">
                  {s.github_url && (
                    <a
                      href={s.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted"
                    >
                      <Github className="h-4 w-4" /> Repository
                    </a>
                  )}
                  {s.live_url && (
                    <a
                      href={s.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted"
                    >
                      <Globe className="h-4 w-4" /> Live demo
                    </a>
                  )}
                  {s.video_url && (
                    <a
                      href={s.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted"
                    >
                      <Video className="h-4 w-4" /> Demo video
                    </a>
                  )}
                  {s.presentation_url && (
                    <a
                      href={s.presentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-muted"
                    >
                      <FileText className="h-4 w-4" /> Pitch deck
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-6">
                <h3 className="font-display text-base font-semibold">Team members</h3>
                {membersQ.isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : !membersQ.data?.length ? (
                  <p className="text-sm text-muted-foreground">No members listed.</p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {membersQ.data.map((m) => (
                      <li
                        key={m.user_id}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="truncate">
                          {m.profile?.full_name ?? m.profile?.username ?? "—"}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scoring rubric */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Weighted score
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold text-primary">
                    {weighted.toFixed(2)}
                    <span className="text-base text-muted-foreground"> /100</span>
                  </p>
                  {isFinal && (
                    <Badge className="mt-2" variant="secondary">
                      Submitted
                    </Badge>
                  )}
                </div>
                <Separator />
                {!critQ.data?.length ? (
                  <p className="text-sm text-muted-foreground">
                    Organizer hasn't defined criteria yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {critQ.data.map((c, idx) => {
                      const e = entries[idx];
                      if (!e) return null;
                      return (
                        <div key={c.id} className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <Label className="text-sm font-medium">{c.name}</Label>
                            <span className="text-xs text-muted-foreground">
                              weight {c.weight} · max {c.max_score}
                            </span>
                          </div>
                          {c.description && (
                            <p className="text-xs text-muted-foreground">{c.description}</p>
                          )}
                          <Input
                            type="number"
                            min={0}
                            max={Number(c.max_score)}
                            step="0.5"
                            value={Number.isFinite(e.score) ? e.score : 0}
                            onChange={(ev) => {
                              const v = Number(ev.target.value);
                              setEntries((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, score: v } : p)),
                              );
                            }}
                          />
                          <Textarea
                            placeholder="Notes for the team (optional)"
                            rows={2}
                            value={e.comment}
                            onChange={(ev) =>
                              setEntries((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, comment: ev.target.value } : p,
                                ),
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    disabled={saveDraft.isPending || !critQ.data?.length}
                    onClick={() => {
                      const err = validate();
                      if (err) return toast.error(err);
                      saveDraft.mutate();
                    }}
                  >
                    Save draft
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={submit.isPending || !critQ.data?.length}>
                        {isFinal ? "Update final scores" : "Submit final scores"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Submit final scores?</AlertDialogTitle>
                        <AlertDialogDescription>
                          These scores will count toward the leaderboard. You can still edit them
                          until the organizer freezes results.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const err = validate();
                            if (err) return toast.error(err);
                            submit.mutate();
                          }}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

function ProjectField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{value}</p>
    </div>
  );
}
