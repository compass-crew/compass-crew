import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  FileText,
  Megaphone,
  LayoutTemplate,
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Pin,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Archive,
  AlertTriangle,
  Globe,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import { safeExternalUrl } from "@/lib/safe-redirect";
import type { Database } from "@/integrations/supabase/types";

type AnnouncementRow = Database["public"]["Tables"]["site_announcements"]["Row"];
type AnnouncementAudience = Database["public"]["Enums"]["announcement_audience"];
type ContentStatus = Database["public"]["Enums"]["content_status"];
type HomepageSectionRow = Database["public"]["Tables"]["cms_homepage_sections"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/content")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Content Management — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminContentPage,
});

function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Content Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Broadcast platform announcements, control dynamic landing page section copy, and manage
            editorial publications.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/60">
          <TabsTrigger value="announcements" className="gap-2 text-xs">
            <Megaphone className="h-3.5 w-3.5" />
            <span>Site Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="homepage" className="gap-2 text-xs">
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>Homepage Sections</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="gap-2 text-xs">
            <Newspaper className="h-3.5 w-3.5" />
            <span>Editorial Posts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="outline-none">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="homepage" className="outline-none">
          <HomepageSectionsTab />
        </TabsContent>

        <TabsContent value="blog" className="outline-none">
          <BlogPostsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Announcements Tab
// ----------------------------------------------------------------------------
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AnnouncementRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<AnnouncementRow | null>(null);
  const [editingItem, setEditingItem] = useState<AnnouncementRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [pinned, setPinned] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [status, setStatus] = useState<ContentStatus>("published");

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("site_announcements")
        .select("*", { count: "exact" })
        .is("deleted_at", null);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as ContentStatus);
      }

      if (audienceFilter !== "all") {
        query = query.eq("audience", audienceFilter);
      }

      if (searchQuery.trim()) {
        const term = searchQuery.trim();
        query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setAnnouncements(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, audienceFilter, searchQuery]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const openCreate = () => {
    setEditingItem(null);
    setTitle("");
    setBody("");
    setAudience("all");
    setPinned(false);
    setLinkUrl("");
    setLinkLabel("");
    setStatus("published");
    setFormOpen(true);
  };

  const openEdit = (a: AnnouncementRow) => {
    setEditingItem(a);
    setTitle(a.title);
    setBody(a.body);
    setAudience((a.audience as AnnouncementAudience) ?? "all");
    setPinned(a.pinned);
    setLinkUrl(a.link_url ?? "");
    setLinkLabel(a.link_label ?? "");
    setStatus(a.status);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Announcement title and message body are required.");
      return;
    }

    let sanitizedUrl: string | null = null;
    if (linkUrl.trim()) {
      const checked = safeExternalUrl(linkUrl.trim());
      if (!checked && !linkUrl.trim().startsWith("/")) {
        toast.error("Invalid link URL. Must start with http://, https://, or a valid path.");
        return;
      }
      sanitizedUrl = linkUrl.trim();
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        audience,
        pinned,
        link_url: sanitizedUrl,
        link_label: linkLabel.trim() || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("site_announcements")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;

        await logAdminAction({
          action: "announcement.update",
          resourceType: "site_announcements",
          resourceId: editingItem.id,
          meta: { title: payload.title, status: payload.status },
        });
        toast.success("Announcement updated successfully.");
      } else {
        const { data, error } = await supabase
          .from("site_announcements")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        await logAdminAction({
          action: "announcement.create",
          resourceType: "site_announcements",
          resourceId: data.id,
          meta: { title: payload.title, status: payload.status },
        });
        toast.success("Announcement created.");
      }

      setFormOpen(false);
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (a: AnnouncementRow) => {
    try {
      const nextPinned = !a.pinned;
      const { error } = await supabase
        .from("site_announcements")
        .update({ pinned: nextPinned })
        .eq("id", a.id);
      if (error) throw error;

      await logAdminAction({
        action: "announcement.pin_toggle",
        resourceType: "site_announcements",
        resourceId: a.id,
        meta: { pinned: nextPinned, title: a.title },
      });

      toast.success(nextPinned ? "Announcement pinned to top." : "Announcement unpinned.");
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle pin");
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("site_announcements")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", deleteItem.id);
      if (error) throw error;

      await logAdminAction({
        action: "announcement.delete",
        resourceType: "site_announcements",
        resourceId: deleteItem.id,
        meta: { title: deleteItem.title },
      });

      toast.success("Announcement removed.");
      setDeleteItem(null);
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove announcement");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-8 text-xs bg-card/60"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs bg-card/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={audienceFilter}
            onValueChange={(val) => {
              setAudienceFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs bg-card/60">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Audiences</SelectItem>
              <SelectItem value="all">Everyone (all)</SelectItem>
              <SelectItem value="participants">Participants</SelectItem>
              <SelectItem value="teams">Teams</SelectItem>
              <SelectItem value="judges">Judges</SelectItem>
              <SelectItem value="mentors">Mentors</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all" || audienceFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setAudienceFilter("all");
                setPage(1);
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAnnouncements()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs bg-card/60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Announcement
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">No announcements found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all" || audienceFilter !== "all"
                  ? "Try resetting your search or filter parameters."
                  : "Create an announcement to broadcast urgent news across the platform."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Announcement</th>
                    <th className="px-4 py-3">Target Audience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Pin</th>
                    <th className="px-4 py-3">Published / Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {announcements.map((a) => (
                    <tr key={a.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {a.pinned && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10"
                            >
                              Pinned
                            </Badge>
                          )}
                          <span className="font-semibold text-foreground">{a.title}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                          {a.body}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {a.audience}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            a.status === "published"
                              ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                              : a.status === "draft"
                                ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                                : "text-muted-foreground"
                          }`}
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePin(a)}
                          title={a.pinned ? "Unpin announcement" : "Pin to top"}
                          className={`h-7 w-7 rounded-md ${
                            a.pinned
                              ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                              : "text-muted-foreground/40 hover:text-foreground"
                          }`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Draft"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewItem(a)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Preview broadcast banner"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(a)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit announcement"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(a)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Remove announcement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {!loading && announcements.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} announcements
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs font-mono px-1">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-primary" />
              Announcement Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Live simulation of how users experience this announcement on the platform.
            </DialogDescription>
          </DialogHeader>

          {previewItem && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/80 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {previewItem.pinned && (
                      <Badge
                        variant="outline"
                        className="text-[9px] border-amber-500/40 text-amber-500 bg-amber-500/10"
                      >
                        Pinned Announcement
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[9px] capitalize">
                      Audience: {previewItem.audience}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] capitalize ${
                      previewItem.status === "published"
                        ? "text-emerald-500 border-emerald-500/30"
                        : "text-amber-500 border-amber-500/30"
                    }`}
                  >
                    {previewItem.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-1">{previewItem.title}</h3>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {previewItem.body}
                </p>

                {previewItem.link_url && (
                  <div className="mt-3 pt-3 border-t border-border/40 flex justify-end">
                    <Button asChild size="sm" className="h-7 text-xs gap-1">
                      <a
                        href={safeExternalUrl(previewItem.link_url) || previewItem.link_url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {previewItem.link_label || "Learn More"}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                <div>
                  <strong>Record ID:</strong> <span className="font-mono">{previewItem.id}</span>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(previewItem.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Published:</strong>{" "}
                  {previewItem.published_at
                    ? new Date(previewItem.published_at).toLocaleString()
                    : "Not published"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
            <DialogDescription>Broadcast a banner update across the platform.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="announce-title">Headline *</Label>
              <Input
                id="announce-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Genesis AI Hackathon Registrations Now Open!"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="announce-body">Message Body *</Label>
              <Textarea
                id="announce-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Detailed announcement copy..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="announce-aud">Audience</Label>
                <Select
                  value={audience}
                  onValueChange={(v) => setAudience(v as AnnouncementAudience)}
                >
                  <SelectTrigger id="announce-aud">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                    <SelectItem value="teams">Teams</SelectItem>
                    <SelectItem value="judges">Judges</SelectItem>
                    <SelectItem value="mentors">Mentors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="announce-stat">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="announce-stat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="announce-url">CTA Link URL</Label>
                <Input
                  id="announce-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... or /path"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="announce-lbl">CTA Label</Label>
                <Input
                  id="announce-lbl"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Register Now →"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="announce-pin"
                checked={pinned}
                onCheckedChange={(c) => setPinned(Boolean(c))}
              />
              <Label htmlFor="announce-pin" className="cursor-pointer text-xs">
                Pin to top of active announcements
              </Label>
            </div>

            <DialogFooter className="pt-3">
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
                {editingItem ? "Save Announcement" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteItem)} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Remove Announcement?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{deleteItem?.title}"</strong>? It will no
              longer be visible to any platform visitors or users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Homepage Sections Tab
// ----------------------------------------------------------------------------
function HomepageSectionsTab() {
  const [sections, setSections] = useState<HomepageSectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSectionRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const loadSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cms_homepage_sections")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setSections(data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  const openEdit = (sec: HomepageSectionRow) => {
    setEditingSection(sec);
    setTitle(sec.title ?? "");
    setSubtitle(sec.subtitle ?? "");
    setBody(sec.body ?? "");
    setCtaLabel(sec.cta_label ?? "");
    setCtaUrl(sec.cta_url ?? "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    let sanitizedCtaUrl: string | null = null;
    if (ctaUrl.trim()) {
      const checked = safeExternalUrl(ctaUrl.trim());
      if (!checked && !ctaUrl.trim().startsWith("/")) {
        toast.error("Invalid CTA URL. Must start with http://, https://, or a valid path.");
        return;
      }
      sanitizedCtaUrl = ctaUrl.trim();
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        body: body.trim() || null,
        cta_label: ctaLabel.trim() || null,
        cta_url: sanitizedCtaUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("cms_homepage_sections")
        .update(payload)
        .eq("id", editingSection.id);

      if (error) throw error;

      await logAdminAction({
        action: "homepage_section.update",
        resourceType: "cms_homepage_sections",
        resourceId: editingSection.id,
        meta: { key: editingSection.key, title: payload.title },
      });

      toast.success(`Section "${editingSection.key}" copy updated.`);
      setEditingSection(null);
      void loadSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (sec: HomepageSectionRow) => {
    try {
      const nextEnabled = !sec.enabled;
      const { error } = await supabase
        .from("cms_homepage_sections")
        .update({ enabled: nextEnabled })
        .eq("id", sec.id);

      if (error) throw error;

      await logAdminAction({
        action: "homepage_section.toggle_enabled",
        resourceType: "cms_homepage_sections",
        resourceId: sec.id,
        meta: { key: sec.key, enabled: nextEnabled },
      });

      toast.success(`Section "${sec.title ?? sec.key}" ${nextEnabled ? "enabled" : "disabled"}.`);
      void loadSections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle section");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Configure marketing copy, call-to-action endpoints, and visibility toggles for high-value
          landing page narrative blocks.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadSections()}
          disabled={loading}
          className="h-8 gap-1.5 text-xs bg-card/60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sections.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No homepage sections registered in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Section Identifier</th>
                    <th className="px-4 py-3">Heading / Subtitle</th>
                    <th className="px-4 py-3">CTA Destination</th>
                    <th className="px-4 py-3 text-center">Display Order</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sections.map((s) => (
                    <tr key={s.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{s.key}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{s.title ?? "—"}</div>
                        {s.subtitle && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-sm">
                            {s.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.cta_label ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-medium text-foreground">{s.cta_label}</span>
                            {s.cta_url && (
                              <span className="text-muted-foreground font-mono text-[10px]">
                                ({s.cta_url})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground font-mono">
                        {s.sort_order ?? 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={s.enabled}
                          onCheckedChange={() => toggleEnabled(s)}
                          aria-label={`Toggle ${s.key}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(s)}
                          className="h-7 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit Copy
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Section Modal */}
      <Dialog
        open={Boolean(editingSection)}
        onOpenChange={(open) => !open && setEditingSection(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Homepage Section</DialogTitle>
            <DialogDescription>
              Configure copy for section key <code>{editingSection?.key}</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="sec-title">Section Title</Label>
              <Input
                id="sec-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Section heading"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sec-subtitle">Subtitle</Label>
              <Input
                id="sec-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Secondary tagline"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sec-body">Body Copy</Label>
              <Textarea
                id="sec-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Supporting description or bullet text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sec-cta-label">CTA Button Label</Label>
                <Input
                  id="sec-cta-label"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="e.g. Explore Tracks"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sec-cta-url">CTA Destination URL</Label>
                <Input
                  id="sec-cta-url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://... or /hackathons"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSection(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Blog Posts Tab
// ----------------------------------------------------------------------------
function BlogPostsTab() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewPost, setPreviewPost] = useState<BlogPostRow | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .is("deleted_at", null);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as ContentStatus);
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (searchQuery.trim()) {
        const term = searchQuery.trim();
        query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,slug.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setPosts(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load editorial posts");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const updatePostStatus = async (post: BlogPostRow, newStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          status: newStatus,
          published_at: newStatus === "published" ? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);

      if (error) throw error;

      await logAdminAction({
        action: "blog_post.status_update",
        resourceType: "blog_posts",
        resourceId: post.id,
        meta: { previousStatus: post.status, newStatus, title: post.title },
      });

      toast.success(`Post status updated to ${newStatus}.`);
      void loadPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update post status");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search editorial posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-8 text-xs bg-card/60"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs bg-card/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setPage(1);
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadPosts()}
          disabled={loading}
          className="h-8 gap-1.5 text-xs bg-card/60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">No editorial posts found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try resetting your search or filter parameters."
                  : "Editorial posts will appear here once drafted or published."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Article Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Read Time</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {posts.map((p) => (
                    <tr key={p.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <div>{p.title}</div>
                        <div className="font-mono text-[10px] text-muted-foreground font-normal">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.category ?? "General"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={p.status}
                          onValueChange={(val) => updatePostStatus(p, val as ContentStatus)}
                        >
                          <SelectTrigger className="h-6 w-[100px] text-[10px] capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.reading_minutes ? `${p.reading_minutes} min read` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString() : "Draft"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewPost(p)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Inspect post details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {!loading && posts.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} posts
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs font-mono px-1">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Post Modal */}
      <Dialog open={Boolean(previewPost)} onOpenChange={(open) => !open && setPreviewPost(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-4 w-4 text-primary" />
              Post Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review editorial content metadata and publication status.
            </DialogDescription>
          </DialogHeader>

          {previewPost && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {previewPost.category ?? "General"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      previewPost.status === "published"
                        ? "text-emerald-500 border-emerald-500/30"
                        : "text-amber-500 border-amber-500/30"
                    }`}
                  >
                    {previewPost.status}
                  </Badge>
                  {previewPost.reading_minutes && (
                    <span className="text-muted-foreground text-[11px]">
                      {previewPost.reading_minutes} min read
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">{previewPost.title}</h3>
                <p className="font-mono text-[11px] text-primary">/{previewPost.slug}</p>
              </div>

              {previewPost.excerpt && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="font-semibold text-foreground mb-1">Excerpt</div>
                  <p className="text-muted-foreground leading-relaxed">{previewPost.excerpt}</p>
                </div>
              )}

              {previewPost.body_md && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 max-h-48 overflow-y-auto">
                  <div className="font-semibold text-foreground mb-1">Markdown Body</div>
                  <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">
                    {previewPost.body_md}
                  </pre>
                </div>
              )}

              <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                <div>
                  <strong>Record ID:</strong> <span className="font-mono">{previewPost.id}</span>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(previewPost.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Published:</strong>{" "}
                  {previewPost.published_at
                    ? new Date(previewPost.published_at).toLocaleString()
                    : "Not published"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPreviewPost(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
