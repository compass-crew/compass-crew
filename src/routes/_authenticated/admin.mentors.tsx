import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Archive,
  Globe,
  Twitter,
  Linkedin,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
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

type MentorRow = Database["public"]["Tables"]["mentors"]["Row"];
type MentorAppRow = Database["public"]["Tables"]["mentor_applications"]["Row"];
type ContentStatus = Database["public"]["Enums"]["content_status"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const Route = createFileRoute("/_authenticated/admin/mentors")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Mentors — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminMentorsPage,
});

function AdminMentorsPage() {
  const [activeTab, setActiveTab] = useState("roster");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Mentors Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Industry experts roster, office-hours guidance, and candidate evaluation queue.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="roster" className="gap-2 text-xs">
            <UserCheck className="h-3.5 w-3.5" />
            Active Mentors Roster
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Applications Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <MentorsRosterTab />
        </TabsContent>

        <TabsContent value="applications">
          <MentorApplicationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Mentors Roster Tab
// ============================================================================
function MentorsRosterTab() {
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MentorRow | null>(null);
  const [inspectItem, setInspectItem] = useState<MentorRow | null>(null);
  const [deleteConfirmItem, setDeleteItem] = useState<MentorRow | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{
    mentor: MentorRow;
    nextStatus: ContentStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<ContentStatus>("published");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const loadMentors = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("mentors")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`name.ilike.%${term}%,company.ilike.%${term}%,title.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setMentors(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load mentors");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(loadMentors, 250);
    return () => clearTimeout(t);
  }, [loadMentors]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setName("");
    setTitle("");
    setCompany("");
    setAvatarUrl("");
    setExpertise("");
    setBio("");
    setLinkedin("");
    setTwitter("");
    setWebsite("");
    setStatus("published");
    setSortOrder(0);
    setFormOpen(true);
  };

  const openEdit = (m: MentorRow) => {
    setEditingItem(m);
    setName(m.name);
    setTitle(m.title ?? "");
    setCompany(m.company ?? "");
    setAvatarUrl(m.avatar_url ?? "");
    setExpertise(Array.isArray(m.expertise) ? m.expertise.join(", ") : "");
    setBio(m.bio ?? "");
    setLinkedin(m.linkedin_url ?? "");
    setTwitter(m.twitter_url ?? "");
    setWebsite(m.website_url ?? "");
    setStatus(m.status);
    setSortOrder(m.sort_order ?? 0);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Mentor name is required.");
      return;
    }

    setSaving(true);
    try {
      const expertiseArray = expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        title: title.trim() || null,
        company: company.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        expertise: expertiseArray,
        bio: bio.trim() || null,
        linkedin_url: linkedin.trim() || null,
        twitter_url: twitter.trim() || null,
        website_url: website.trim() || null,
        status,
        sort_order: Number(sortOrder) || 0,
      };

      if (editingItem) {
        const { error } = await supabase.from("mentors").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        await logAdminAction({
          action: "mentor.update",
          resourceType: "mentors",
          resourceId: editingItem.id,
          meta: { name: payload.name, status: payload.status },
        });
        toast.success("Mentor profile updated successfully.");
      } else {
        const { data, error } = await supabase.from("mentors").insert(payload).select().single();
        if (error) throw error;
        await logAdminAction({
          action: "mentor.create",
          resourceType: "mentors",
          resourceId: data.id,
          meta: { name: payload.name, status: payload.status },
        });
        toast.success("Mentor added to roster.");
      }

      setFormOpen(false);
      void loadMentors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save mentor.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (mentor: MentorRow, nextStatus: ContentStatus) => {
    if (nextStatus === "archived") {
      setStatusConfirmItem({ mentor, nextStatus });
      return;
    }

    await executeStatusUpdate(mentor, nextStatus);
  };

  const executeStatusUpdate = async (mentor: MentorRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("mentors")
        .update({ status: nextStatus })
        .eq("id", mentor.id);

      if (error) throw error;

      await logAdminAction({
        action: `mentor.status.${nextStatus}`,
        resourceType: "mentors",
        resourceId: mentor.id,
        meta: { name: mentor.name, previous_status: mentor.status, new_status: nextStatus },
      });

      toast.success(`Mentor marked as ${nextStatus}.`);
      void loadMentors();
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
        .from("mentors")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", deleteConfirmItem.id);

      if (error) throw error;

      await logAdminAction({
        action: "mentor.delete",
        resourceType: "mentors",
        resourceId: deleteConfirmItem.id,
        meta: { name: deleteConfirmItem.name },
      });

      toast.success("Mentor removed from active roster.");
      setDeleteItem(null);
      void loadMentors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete mentor");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, or title…"
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
              onClick={() => void loadMentors()}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Mentor
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
          ) : mentors.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No mentors found</p>
              <p className="mt-1 text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try clearing filters to see all enrolled mentors."
                  : "Add your first industry mentor or approve applicants from the queue."}
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
                    <th className="px-4 py-3">Mentor</th>
                    <th className="px-4 py-3">Role & Company</th>
                    <th className="px-4 py-3">Domain Expertise</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {mentors.map((m) => {
                    const initials = m.name
                      ? m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "ME";

                    return (
                      <tr key={m.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-border/60">
                              <AvatarImage src={m.avatar_url ?? undefined} alt={m.name} />
                              <AvatarFallback className="text-[10px] font-medium bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {m.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {m.linkedin_url && (
                                  <a
                                    href={m.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary transition"
                                    title="LinkedIn"
                                  >
                                    <Linkedin className="h-3 w-3" />
                                  </a>
                                )}
                                {m.twitter_url && (
                                  <a
                                    href={m.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary transition"
                                    title="Twitter / X"
                                  >
                                    <Twitter className="h-3 w-3" />
                                  </a>
                                )}
                                {m.website_url && (
                                  <a
                                    href={m.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-muted-foreground hover:text-primary transition"
                                    title="Personal Website"
                                  >
                                    <Globe className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="text-foreground/90 font-medium">{m.title ?? "—"}</div>
                          {m.company && (
                            <div className="text-[10px] text-muted-foreground">{m.company}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {Array.isArray(m.expertise) && m.expertise.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {m.expertise.slice(0, 3).map((ex) => (
                                <Badge
                                  key={ex}
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 border-border/40"
                                >
                                  {ex}
                                </Badge>
                              ))}
                              {m.expertise.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 text-muted-foreground"
                                >
                                  +{m.expertise.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              m.status === "published"
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                : m.status === "draft"
                                  ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                                  : "text-muted-foreground border-border/40"
                            }`}
                          >
                            {m.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[11px]">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInspectItem(m)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Inspect details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(m)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit profile"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Select
                              value={m.status}
                              onValueChange={(val) => handleStatusChange(m, val as ContentStatus)}
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
                              onClick={() => setDeleteItem(m)}
                              className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10"
                              title="Delete mentor"
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
                of <span className="font-semibold text-foreground">{totalCount}</span> mentors
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

      {/* Detail Inspection Dialog */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mentor Profile</DialogTitle>
            <DialogDescription>
              Public credentials and platform directory representation.
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
                      : "ME"}
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
                      "Independent Mentor"}
                  </p>
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
                    {inspectItem.website_url && (
                      <a
                        href={inspectItem.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {inspectItem.bio && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">About / Mentoring Focus</Label>
                  <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                    {inspectItem.bio}
                  </div>
                </div>
              )}

              {Array.isArray(inspectItem.expertise) && inspectItem.expertise.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Domain Expertise</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectItem.expertise.map((ex) => (
                      <Badge key={ex} variant="secondary" className="text-xs">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-md border border-border/40 bg-muted/10 p-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Record ID:</span>
                  <span className="font-mono text-foreground select-all">{inspectItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
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

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Mentor Profile" : "Add New Mentor"}</DialogTitle>
            <DialogDescription>
              Configure mentor credentials for public directories and hackathon office-hours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="mentor-name">Full Name *</Label>
              <Input
                id="mentor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Jane Smith"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mentor-title">Job Title</Label>
                <Input
                  id="mentor-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Principal Architect"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mentor-company">Company / Org</Label>
                <Input
                  id="mentor-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google DeepMind"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mentor-avatar">Avatar Image URL</Label>
              <Input
                id="mentor-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mentor-expertise">Expertise Domains (comma-separated)</Label>
              <Input
                id="mentor-expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="AI / ML, Full Stack, Product Architecture, Venture"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mentor-linkedin">LinkedIn URL</Label>
                <Input
                  id="mentor-linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mentor-twitter">Twitter / X URL</Label>
                <Input
                  id="mentor-twitter"
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mentor-website">Personal Website / Portfolio</Label>
              <Input
                id="mentor-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mentor-bio">Bio & Mentoring Focus</Label>
              <Textarea
                id="mentor-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional background, mentoring philosophy, and technical domains..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="mentor-status">Visibility Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="mentor-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published (Public)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="mentor-sort">Display Priority</Label>
                <Input
                  id="mentor-sort"
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
                {editingItem ? "Save Changes" : "Add Mentor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Status Confirmation Dialog */}
      <AlertDialog
        open={!!statusConfirmItem}
        onOpenChange={(open) => !open && setStatusConfirmItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Mentor Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{statusConfirmItem?.mentor.name}</strong>?
              Archived mentors are removed from public listings and active platform directories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusConfirmItem) {
                  void executeStatusUpdate(statusConfirmItem.mentor, statusConfirmItem.nextStatus);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Archive Mentor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Mentor from Roster?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteConfirmItem?.name}</strong>? This action
              will remove them from the active mentors directory.
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
// Mentor Applications Queue Tab
// ============================================================================
function MentorApplicationsTab() {
  const [apps, setApps] = useState<MentorAppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [selectedApp, setSelectedApp] = useState<MentorAppRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [busy, setBusy] = useState(false);

  // Confirmation state for approve/reject
  const [confirmDialog, setConfirmDialog] = useState<{
    app: MentorAppRow;
    action: "approve" | "reject";
  } | null>(null);

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("mentor_applications")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ApplicationStatus);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setApps(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load mentor applications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(loadApps, 250);
    return () => clearTimeout(t);
  }, [loadApps]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const executeStatusMutation = async (app: MentorAppRow, nextStatus: ApplicationStatus) => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("mentor_applications")
        .update({
          status: nextStatus,
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", app.id);

      if (error) throw error;

      await logAdminAction({
        action: `mentor_application.${nextStatus}`,
        resourceType: "mentor_applications",
        resourceId: app.id,
        meta: { status: nextStatus, applicant: app.full_name, email: app.email },
      });

      // If approved, automatically enroll in mentors table
      if (nextStatus === "approved") {
        const { error: mentorErr } = await supabase.from("mentors").insert({
          name: app.full_name,
          title: app.job_title,
          company: app.company,
          linkedin_url: app.linkedin_url,
          expertise: Array.isArray(app.expertise) ? app.expertise : [],
          bio: app.motivation,
          status: "published",
        });

        if (mentorErr) {
          console.error("Failed to auto-insert mentor:", mentorErr);
          toast.warning("Application approved, but manual roster entry required.");
        } else {
          // If submitted_by exists, assign mentor role in user_roles
          if (app.submitted_by) {
            await supabase.from("user_roles").upsert(
              {
                user_id: app.submitted_by,
                role: "mentor" as const,
              },
              { onConflict: "user_id,role" },
            );
          }
        }
      }

      toast.success(
        nextStatus === "approved"
          ? "Application approved and mentor added to active roster."
          : `Application marked as ${nextStatus}.`,
      );

      setSelectedApp(null);
      setConfirmDialog(null);
      setAdminNotes("");
      void loadApps();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidate by name, email, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadApps()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : apps.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No applications found</p>
              <p className="mt-1 text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try resetting filter parameters."
                  : "No mentor applications currently in queue."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Role / Company</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {apps.map((a) => (
                    <tr key={a.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{a.full_name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{a.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="text-foreground/90 font-medium">{a.job_title ?? "—"}</div>
                        {a.company && <div className="text-[10px]">{a.company}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.years_experience ? `${a.years_experience} yrs` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            a.status === "approved"
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                              : a.status === "rejected"
                                ? "text-rose-500 border-rose-500/20 bg-rose-500/5"
                                : a.status === "reviewing"
                                  ? "text-blue-500 border-blue-500/20 bg-blue-500/5"
                                  : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                          }`}
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(a);
                            setAdminNotes(a.admin_notes ?? "");
                          }}
                          className="h-7 text-xs gap-1"
                        >
                          Review →
                        </Button>
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
                of <span className="font-semibold text-foreground">{totalCount}</span> applications
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

      {/* Application Evaluation Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluate Mentor Application</DialogTitle>
            <DialogDescription>
              Review candidate credentials for {selectedApp?.full_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Candidate:</span>
                  <span className="font-semibold text-foreground">{selectedApp.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedApp.email}</span>
                </div>
                {selectedApp.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{selectedApp.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Position:</span>
                  <span className="text-foreground">
                    {[selectedApp.job_title, selectedApp.company].filter(Boolean).join(" at ") ||
                      "—"}
                  </span>
                </div>
                {selectedApp.years_experience && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="text-foreground">{selectedApp.years_experience} years</span>
                  </div>
                )}
                {selectedApp.linkedin_url && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LinkedIn:</span>
                    <a
                      href={selectedApp.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Profile <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {Array.isArray(selectedApp.expertise) && selectedApp.expertise.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Specialization Areas</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedApp.expertise.map((ex) => (
                      <Badge key={ex} variant="secondary" className="text-[10px]">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Motivation & Mentoring Philosophy</Label>
                <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                  {selectedApp.motivation}
                </div>
              </div>

              {selectedApp.availability && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Availability / Commitment</Label>
                  <div className="rounded-md border border-border/40 bg-card p-2.5 text-muted-foreground">
                    {selectedApp.availability}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="app-notes" className="text-xs font-semibold">
                  Administrative Notes
                </Label>
                <Textarea
                  id="app-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record evaluation feedback, office-hours alignment, or screening notes..."
                  rows={2}
                />
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void executeStatusMutation(selectedApp, "reviewing")}
                    disabled={busy || selectedApp.status === "reviewing"}
                    className="text-xs"
                  >
                    Mark Reviewing
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDialog({ app: selectedApp, action: "reject" })}
                    disabled={busy}
                    className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 text-xs"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setConfirmDialog({ app: selectedApp, action: "approve" })}
                    disabled={busy}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve & Add to Roster
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Approve/Reject Confirmation Alert Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "approve"
                ? "Approve Mentor Application?"
                : "Reject Mentor Application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "approve" ? (
                <>
                  Approving{" "}
                  <strong className="text-foreground">{confirmDialog?.app.full_name}</strong> will
                  mark their application as approved, enroll them into the active mentors roster,
                  and grant them the mentor role.
                </>
              ) : (
                <>
                  Are you sure you want to reject the application from{" "}
                  <strong className="text-foreground">{confirmDialog?.app.full_name}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog) {
                  void executeStatusMutation(
                    confirmDialog.app,
                    confirmDialog.action === "approve" ? "approved" : "rejected",
                  );
                }
              }}
              disabled={busy}
              className={
                confirmDialog?.action === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              {confirmDialog?.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
