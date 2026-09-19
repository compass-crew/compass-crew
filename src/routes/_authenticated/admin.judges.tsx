import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Gavel,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Archive,
  Twitter,
  Linkedin,
  RefreshCw,
  Trophy,
  Calendar,
  Building,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import type { Database } from "@/integrations/supabase/types";

type JudgeRow = Database["public"]["Tables"]["public_judges"]["Row"];
type ContentStatus = Database["public"]["Enums"]["content_status"];

interface JudgeAssignmentRow {
  id: string;
  created_at: string;
  judge_id: string;
  hackathons: { title: string; slug: string } | null;
}

export const Route = createFileRoute("/_authenticated/admin/judges")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Judges — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminJudgesPage,
});

function AdminJudgesPage() {
  const [activeTab, setActiveTab] = useState("roster");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Judges Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluation panels, jury credentials, and hackathon judging allocations.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="roster" className="gap-2 text-xs">
            <Gavel className="h-3.5 w-3.5" />
            Public Jury Panel
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2 text-xs">
            <Trophy className="h-3.5 w-3.5" />
            Competition Allocations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <JudgesRosterTab />
        </TabsContent>

        <TabsContent value="assignments">
          <JudgeAssignmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Judges Roster Tab
// ============================================================================
function JudgesRosterTab() {
  const [judges, setJudges] = useState<JudgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JudgeRow | null>(null);
  const [inspectItem, setInspectItem] = useState<JudgeRow | null>(null);
  const [deleteConfirmItem, setDeleteItem] = useState<JudgeRow | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{
    judge: JudgeRow;
    nextStatus: ContentStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [eventLabel, setEventLabel] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [status, setStatus] = useState<ContentStatus>("published");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const loadJudges = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("public_judges")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(
          `name.ilike.%${term}%,company.ilike.%${term}%,title.ilike.%${term}%,event_label.ilike.%${term}%`,
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setJudges(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load judges");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(loadJudges, 250);
    return () => clearTimeout(t);
  }, [loadJudges]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setName("");
    setTitle("");
    setCompany("");
    setAvatarUrl("");
    setEventLabel("");
    setBio("");
    setLinkedin("");
    setTwitter("");
    setStatus("published");
    setSortOrder(0);
    setFormOpen(true);
  };

  const openEdit = (j: JudgeRow) => {
    setEditingItem(j);
    setName(j.name);
    setTitle(j.title ?? "");
    setCompany(j.company ?? "");
    setAvatarUrl(j.avatar_url ?? "");
    setEventLabel(j.event_label ?? "");
    setBio(j.bio ?? "");
    setLinkedin(j.linkedin_url ?? "");
    setTwitter(j.twitter_url ?? "");
    setStatus(j.status);
    setSortOrder(j.sort_order ?? 0);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Judge name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        title: title.trim() || null,
        company: company.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        event_label: eventLabel.trim() || null,
        bio: bio.trim() || null,
        linkedin_url: linkedin.trim() || null,
        twitter_url: twitter.trim() || null,
        status,
        sort_order: Number(sortOrder) || 0,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("public_judges")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
        await logAdminAction({
          action: "judge.update",
          resourceType: "public_judges",
          resourceId: editingItem.id,
          meta: { name: payload.name, status: payload.status },
        });
        toast.success("Judge profile updated successfully.");
      } else {
        const { data, error } = await supabase
          .from("public_judges")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAdminAction({
          action: "judge.create",
          resourceType: "public_judges",
          resourceId: data.id,
          meta: { name: payload.name, status: payload.status },
        });
        toast.success("Judge added to jury panel.");
      }

      setFormOpen(false);
      void loadJudges();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save judge.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (judge: JudgeRow, nextStatus: ContentStatus) => {
    if (nextStatus === "archived") {
      setStatusConfirmItem({ judge, nextStatus });
      return;
    }
    await executeStatusUpdate(judge, nextStatus);
  };

  const executeStatusUpdate = async (judge: JudgeRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("public_judges")
        .update({ status: nextStatus })
        .eq("id", judge.id);

      if (error) throw error;

      await logAdminAction({
        action: `judge.status.${nextStatus}`,
        resourceType: "public_judges",
        resourceId: judge.id,
        meta: { name: judge.name, previous_status: judge.status, new_status: nextStatus },
      });

      toast.success(`Judge marked as ${nextStatus}.`);
      void loadJudges();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusConfirmItem(null);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const { error } = await supabase
        .from("public_judges")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", deleteConfirmItem.id);

      if (error) throw error;

      await logAdminAction({
        action: "judge.delete",
        resourceType: "public_judges",
        resourceId: deleteConfirmItem.id,
        meta: { name: deleteConfirmItem.name },
      });

      toast.success("Judge removed from active panel.");
      setDeleteItem(null);
      void loadJudges();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete judge");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jury by name, company, or competition tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadJudges()}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Judge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : judges.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Gavel className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No judges found</p>
              <p className="mt-1 text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try resetting your search query or status filter."
                  : "Add your first judge or competition jury panelist."}
              </p>
              {(search || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Judge</th>
                    <th className="px-4 py-3">Role & Organization</th>
                    <th className="px-4 py-3">Competition Tag</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {judges.map((j) => {
                    const initials = j.name
                      ? j.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "JU";

                    return (
                      <tr key={j.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-border/60">
                              <AvatarImage src={j.avatar_url ?? undefined} alt={j.name} />
                              <AvatarFallback className="text-[10px] font-medium bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {j.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {j.linkedin_url && (
                                  <a
                                    href={j.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary transition"
                                    title="LinkedIn"
                                  >
                                    <Linkedin className="h-3 w-3" />
                                  </a>
                                )}
                                {j.twitter_url && (
                                  <a
                                    href={j.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary transition"
                                    title="Twitter / X"
                                  >
                                    <Twitter className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="text-foreground/90 font-medium">{j.title ?? "—"}</div>
                          {j.company && (
                            <div className="text-[10px] text-muted-foreground">{j.company}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {j.event_label ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] border-border/40 font-normal"
                            >
                              {j.event_label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              j.status === "published"
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                : j.status === "draft"
                                  ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                                  : "text-muted-foreground border-border/40"
                            }`}
                          >
                            {j.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[11px]">
                          {new Date(j.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInspectItem(j)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Inspect details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(j)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit profile"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Select
                              value={j.status}
                              onValueChange={(val) => handleStatusChange(j, val as ContentStatus)}
                            >
                              <SelectTrigger className="h-7 w-20 text-[10px] px-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end">
                                <SelectItem value="published" className="text-xs">
                                  Publish
                                </SelectItem>
                                <SelectItem value="draft" className="text-xs">
                                  Draft
                                </SelectItem>
                                <SelectItem value="archived" className="text-xs">
                                  Archive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteItem(j)}
                              className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10"
                              title="Delete judge"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <span className="font-semibold text-foreground">{(page - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * pageSize, totalCount)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalCount}</span> judges
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 text-xs gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <span className="text-[11px] px-2 font-medium text-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 text-xs gap-1"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Inspection Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Judge Profile</DialogTitle>
            <DialogDescription>
              Evaluation credentials and public competition jury representation.
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                <Avatar className="h-14 w-14 border border-border/60">
                  <AvatarImage src={inspectItem.avatar_url ?? undefined} alt={inspectItem.name} />
                  <AvatarFallback className="text-base font-semibold bg-muted">
                    {inspectItem.name
                      ? inspectItem.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "JU"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {inspectItem.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        inspectItem.status === "published"
                          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                          : "text-muted-foreground"
                      }`}
                    >
                      {inspectItem.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {[inspectItem.title, inspectItem.company].filter(Boolean).join(" · ") ||
                      "Jury Panelist"}
                  </p>
                  {inspectItem.event_label && (
                    <div className="mt-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {inspectItem.event_label}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 mt-2">
                    {inspectItem.linkedin_url && (
                      <a
                        href={inspectItem.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Linkedin className="h-3 w-3" /> LinkedIn
                      </a>
                    )}
                    {inspectItem.twitter_url && (
                      <a
                        href={inspectItem.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Twitter className="h-3 w-3" /> Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {inspectItem.bio && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Evaluation Experience & Bio</Label>
                  <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                    {inspectItem.bio}
                  </div>
                </div>
              )}

              <div className="rounded-md border border-border/40 bg-muted/10 p-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Record ID:</span>
                  <span className="font-mono text-foreground select-all">{inspectItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled:</span>
                  <span>{new Date(inspectItem.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{new Date(inspectItem.updated_at).toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const item = inspectItem;
                    setInspectItem(null);
                    openEdit(item);
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
                <Button type="button" onClick={() => setInspectItem(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Judge Profile" : "Add Judge"}</DialogTitle>
            <DialogDescription>
              Configure judge credentials and public directory listing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="judge-name">Full Name *</Label>
              <Input
                id="judge-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="judge-title">Job Title</Label>
                <Input
                  id="judge-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Partner & Head of AI"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="judge-company">Company / Org</Label>
                <Input
                  id="judge-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Sequoia Capital"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="judge-avatar">Avatar Image URL</Label>
              <Input
                id="judge-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="judge-event">Competition Label / Tag</Label>
              <Input
                id="judge-event"
                value={eventLabel}
                onChange={(e) => setEventLabel(e.target.value)}
                placeholder="e.g. Genesis AI 2026 Finals, Web3 Track"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="judge-linkedin">LinkedIn URL</Label>
                <Input
                  id="judge-linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="judge-twitter">Twitter / X URL</Label>
                <Input
                  id="judge-twitter"
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="judge-bio">Evaluation Experience & Bio</Label>
              <Textarea
                id="judge-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional evaluation background and technical focus..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="judge-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="judge-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="judge-sort">Display Priority</Label>
                <Input
                  id="judge-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                {editingItem ? "Save Changes" : "Add Judge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Confirm Alert Dialog */}
      <AlertDialog
        open={!!statusConfirmItem}
        onOpenChange={(open) => !open && setStatusConfirmItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Judge Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{statusConfirmItem?.judge.name}</strong>? Archived
              judges are removed from public listings and active evaluation panels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusConfirmItem) {
                  void executeStatusUpdate(statusConfirmItem.judge, statusConfirmItem.nextStatus);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Archive Judge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Judge from Panel?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteConfirmItem?.name}</strong>? This action
              will remove them from the active public judges panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void executeDelete()}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Judge Assignments Tab
// ============================================================================
function JudgeAssignmentsTab() {
  const [assignments, setAssignments] = useState<JudgeAssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from("judge_assignments")
        .select("id, created_at, judge_id, hackathons(title, slug)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setAssignments((data as unknown as JudgeAssignmentRow[]) ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load judge assignments");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Competition Allocations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Judges connected to active hackathons for submission evaluation.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAssignments()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Trophy className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No active judge allocations</p>
              <p className="mt-1 text-muted-foreground">
                Judges will be allocated to hackathons as competitions transition into their
                evaluation phases.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Hackathon</th>
                    <th className="px-4 py-3">Judge ID</th>
                    <th className="px-4 py-3">Assigned Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {assignments.map((a) => (
                    <tr key={a.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {a.hackathons?.title ?? "Competition"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground select-all">
                        {a.judge_id}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] text-blue-500 border-blue-500/20 bg-blue-500/5"
                        >
                          Assigned
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <span className="font-semibold text-foreground">{(page - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * pageSize, totalCount)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalCount}</span> allocations
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 text-xs gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <span className="text-[11px] px-2 font-medium text-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 text-xs gap-1"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
