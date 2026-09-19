import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  Plus,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Archive,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Video,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import { slugify } from "@/lib/admin-api";
import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["site_events"]["Row"];
type EventKind = Database["public"]["Enums"]["event_kind"];
type EventMode = Database["public"]["Enums"]["event_mode"];
type ContentStatus = Database["public"]["Enums"]["content_status"];

export const Route = createFileRoute("/_authenticated/admin/events")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Events — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminEventsPage,
});

const PAGE_SIZE = 15;

const STATUS_BADGES: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-muted", text: "text-muted-foreground" },
  scheduled: { label: "Scheduled", bg: "bg-amber-500/10", text: "text-amber-500" },
  published: { label: "Published", bg: "bg-emerald-500/10", text: "text-emerald-500" },
  archived: { label: "Archived", bg: "bg-rose-500/10", text: "text-rose-500" },
};

function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Modal form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [kind, setKind] = useState<EventKind>("workshop");
  const [mode, setMode] = useState<EventMode>("online");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [regUrl, setRegUrl] = useState("");
  const [status, setStatus] = useState<ContentStatus>("draft");

  // Confirmation Alert Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
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

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("site_events")
        .select("*", { count: "exact" })
        .order("starts_at", { ascending: false, nullsFirst: false });

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`title.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`);
      }

      if (kindFilter !== "all") {
        q = q.eq("kind", kindFilter as EventKind);
      }

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setEvents(data ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [search, kindFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadEvents();
    }, 200);
    return () => clearTimeout(t);
  }, [loadEvents]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setBodyMd("");
    setBannerUrl("");
    setKind("workshop");
    setMode("online");
    setLocation("");
    setStartsAt("");
    setEndsAt("");
    setRegUrl("");
    setStatus("draft");
    setFormOpen(true);
  };

  const openEditDialog = (item: EventRow) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description ?? "");
    setBodyMd(item.body_md ?? "");
    setBannerUrl(item.banner_url ?? "");
    setKind(item.kind);
    setMode(item.mode);
    setLocation(item.location ?? "");
    setStartsAt(item.starts_at ? item.starts_at.slice(0, 16) : "");
    setEndsAt(item.ends_at ? item.ends_at.slice(0, 16) : "");
    setRegUrl(item.registration_url ?? "");
    setStatus(item.status);
    setFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingItem) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Event title and URL slug are required.");
      return;
    }

    if (startsAt && endsAt) {
      const startTs = new Date(startsAt).getTime();
      const endTs = new Date(endsAt).getTime();
      if (endTs < startTs) {
        toast.error("Event end date/time must be after the start date/time.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        body_md: bodyMd.trim() || null,
        banner_url: bannerUrl.trim() || null,
        kind,
        mode,
        location: location.trim() || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        registration_url: regUrl.trim() || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("site_events")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;

        await logAdminAction({
          action: "event.update",
          resourceType: "site_events",
          resourceId: editingItem.id,
          meta: { title: payload.title, status: payload.status },
        });

        toast.success("Event updated successfully.");
      } else {
        const { data, error } = await supabase
          .from("site_events")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        await logAdminAction({
          action: "event.create",
          resourceType: "site_events",
          resourceId: data.id,
          meta: { title: payload.title, kind: payload.kind },
        });

        toast.success("Event created successfully.");
      }

      setFormOpen(false);
      void loadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const promptStatusChange = (item: EventRow, nextStatus: ContentStatus) => {
    setConfirmDialog({
      open: true,
      title: `Update Status to ${nextStatus}?`,
      description: `Transition event "${item.title}" to status "${nextStatus}".`,
      action: async () => {
        try {
          const { error } = await supabase
            .from("site_events")
            .update({
              status: nextStatus,
              published_at:
                nextStatus === "published" ? new Date().toISOString() : item.published_at,
            })
            .eq("id", item.id);

          if (error) throw error;

          await logAdminAction({
            action: `event.status.${nextStatus}`,
            resourceType: "site_events",
            resourceId: item.id,
            meta: { from: item.status, to: nextStatus, title: item.title },
          });

          toast.success(`Event status updated to ${nextStatus}.`);
          void loadEvents();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to update status.");
        }
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Events Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data foundation for workshops, webinars, bootcamps, and platform meetups.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </header>

      {/* Filters */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events by title or description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={kindFilter}
            onValueChange={(val) => {
              setKindFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="bootcamp">Bootcamp</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="ama">AMA</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-base font-semibold text-foreground">No events recorded</p>
              <p className="text-xs">Spin up an event to prepare the upcoming events directory.</p>
              <Button
                onClick={openCreateDialog}
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Event
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Event Title</th>
                    <th className="px-4 py-3">Format / Mode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Registration</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {events.map((e) => {
                    const statusBadge = STATUS_BADGES[e.status];
                    return (
                      <tr key={e.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{e.title}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            /{e.slug}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {e.kind}
                          </Badge>
                          <div className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                            {e.mode}
                            {e.location && ` · ${e.location}`}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {e.starts_at ? (
                            <div>{new Date(e.starts_at).toLocaleString()}</div>
                          ) : (
                            <div>No date set</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {e.registration_url ? (
                            <a
                              href={e.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <span>Link</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/events/${e.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center"
                                >
                                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                  View Public Page
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(e)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {e.status !== "published" && (
                                <DropdownMenuItem
                                  onClick={() => promptStatusChange(e, "published")}
                                >
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                  Publish Event
                                </DropdownMenuItem>
                              )}
                              {e.status !== "draft" && (
                                <DropdownMenuItem onClick={() => promptStatusChange(e, "draft")}>
                                  <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                  Revert to Draft
                                </DropdownMenuItem>
                              )}
                              {e.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => promptStatusChange(e, "archived")}
                                  className="text-rose-500 focus:text-rose-500"
                                >
                                  <Archive className="mr-2 h-3.5 w-3.5" />
                                  Archive Event
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing page {page} of {totalPages} ({total} total)
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Event" : "Create New Event"}</DialogTitle>
            <DialogDescription>
              Configure the schedule, workshop format, and registration details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-title">Title *</Label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Agentic Systems with Deep Learning Workshop"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-slug">URL Slug *</Label>
                <Input
                  id="event-slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="agentic-systems-deep-learning-workshop"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-kind">Format</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as EventKind)}>
                  <SelectTrigger id="event-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="ama">AMA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-mode">Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as EventMode)}>
                  <SelectTrigger id="event-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="event-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-location">Location / Stream URL</Label>
                <Input
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Zoom / YouTube Live link or physical venue"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-starts">Starts At</Label>
                <Input
                  id="event-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-ends">Ends At</Label>
                <Input
                  id="event-ends"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-reg">Registration URL</Label>
                <Input
                  id="event-reg"
                  type="url"
                  value={regUrl}
                  onChange={(e) => setRegUrl(e.target.value)}
                  placeholder="https://lu.ma/example or Google Form"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-banner">Cover Image URL</Label>
                <Input
                  id="event-banner"
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or media path"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-desc">Short Summary</Label>
                <Textarea
                  id="event-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short summary displayed on event cards..."
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="event-body">Detailed Content (Markdown)</Label>
                <Textarea
                  id="event-body"
                  value={bodyMd}
                  onChange={(e) => setBodyMd(e.target.value)}
                  rows={5}
                  placeholder="Full event overview, mentors/speakers, agenda, prerequisites, learning outcomes in Markdown..."
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingItem ? "Save Changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((p) => ({ ...p, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void confirmDialog.action();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
