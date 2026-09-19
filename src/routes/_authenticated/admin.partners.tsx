import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Handshake,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Mail,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
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
import { safeExternalUrl } from "@/lib/safe-redirect";
import type { Database } from "@/integrations/supabase/types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type PartnerKind = Database["public"]["Enums"]["partner_kind"];
type ContentStatus = Database["public"]["Enums"]["content_status"];
type PartnerAppRow = Database["public"]["Tables"]["partner_applications"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const Route = createFileRoute("/_authenticated/admin/partners")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Partners — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPartnersPage,
});

const KIND_COLORS: Record<PartnerKind, { bg: string; text: string; border: string }> = {
  academic: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  community: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  media: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  ecosystem: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  technology: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
};

function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState("roster");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Partners Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ecosystem alliances, university chapters, developer circles, and partnership proposals.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="roster" className="gap-2 text-xs">
            <Handshake className="h-3.5 w-3.5" />
            Active Partners Roster
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Partner Applications Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <PartnersRosterTab />
        </TabsContent>

        <TabsContent value="applications">
          <PartnerApplicationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Partners Roster Tab
// ============================================================================
function PartnersRosterTab() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerRow | null>(null);
  const [inspectItem, setInspectItem] = useState<PartnerRow | null>(null);
  const [deleteConfirmItem, setDeleteItem] = useState<PartnerRow | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{
    partner: PartnerRow;
    nextStatus: ContentStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [kind, setKind] = useState<PartnerKind>("community");
  const [blurb, setBlurb] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<ContentStatus>("published");

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("partners")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      if (kindFilter !== "all") {
        q = q.eq("kind", kindFilter as PartnerKind);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`name.ilike.%${term}%,blurb.ilike.%${term}%,url.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setPartners(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [search, kindFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(loadPartners, 250);
    return () => clearTimeout(t);
  }, [loadPartners]);

  useEffect(() => {
    setPage(1);
  }, [search, kindFilter, statusFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setName("");
    setWebsite("");
    setLogoUrl("");
    setKind("community");
    setBlurb("");
    setSortOrder(0);
    setStatus("published");
    setFormOpen(true);
  };

  const openEdit = (p: PartnerRow) => {
    setEditingItem(p);
    setName(p.name);
    setWebsite(p.url ?? "");
    setLogoUrl(p.logo_url ?? "");
    setKind(p.kind);
    setBlurb(p.blurb ?? "");
    setSortOrder(p.sort_order ?? 0);
    setStatus(p.status);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Partner name is required.");
      return;
    }

    if (
      website.trim() &&
      !website.trim().startsWith("http://") &&
      !website.trim().startsWith("https://")
    ) {
      toast.error("Website URL must begin with https:// or http://");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        url: website.trim() || null,
        logo_url: logoUrl.trim() || null,
        kind,
        blurb: blurb.trim() || null,
        sort_order: Number(sortOrder) || 0,
        status,
      };

      if (editingItem) {
        const { error } = await supabase.from("partners").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        await logAdminAction({
          action: "partner.update",
          resourceType: "partners",
          resourceId: editingItem.id,
          meta: { name: payload.name, kind: payload.kind, status: payload.status },
        });
        toast.success("Partner profile updated.");
      } else {
        const { data, error } = await supabase.from("partners").insert(payload).select().single();
        if (error) throw error;
        await logAdminAction({
          action: "partner.create",
          resourceType: "partners",
          resourceId: data.id,
          meta: { name: payload.name, kind: payload.kind, status: payload.status },
        });
        toast.success("Partner added to active roster.");
      }

      setFormOpen(false);
      void loadPartners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save partner.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (partner: PartnerRow, nextStatus: ContentStatus) => {
    if (nextStatus === "archived") {
      setStatusConfirmItem({ partner, nextStatus });
      return;
    }
    await executeStatusUpdate(partner, nextStatus);
  };

  const executeStatusUpdate = async (partner: PartnerRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("partners")
        .update({ status: nextStatus })
        .eq("id", partner.id);

      if (error) throw error;

      await logAdminAction({
        action: `partner.status.${nextStatus}`,
        resourceType: "partners",
        resourceId: partner.id,
        meta: { name: partner.name, previous_status: partner.status, new_status: nextStatus },
      });

      toast.success(`Partner marked as ${nextStatus}.`);
      void loadPartners();
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
        .from("partners")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", deleteConfirmItem.id);

      if (error) throw error;

      await logAdminAction({
        action: "partner.delete",
        resourceType: "partners",
        resourceId: deleteConfirmItem.id,
        meta: { name: deleteConfirmItem.name },
      });

      toast.success("Partner removed from active roster.");
      setDeleteItem(null);
      void loadPartners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete partner");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search partners by name or scope…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="All Kinds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kinds</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="ecosystem">Ecosystem</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
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
              onClick={() => void loadPartners()}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Partner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Partners Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : partners.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Handshake className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No partners found</p>
              <p className="mt-1 text-muted-foreground">
                {search || kindFilter !== "all" || statusFilter !== "all"
                  ? "Try resetting search query or status/kind filters."
                  : "Enroll your first official ecosystem alliance or community partner."}
              </p>
              {(search || kindFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setKindFilter("all");
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
                    <th className="px-4 py-3">Partner Organization</th>
                    <th className="px-4 py-3">Kind / Scope</th>
                    <th className="px-4 py-3">Website</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {partners.map((p) => (
                    <tr key={p.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded border border-border/60">
                            <AvatarImage
                              src={p.logo_url ?? undefined}
                              alt={p.name}
                              className="object-contain"
                            />
                            <AvatarFallback className="text-[10px] font-bold bg-muted rounded">
                              {p.name
                                ? p.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "PT"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground truncate max-w-xs">
                              {p.name}
                            </div>
                            {p.blurb && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                                {p.blurb}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                            KIND_COLORS[p.kind]?.bg ?? "bg-muted"
                          } ${KIND_COLORS[p.kind]?.text ?? "text-muted-foreground"} ${
                            KIND_COLORS[p.kind]?.border ?? "border-border"
                          }`}
                        >
                          {p.kind}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.url ? (
                          <a
                            href={safeExternalUrl(p.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={p.status}
                          onValueChange={(val) => handleStatusChange(p, val as ContentStatus)}
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
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectItem(p)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Inspect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(p)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Partner"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem(p)}
                            className="h-7 w-7 p-0 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
                            title="Remove Partner"
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
                {totalCount} partners
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
            <DialogTitle>Partner Organization</DialogTitle>
            <DialogDescription>
              Ecosystem partner credentials and public directory listing representation.
            </DialogDescription>
          </DialogHeader>

          {inspectItem && (
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                <Avatar className="h-14 w-14 rounded border border-border/60">
                  <AvatarImage
                    src={inspectItem.logo_url ?? undefined}
                    alt={inspectItem.name}
                    className="object-contain"
                  />
                  <AvatarFallback className="text-base font-bold bg-muted rounded">
                    {inspectItem.name
                      ? inspectItem.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "PT"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-foreground truncate">
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
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                        KIND_COLORS[inspectItem.kind]?.bg ?? "bg-muted"
                      } ${KIND_COLORS[inspectItem.kind]?.text ?? "text-muted-foreground"} ${
                        KIND_COLORS[inspectItem.kind]?.border ?? "border-border"
                      }`}
                    >
                      {inspectItem.kind} Partner
                    </span>
                  </div>
                  {inspectItem.url && (
                    <div className="mt-2">
                      <a
                        href={safeExternalUrl(inspectItem.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        {inspectItem.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {inspectItem.blurb && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">About / Collaboration Scope</Label>
                  <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                    {inspectItem.blurb}
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

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Partner Profile" : "Add Partner"}</DialogTitle>
            <DialogDescription>
              Configure official partner credentials and public directory placement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="partner-name">Organization / Community Name *</Label>
              <Input
                id="partner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Major League Hacking, IEEE, ACM Chapter"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="partner-website">Website URL</Label>
                <Input
                  id="partner-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.org"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="partner-kind">Partnership Kind</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as PartnerKind)}>
                  <SelectTrigger id="partner-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="ecosystem">Ecosystem</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="partner-logo">Logo Image URL</Label>
              <Input
                id="partner-logo"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.org/logo.png"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="partner-blurb">Public Description / Blurb</Label>
              <Textarea
                id="partner-blurb"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="Summary of institutional alliance, campus chapter network, or joint community initiative..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="partner-status">Visibility Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="partner-status">
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
                <Label htmlFor="partner-sort">Display Priority</Label>
                <Input
                  id="partner-sort"
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
                {editingItem ? "Save Changes" : "Add Partner"}
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
            <AlertDialogTitle>Archive Partner Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{statusConfirmItem?.partner.name}</strong>?
              Archived partners are hidden from public directories and partner showcases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusConfirmItem) {
                  void executeStatusUpdate(statusConfirmItem.partner, statusConfirmItem.nextStatus);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Archive Partner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Partner from Roster?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteConfirmItem?.name}</strong>? This action
              will remove them from the active partners directory.
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
// Partner Applications Queue Tab
// ============================================================================
function PartnerApplicationsTab() {
  const [inquiries, setInquiries] = useState<PartnerAppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [selectedInquiry, setSelectedInquiry] = useState<PartnerAppRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [assignedKind, setAssignedKind] = useState<PartnerKind>("community");

  const [confirmDialog, setConfirmDialog] = useState<{
    inquiry: PartnerAppRow;
    action: "approve" | "reject";
  } | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("partner_applications")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ApplicationStatus);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(
          `org_name.ilike.%${term}%,contact_name.ilike.%${term}%,email.ilike.%${term}%,partnership_type.ilike.%${term}%`,
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setInquiries(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load partner applications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    const t = setTimeout(loadInquiries, 250);
    return () => clearTimeout(t);
  }, [loadInquiries]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const executeInquiryStatus = async (inquiry: PartnerAppRow, nextStatus: ApplicationStatus) => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("partner_applications")
        .update({
          status: nextStatus,
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", inquiry.id);

      if (error) throw error;

      await logAdminAction({
        action: `partner_application.${nextStatus}`,
        resourceType: "partner_applications",
        resourceId: inquiry.id,
        meta: { status: nextStatus, organization: inquiry.org_name, email: inquiry.email },
      });

      // If approved, automatically insert into partners roster
      if (nextStatus === "approved") {
        const { error: ptErr } = await supabase.from("partners").insert({
          name: inquiry.org_name,
          url: inquiry.website,
          blurb: inquiry.message,
          kind: assignedKind,
          status: "published",
        });

        if (ptErr) {
          console.error("Failed to enroll partner:", ptErr);
          toast.warning("Application approved, but manual partner entry required.");
        }
      }

      toast.success(
        nextStatus === "approved"
          ? "Partner application approved and added to active partners."
          : `Application marked as ${nextStatus}.`,
      );

      setSelectedInquiry(null);
      setConfirmDialog(null);
      setAdminNotes("");
      void loadInquiries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update application status");
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by organization, contact, or type…"
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
                <SelectItem value="all">All Statuses</SelectItem>
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
            onClick={() => void loadInquiries()}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No partner applications found</p>
              <p className="mt-1 text-muted-foreground">
                Organizations reaching out via the partner portal will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{inq.org_name}</div>
                        {inq.website && (
                          <a
                            href={safeExternalUrl(inq.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 font-mono"
                          >
                            {inq.website} <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="font-medium text-foreground">{inq.contact_name}</div>
                        <div className="text-[10px] font-mono">{inq.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {inq.partnership_type ?? "General"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            inq.status === "approved"
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                              : inq.status === "rejected"
                                ? "text-rose-500 border-rose-500/20 bg-rose-500/5"
                                : inq.status === "reviewing"
                                  ? "text-blue-500 border-blue-500/20 bg-blue-500/5"
                                  : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                          }`}
                        >
                          {inq.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setAdminNotes(inq.admin_notes ?? "");
                          }}
                          className="h-7 text-xs gap-1"
                        >
                          Review <ChevronRight className="h-3 w-3" />
                        </Button>
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
                {totalCount} applications
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

      {/* Review Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Partner Application</DialogTitle>
            <DialogDescription>
              Institutional proposal submitted by {selectedInquiry?.org_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-2 text-xs">
              {/* Organization and Contact Private Details */}
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground text-sm">
                      {selectedInquiry.org_name}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      selectedInquiry.status === "approved"
                        ? "text-emerald-500 border-emerald-500/20"
                        : selectedInquiry.status === "rejected"
                          ? "text-rose-500 border-rose-500/20"
                          : "text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {selectedInquiry.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Contact Person:</span>
                    <span className="font-medium text-foreground">
                      {selectedInquiry.contact_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Contact Email:</span>
                    <span className="font-mono text-foreground">{selectedInquiry.email}</span>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Phone:</span>
                      <span className="font-mono text-foreground">{selectedInquiry.phone}</span>
                    </div>
                  )}
                  {selectedInquiry.partnership_type && (
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Requested Type:
                      </span>
                      <span className="text-foreground capitalize">
                        {selectedInquiry.partnership_type}
                      </span>
                    </div>
                  )}
                </div>

                {selectedInquiry.website && (
                  <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Official Website:</span>
                    <a
                      href={safeExternalUrl(selectedInquiry.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      {selectedInquiry.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Inquiry Message */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Collaboration Scope / Message</Label>
                <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Action Controls if pending / reviewing */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="assigned-kind">Enroll as Partner Kind</Label>
                    <Select
                      value={assignedKind}
                      onValueChange={(v) => setAssignedKind(v as PartnerKind)}
                    >
                      <SelectTrigger id="assigned-kind">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="ecosystem">Ecosystem</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="admin-notes">Internal Administrative Notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Log review notes, MOU details, or rejection reason..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDialog({ inquiry: selectedInquiry, action: "reject" })}
                  disabled={busy || selectedInquiry.status === "rejected"}
                  className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline Application
                </Button>
                <Button
                  type="button"
                  onClick={() => setConfirmDialog({ inquiry: selectedInquiry, action: "approve" })}
                  disabled={busy || selectedInquiry.status === "approved"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve & Enroll Partner
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Review Action */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "approve"
                ? "Approve Partner Application?"
                : "Decline Partner Application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "approve" ? (
                <>
                  This will mark the application from{" "}
                  <strong className="text-foreground">{confirmDialog?.inquiry.org_name}</strong> as
                  approved and automatically add them to the Active Partners Roster as a{" "}
                  <strong className="text-foreground capitalize">{assignedKind}</strong> partner.
                </>
              ) : (
                <>
                  Are you sure you want to decline the partnership proposal from{" "}
                  <strong className="text-foreground">{confirmDialog?.inquiry.org_name}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog) {
                  void executeInquiryStatus(
                    confirmDialog.inquiry,
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
              {busy ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              {confirmDialog?.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
