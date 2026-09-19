import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Tag,
  Calendar,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import { slugify } from "@/lib/admin-api";
import { safeExternalUrl } from "@/lib/safe-redirect";
import type { Database } from "@/integrations/supabase/types";

type ResourceRow = Database["public"]["Tables"]["resources"]["Row"];
type ContentStatus = Database["public"]["Enums"]["content_status"];

export const Route = createFileRoute("/_authenticated/admin/resources")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Resources — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminResourcesPage,
});

const RESOURCE_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "ml", label: "Machine Learning" },
  { value: "data", label: "Data Science" },
  { value: "web", label: "Web Development" },
  { value: "oss", label: "Open Source" },
  { value: "hackathons", label: "Hackathons" },
  { value: "career", label: "Career & Interview" },
  { value: "startup", label: "Startup & Innovation" },
  { value: "templates", label: "Starter Templates" },
];

function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceRow | null>(null);
  const [inspectItem, setInspectItem] = useState<ResourceRow | null>(null);
  const [deleteConfirmItem, setDeleteItem] = useState<ResourceRow | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{
    resource: ResourceRow;
    nextStatus: ContentStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ai");
  const [tagsInput, setTagsInput] = useState("");
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isExternal, setIsExternal] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<ContentStatus>("published");

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("resources")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      if (categoryFilter !== "all") {
        q = q.eq("category", categoryFilter);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(
          `title.ilike.%${term}%,description.ilike.%${term}%,slug.ilike.%${term}%,category.ilike.%${term}%`,
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setResources(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(loadResources, 250);
    return () => clearTimeout(t);
  }, [loadResources]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("ai");
    setTagsInput("");
    setUrl("");
    setDownloadUrl("");
    setCoverUrl("");
    setIsExternal(true);
    setSortOrder(0);
    setStatus("published");
    setFormOpen(true);
  };

  const openEdit = (r: ResourceRow) => {
    setEditingItem(r);
    setTitle(r.title);
    setSlug(r.slug);
    setDescription(r.description ?? "");
    setCategory(r.category);
    setTagsInput((r.tags ?? []).join(", "));
    setUrl(r.url ?? "");
    setDownloadUrl(r.download_url ?? "");
    setCoverUrl(r.cover_url ?? "");
    setIsExternal(r.is_external);
    setSortOrder(r.sort_order ?? 0);
    setStatus(r.status);
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
      toast.error("Resource title and URL slug are required.");
      return;
    }

    if (url.trim() && !url.trim().startsWith("http://") && !url.trim().startsWith("https://")) {
      toast.error("External URL must begin with https:// or http://");
      return;
    }

    if (
      downloadUrl.trim() &&
      !downloadUrl.trim().startsWith("http://") &&
      !downloadUrl.trim().startsWith("https://")
    ) {
      toast.error("Download URL must begin with https:// or http://");
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category,
        tags: parsedTags,
        url: url.trim() || null,
        download_url: downloadUrl.trim() || null,
        cover_url: coverUrl.trim() || null,
        is_external: isExternal,
        sort_order: Number(sortOrder) || 0,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      if (editingItem) {
        const { error } = await supabase.from("resources").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        await logAdminAction({
          action: "resource.update",
          resourceType: "resources",
          resourceId: editingItem.id,
          meta: { title: payload.title, category: payload.category, status: payload.status },
        });
        toast.success("Resource updated.");
      } else {
        const { data, error } = await supabase.from("resources").insert(payload).select().single();
        if (error) throw error;
        await logAdminAction({
          action: "resource.create",
          resourceType: "resources",
          resourceId: data.id,
          meta: { title: payload.title, category: payload.category, status: payload.status },
        });
        toast.success("Resource created.");
      }

      setFormOpen(false);
      void loadResources();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (resource: ResourceRow, nextStatus: ContentStatus) => {
    if (nextStatus === "archived") {
      setStatusConfirmItem({ resource, nextStatus });
      return;
    }
    await executeStatusUpdate(resource, nextStatus);
  };

  const executeStatusUpdate = async (resource: ResourceRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update({
          status: nextStatus,
          published_at:
            nextStatus === "published" ? new Date().toISOString() : resource.published_at,
        })
        .eq("id", resource.id);

      if (error) throw error;

      await logAdminAction({
        action: `resource.status.${nextStatus}`,
        resourceType: "resources",
        resourceId: resource.id,
        meta: { title: resource.title, previous_status: resource.status, new_status: nextStatus },
      });

      toast.success(`Resource marked as ${nextStatus}.`);
      void loadResources();
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
        .from("resources")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", deleteConfirmItem.id);

      if (error) throw error;

      await logAdminAction({
        action: "resource.delete",
        resourceType: "resources",
        resourceId: deleteConfirmItem.id,
        meta: { title: deleteConfirmItem.title },
      });

      toast.success("Resource archived and removed from active list.");
      setDeleteItem(null);
      void loadResources();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete resource");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Resources Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Developer toolkits, hackathon templates, architecture guides, and technical cheat
            sheets.
          </p>
        </div>
      </header>

      {/* Filter & Action Bar */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources by title, slug, or summary…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={() => void loadResources()}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Resource
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No resources found</p>
              <p className="mt-1 text-muted-foreground">
                {search || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try resetting your search query or category/status filters."
                  : "Publish your first developer template, starter kit, or hackathon guide."}
              </p>
              {(search || categoryFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
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
                    <th className="px-4 py-3">Resource Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Outbound Access</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {resources.map((r) => (
                    <tr key={r.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{r.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          /resources/{r.slug}
                        </div>
                        {r.description && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-sm mt-0.5">
                            {r.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {r.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.url ? (
                          <a
                            href={safeExternalUrl(r.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            Link <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : r.download_url ? (
                          <a
                            href={safeExternalUrl(r.download_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            Download <Download className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={r.status}
                          onValueChange={(val) => handleStatusChange(r, val as ContentStatus)}
                        >
                          <SelectTrigger className="h-6 w-24 text-[10px] px-2 capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectItem(r)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Inspect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(r)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Resource"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem(r)}
                            className="h-7 w-7 p-0 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
                            title="Remove Resource"
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

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
                {totalCount} resources
              </span>
              <div className="flex items-center gap-1.5">
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

      {/* Inspect Detail Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
            <DialogDescription>
              Public repository representation and metadata credentials.
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="space-y-4 py-2 text-xs">
              {inspectItem.cover_url && (
                <div className="h-36 overflow-hidden rounded-lg border border-border/60 bg-muted">
                  <img src={inspectItem.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {inspectItem.title}
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

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {inspectItem.category}
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    /resources/{inspectItem.slug}
                  </span>
                </div>

                {inspectItem.tags && inspectItem.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {inspectItem.tags.map((t: string) => (
                      <Badge key={t} variant="outline" className="text-[9px]">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {inspectItem.description && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Overview / Scope</Label>
                  <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                    {inspectItem.description}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {inspectItem.url && (
                  <a
                    href={safeExternalUrl(inspectItem.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    Open URL <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {inspectItem.download_url && (
                  <a
                    href={safeExternalUrl(inspectItem.download_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    Download Asset <Download className="h-3 w-3" />
                  </a>
                )}
              </div>

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
                  Edit Resource
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
            <DialogTitle>{editingItem ? "Edit Resource" : "Add Resource"}</DialogTitle>
            <DialogDescription>
              Configure developer templates, cheat sheets, and hackathon starter kits.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="resource-title">Title *</Label>
              <Input
                id="resource-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Agentic AI Starter Template"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="resource-slug">URL Slug *</Label>
                <Input
                  id="resource-slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="agentic-ai-starter-template"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resource-cat">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="resource-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="resource-tags">Tags (comma-separated)</Label>
              <Input
                id="resource-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ai, starter-kit, typescript, template"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="resource-url">External Resource URL</Label>
              <Input
                id="resource-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="resource-dl">Download URL (Optional)</Label>
              <Input
                id="resource-dl"
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/starter.zip"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="resource-cover">Cover Image URL (Optional)</Label>
              <Input
                id="resource-cover"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.png"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="resource-desc">Description</Label>
              <Textarea
                id="resource-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of tools, tech stack, and setup instructions..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="resource-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="resource-status">
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
                <Label htmlFor="resource-sort">Display Priority</Label>
                <Input
                  id="resource-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="is-external"
                checked={isExternal}
                onCheckedChange={(c) => setIsExternal(Boolean(c))}
              />
              <Label htmlFor="is-external" className="cursor-pointer text-xs">
                Opens external link in repository or browser tab
              </Label>
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
                {editingItem ? "Save Changes" : "Create Resource"}
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
            <AlertDialogTitle>Archive Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{statusConfirmItem?.resource.title}</strong>?
              Archived resources are hidden from the active public resources repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusConfirmItem) {
                  void executeStatusUpdate(
                    statusConfirmItem.resource,
                    statusConfirmItem.nextStatus,
                  );
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Archive Resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resource from Directory?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteConfirmItem?.title}</strong>? This action
              will archive and remove it from the active resources catalog.
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
