import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Users2,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Megaphone,
  Pin,
  PinOff,
  Trash2,
  Plus,
  Edit2,
  Archive,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import type { Database } from "@/integrations/supabase/types";

type NewsletterRow = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
type AnnouncementRow = Database["public"]["Tables"]["site_announcements"]["Row"];
type ContentStatus = Database["public"]["Enums"]["content_status"];

interface TeamRowItem {
  id: string;
  name: string;
  tagline: string | null;
  is_locked: boolean;
  created_at: string;
  hackathons: { title: string } | null;
}

export const Route = createFileRoute("/_authenticated/admin/community")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Community — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminCommunityPage,
});

function AdminCommunityPage() {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Community Governance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Site announcements, team directories, and subscriber channels.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="announcements">Site Announcements</TabsTrigger>
          <TabsTrigger value="teams">Teams Directory</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsTab />
        </TabsContent>

        <TabsContent value="newsletter">
          <NewsletterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Teams Tab
// ----------------------------------------------------------------------------
function TeamsTab() {
  const [teams, setTeams] = useState<TeamRowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("id, name, tagline, is_locked, created_at, hackathons(title)")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        setTeams(data ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No teams created yet across platform hackathons.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">Competition</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {teams.map((t) => (
                  <tr key={t.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {t.name}
                      {t.tagline && (
                        <div className="text-[10px] text-muted-foreground">{t.tagline}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.hackathons?.title ?? "General"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={t.is_locked ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {t.is_locked ? "Locked" : "Forming"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Newsletter Tab
// ----------------------------------------------------------------------------
function NewsletterTab() {
  const [subs, setSubs] = useState<NewsletterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setSubs(data ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load subscribers");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No newsletter subscribers recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Subscriber Email</th>
                  <th className="px-4 py-3">Subscribed At</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {subs.map((s) => (
                  <tr key={s.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          s.unsubscribed_at ? "text-muted-foreground" : "text-emerald-500"
                        }`}
                      >
                        {s.unsubscribed_at ? "unsubscribed" : "subscribed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Site Announcements Tab
// ----------------------------------------------------------------------------

function AnnouncementsTab() {
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pinned, setPinned] = useState(false);
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState<ContentStatus>("published");

  // Alert Dialog
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  });

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("site_announcements")
        .select("*")
        .is("deleted_at", null)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
      }

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      const { data, error } = await q;
      if (error) throw error;
      setItems(data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadAnnouncements();
    }, 200);
    return () => clearTimeout(t);
  }, [loadAnnouncements]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitle("");
    setBody("");
    setLinkLabel("");
    setLinkUrl("");
    setPinned(false);
    setAudience("all");
    setStatus("published");
    setDialogOpen(true);
  };

  const openEditDialog = (item: AnnouncementRow) => {
    setEditingItem(item);
    setTitle(item.title);
    setBody(item.body);
    setLinkLabel(item.link_label ?? "");
    setLinkUrl(item.link_url ?? "");
    setPinned(item.pinned);
    setAudience(item.audience ?? "all");
    setStatus(item.status);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        link_label: linkLabel.trim() || null,
        link_url: linkUrl.trim() || null,
        pinned,
        audience,
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

        toast.success("Announcement updated.");
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
          meta: { title: payload.title },
        });

        toast.success("Announcement published.");
      }

      setDialogOpen(false);
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (item: AnnouncementRow) => {
    try {
      const nextPinned = !item.pinned;
      const { error } = await supabase
        .from("site_announcements")
        .update({ pinned: nextPinned })
        .eq("id", item.id);
      if (error) throw error;

      await logAdminAction({
        action: nextPinned ? "announcement.pin" : "announcement.unpin",
        resourceType: "site_announcements",
        resourceId: item.id,
        meta: { title: item.title },
      });

      toast.success(nextPinned ? "Announcement pinned." : "Announcement unpinned.");
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle pin.");
    }
  };

  const handleStatusChange = async (item: AnnouncementRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("site_announcements")
        .update({
          status: nextStatus,
          published_at: nextStatus === "published" ? new Date().toISOString() : item.published_at,
        })
        .eq("id", item.id);
      if (error) throw error;

      await logAdminAction({
        action: `announcement.status.${nextStatus}`,
        resourceType: "site_announcements",
        resourceId: item.id,
        meta: { from: item.status, to: nextStatus, title: item.title },
      });

      toast.success(`Announcement marked as ${nextStatus}.`);
      void loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleDelete = (item: AnnouncementRow) => {
    setAlertState({
      open: true,
      title: "Delete Announcement?",
      description: `Permanently remove "${item.title}" from site announcements?`,
      action: async () => {
        try {
          const { error } = await supabase
            .from("site_announcements")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", item.id);
          if (error) throw error;

          await logAdminAction({
            action: "announcement.delete",
            resourceType: "site_announcements",
            resourceId: item.id,
            meta: { title: item.title },
          });

          toast.success("Announcement deleted.");
          void loadAnnouncements();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to delete announcement.");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="pl-9 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={openCreateDialog}
          size="sm"
          className="gap-1.5 text-xs bg-gradient-brand text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          New Announcement
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No announcements match your filter. Click "New Announcement" to publish one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">Pin</th>
                    <th className="px-4 py-3">Title & Content</th>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="w-20 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item) => (
                    <tr key={item.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => void togglePin(item)}
                          title={item.pinned ? "Unpin announcement" : "Pin announcement"}
                          className={`rounded p-1 transition ${
                            item.pinned
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {item.pinned ? (
                            <Pin className="h-4 w-4" />
                          ) : (
                            <PinOff className="h-4 w-4 opacity-40" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {item.title}
                          {item.link_url && (
                            <a
                              href={item.link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline inline-flex items-center text-[10px]"
                            >
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-muted-foreground text-[11px]">
                          {item.body}
                        </p>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {item.audience}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`capitalize text-[10px] ${
                            item.status === "published"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                              : item.status === "draft"
                                ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                                : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void togglePin(item)}>
                              {item.pinned ? (
                                <>
                                  <PinOff className="mr-2 h-3.5 w-3.5" />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="mr-2 h-3.5 w-3.5" />
                                  Pin to Top
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {item.status !== "published" && (
                              <DropdownMenuItem
                                onClick={() => void handleStatusChange(item, "published")}
                              >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {item.status !== "draft" && (
                              <DropdownMenuItem
                                onClick={() => void handleStatusChange(item, "draft")}
                              >
                                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                Mark Draft
                              </DropdownMenuItem>
                            )}
                            {item.status !== "archived" && (
                              <DropdownMenuItem
                                onClick={() => void handleStatusChange(item, "archived")}
                              >
                                <Archive className="mr-2 h-3.5 w-3.5 text-rose-500" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Announcement" : "New Community Announcement"}
            </DialogTitle>
            <DialogDescription>
              Broadcast platform updates, registration reminders, and opportunities across the
              Community portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="ann-title">Title *</Label>
              <Input
                id="ann-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Registrations now live for NextGen Hackathon"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ann-body">Announcement Text *</Label>
              <Textarea
                id="ann-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Details of the announcement displayed to members..."
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="ann-label">Link Label (Optional)</Label>
                <Input
                  id="ann-label"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="e.g. Learn more / Register"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ann-url">Link URL (Optional)</Label>
                <Input
                  id="ann-url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="ann-aud">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="ann-aud">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students & Builders</SelectItem>
                    <SelectItem value="community">Campus Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ann-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="ann-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published (Live)</SelectItem>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="ann-pin"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="ann-pin" className="cursor-pointer font-normal">
                Pin to top of public Community page
              </Label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gradient-brand text-white">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingItem ? "Save Changes" : "Publish Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState((p) => ({ ...p, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void alertState.action()}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
