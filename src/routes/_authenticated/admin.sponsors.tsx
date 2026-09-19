import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Award,
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

type SponsorRow = Database["public"]["Tables"]["sponsors"]["Row"];
type SponsorTier = Database["public"]["Enums"]["sponsor_tier"];
type ContentStatus = Database["public"]["Enums"]["content_status"];
type PartnerAppRow = Database["public"]["Tables"]["partner_applications"]["Row"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

export const Route = createFileRoute("/_authenticated/admin/sponsors")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Sponsors — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminSponsorsPage,
});

const TIER_COLORS: Record<SponsorTier, { bg: string; text: string; border: string }> = {
  title: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  platinum: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
  silver: { bg: "bg-slate-400/10", text: "text-slate-300", border: "border-slate-400/30" },
  bronze: { bg: "bg-orange-600/10", text: "text-orange-400", border: "border-orange-600/30" },
  community: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
};

function AdminSponsorsPage() {
  const [activeTab, setActiveTab] = useState("roster");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Sponsors Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Corporate partners, hackathon challenge sponsors, tier allocations, and inquiries.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="roster" className="gap-2 text-xs">
            <Award className="h-3.5 w-3.5" />
            Active Sponsors Roster
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Sponsorship Inquiries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <SponsorsRosterTab />
        </TabsContent>

        <TabsContent value="inquiries">
          <SponsorshipInquiriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Sponsors Roster Tab
// ============================================================================
function SponsorsRosterTab() {
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SponsorRow | null>(null);
  const [inspectItem, setInspectItem] = useState<SponsorRow | null>(null);
  const [deleteConfirmItem, setDeleteItem] = useState<SponsorRow | null>(null);
  const [statusConfirmItem, setStatusConfirmItem] = useState<{
    sponsor: SponsorRow;
    nextStatus: ContentStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [tier, setTier] = useState<SponsorTier>("gold");
  const [blurb, setBlurb] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<ContentStatus>("published");

  const loadSponsors = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("sponsors")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as ContentStatus);
      }

      if (tierFilter !== "all") {
        q = q.eq("tier", tierFilter as SponsorTier);
      }

      if (search.trim()) {
        const term = search.trim();
        q = q.or(`name.ilike.%${term}%,blurb.ilike.%${term}%,url.ilike.%${term}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setSponsors(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(loadSponsors, 250);
    return () => clearTimeout(t);
  }, [loadSponsors]);

  useEffect(() => {
    setPage(1);
  }, [search, tierFilter, statusFilter]);

  const openCreate = () => {
    setEditingItem(null);
    setName("");
    setWebsite("");
    setLogoUrl("");
    setTier("gold");
    setBlurb("");
    setSortOrder(0);
    setStatus("published");
    setFormOpen(true);
  };

  const openEdit = (s: SponsorRow) => {
    setEditingItem(s);
    setName(s.name);
    setWebsite(s.url ?? "");
    setLogoUrl(s.logo_url ?? "");
    setTier(s.tier);
    setBlurb(s.blurb ?? "");
    setSortOrder(s.sort_order ?? 0);
    setStatus(s.status);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Sponsor name is required.");
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
        tier,
        blurb: blurb.trim() || null,
        sort_order: Number(sortOrder) || 0,
        status,
      };

      if (editingItem) {
        const { error } = await supabase.from("sponsors").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        await logAdminAction({
          action: "sponsor.update",
          resourceType: "sponsors",
          resourceId: editingItem.id,
          meta: { name: payload.name, tier: payload.tier, status: payload.status },
        });
        toast.success("Sponsor profile updated.");
      } else {
        const { data, error } = await supabase.from("sponsors").insert(payload).select().single();
        if (error) throw error;
        await logAdminAction({
          action: "sponsor.create",
          resourceType: "sponsors",
          resourceId: data.id,
          meta: { name: payload.name, tier: payload.tier, status: payload.status },
        });
        toast.success("Sponsor added to active roster.");
      }

      setFormOpen(false);
      void loadSponsors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save sponsor.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (sponsor: SponsorRow, nextStatus: ContentStatus) => {
    if (nextStatus === "archived") {
      setStatusConfirmItem({ sponsor, nextStatus });
      return;
    }
    await executeStatusUpdate(sponsor, nextStatus);
  };

  const executeStatusUpdate = async (sponsor: SponsorRow, nextStatus: ContentStatus) => {
    try {
      const { error } = await supabase
        .from("sponsors")
        .update({ status: nextStatus })
        .eq("id", sponsor.id);

      if (error) throw error;

      await logAdminAction({
        action: `sponsor.status.${nextStatus}`,
        resourceType: "sponsors",
        resourceId: sponsor.id,
        meta: { name: sponsor.name, previous_status: sponsor.status, new_status: nextStatus },
      });

      toast.success(`Sponsor marked as ${nextStatus}.`);
      void loadSponsors();
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
        .from("sponsors")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", deleteConfirmItem.id);

      if (error) throw error;

      await logAdminAction({
        action: "sponsor.delete",
        resourceType: "sponsors",
        resourceId: deleteConfirmItem.id,
        meta: { name: deleteConfirmItem.name },
      });

      toast.success("Sponsor removed from active roster.");
      setDeleteItem(null);
      void loadSponsors();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sponsor");
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
                placeholder="Search sponsors by brand name or blurb…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="community">Community</SelectItem>
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
              onClick={() => void loadSponsors()}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={openCreate} size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Sponsor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Table */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sponsors.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Award className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No sponsors found</p>
              <p className="mt-1 text-muted-foreground">
                {search || tierFilter !== "all" || statusFilter !== "all"
                  ? "Try resetting search query or status/tier filters."
                  : "Enroll your first official corporate or hackathon sponsor."}
              </p>
              {(search || tierFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setTierFilter("all");
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
                    <th className="px-4 py-3">Sponsor Brand</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Website</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Enrolled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sponsors.map((s) => {
                    const tierStyle = TIER_COLORS[s.tier] ?? {
                      bg: "bg-muted",
                      text: "text-muted-foreground",
                      border: "border-border",
                    };
                    const initials = s.name
                      ? s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "SP";

                    return (
                      <tr key={s.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded border border-border/60">
                              <AvatarImage
                                src={s.logo_url ?? undefined}
                                alt={s.name}
                                className="object-contain"
                              />
                              <AvatarFallback className="text-[10px] font-bold bg-muted rounded">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{s.name}</div>
                              {s.blurb && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                                  {s.blurb}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                          >
                            {s.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.url ? (
                            <a
                              href={safeExternalUrl(s.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
                            >
                              Visit <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              s.status === "published"
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                : s.status === "draft"
                                  ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                                  : "text-muted-foreground border-border/40"
                            }`}
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[11px]">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInspectItem(s)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Inspect details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(s)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit sponsor"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Select
                              value={s.status}
                              onValueChange={(val) => handleStatusChange(s, val as ContentStatus)}
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
                              onClick={() => setDeleteItem(s)}
                              className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10"
                              title="Delete sponsor"
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
                of <span className="font-semibold text-foreground">{totalCount}</span> sponsors
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

      {/* Inspect Detail Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sponsor Organization</DialogTitle>
            <DialogDescription>
              Corporate credentials and public directory listing representation.
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
                      : "SP"}
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
                        TIER_COLORS[inspectItem.tier]?.bg ?? "bg-muted"
                      } ${TIER_COLORS[inspectItem.tier]?.text ?? "text-muted-foreground"} ${
                        TIER_COLORS[inspectItem.tier]?.border ?? "border-border"
                      }`}
                    >
                      {inspectItem.tier} Tier
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
                  <Label className="text-xs font-semibold">About / Partnership Focus</Label>
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
            <DialogTitle>{editingItem ? "Edit Sponsor Profile" : "Add Sponsor"}</DialogTitle>
            <DialogDescription>
              Configure official sponsor credentials and public directory placement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="sponsor-name">Organization / Brand Name *</Label>
              <Input
                id="sponsor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vercel, Supabase, Google Cloud"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sponsor-website">Website URL</Label>
                <Input
                  id="sponsor-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sponsor-tier">Sponsorship Tier</Label>
                <Select value={tier} onValueChange={(v) => setTier(v as SponsorTier)}>
                  <SelectTrigger id="sponsor-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title Sponsor</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sponsor-logo">Logo Image URL</Label>
              <Input
                id="sponsor-logo"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sponsor-blurb">Public Description / Blurb</Label>
              <Textarea
                id="sponsor-blurb"
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder="Brief summary of the organization, developer tools, or hackathon track sponsorship..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sponsor-status">Visibility Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger id="sponsor-status">
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
                <Label htmlFor="sponsor-sort">Display Priority</Label>
                <Input
                  id="sponsor-sort"
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
                {editingItem ? "Save Changes" : "Add Sponsor"}
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
            <AlertDialogTitle>Archive Sponsor Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong className="text-foreground">{statusConfirmItem?.sponsor.name}</strong>?
              Archived sponsors are hidden from public sponsor showcases and active directories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusConfirmItem) {
                  void executeStatusUpdate(statusConfirmItem.sponsor, statusConfirmItem.nextStatus);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Archive Sponsor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Sponsor from Roster?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{deleteConfirmItem?.name}</strong>? This action
              will remove them from the active sponsors directory.
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
// Sponsorship Inquiries Tab
// ============================================================================
function SponsorshipInquiriesTab() {
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
  const [assignedTier, setAssignedTier] = useState<SponsorTier>("gold");

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
      toast.error(err instanceof Error ? err.message : "Failed to load sponsorship inquiries");
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
        action: `sponsor_inquiry.${nextStatus}`,
        resourceType: "partner_applications",
        resourceId: inquiry.id,
        meta: { status: nextStatus, organization: inquiry.org_name, email: inquiry.email },
      });

      // If approved, automatically insert into sponsors roster
      if (nextStatus === "approved") {
        const { error: spErr } = await supabase.from("sponsors").insert({
          name: inquiry.org_name,
          url: inquiry.website,
          blurb: inquiry.message,
          tier: assignedTier,
          status: "published",
        });

        if (spErr) {
          console.error("Failed to enroll sponsor:", spErr);
          toast.warning("Inquiry approved, but manual sponsor entry required.");
        }
      }

      toast.success(
        nextStatus === "approved"
          ? "Sponsorship inquiry approved and added to active sponsors."
          : `Inquiry marked as ${nextStatus}.`,
      );

      setSelectedInquiry(null);
      setConfirmDialog(null);
      setAdminNotes("");
      void loadInquiries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update inquiry status");
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
              <p className="font-medium text-foreground">No sponsorship inquiries found</p>
              <p className="mt-1 text-muted-foreground">
                Organizations reaching out via the partner and sponsor portals will appear here.
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
                            className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            Website <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="text-foreground/90 font-medium">{inq.contact_name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {inq.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {inq.partnership_type || "Sponsor"}
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
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setAdminNotes(inq.admin_notes ?? "");
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
                of <span className="font-semibold text-foreground">{totalCount}</span> inquiries
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

      {/* Inquiry Review Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluate Sponsorship Inquiry</DialogTitle>
            <DialogDescription>Review proposal from {selectedInquiry?.org_name}.</DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="font-semibold text-foreground">{selectedInquiry.org_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="text-foreground">{selectedInquiry.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedInquiry.email}</span>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{selectedInquiry.phone}</span>
                  </div>
                )}
                {selectedInquiry.website && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website:</span>
                    <a
                      href={safeExternalUrl(selectedInquiry.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {selectedInquiry.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested Type:</span>
                  <span className="text-foreground font-medium">
                    {selectedInquiry.partnership_type || "Sponsorship"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Proposal Message</Label>
                <div className="rounded-md border border-border/40 bg-card p-3 text-foreground whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="assigned-tier" className="text-xs font-semibold">
                  Allocate Sponsor Tier (if approving)
                </Label>
                <Select
                  value={assignedTier}
                  onValueChange={(v) => setAssignedTier(v as SponsorTier)}
                >
                  <SelectTrigger id="assigned-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title Sponsor</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="inq-notes" className="text-xs font-semibold">
                  Administrative Notes
                </Label>
                <Textarea
                  id="inq-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record discussions, contract terms, or screening notes..."
                  rows={2}
                />
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void executeInquiryStatus(selectedInquiry, "reviewing")}
                  disabled={busy || selectedInquiry.status === "reviewing"}
                  className="text-xs"
                >
                  Mark Reviewing
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDialog({ inquiry: selectedInquiry, action: "reject" })}
                    disabled={busy}
                    className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 text-xs"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({ inquiry: selectedInquiry, action: "approve" })
                    }
                    disabled={busy}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve as Sponsor
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.action === "approve"
                ? "Approve Sponsorship Proposal?"
                : "Reject Sponsorship Proposal?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "approve" ? (
                <>
                  Approving{" "}
                  <strong className="text-foreground">{confirmDialog?.inquiry.org_name}</strong>{" "}
                  will mark their inquiry as approved and automatically enroll them into the active
                  sponsors roster under the{" "}
                  <strong className="text-foreground uppercase">{assignedTier}</strong> tier.
                </>
              ) : (
                <>
                  Are you sure you want to reject the proposal from{" "}
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
              {confirmDialog?.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
