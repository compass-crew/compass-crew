import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trophy,
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Edit2,
  Archive,
  Play,
  CheckCircle2,
  Eye,
  RefreshCw,
  Globe,
  Sparkles,
  Clock,
  MapPin,
  RotateCcw,
  X,
  Gavel,
  Radio,
  FileEdit,
  Building,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import { slugify } from "@/lib/hackathons";
import type { Database } from "@/integrations/supabase/types";

type HackathonRow = Database["public"]["Tables"]["hackathons"]["Row"];
type HackathonStatus = Database["public"]["Enums"]["hackathon_status"];
type HackathonMode = Database["public"]["Enums"]["hackathon_mode"];

export const Route = createFileRoute("/_authenticated/admin/hackathons")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Hackathons — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminHackathonsPage,
});

const STATUS_CONFIG: Record<
  HackathonStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  draft: {
    label: "Draft",
    bg: "bg-muted/70",
    text: "text-muted-foreground",
    border: "border-border",
    icon: FileEdit,
  },
  published: {
    label: "Published",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/25",
    icon: Globe,
  },
  registrations_open: {
    label: "Registrations Open",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
    icon: UserPlus,
  },
  ongoing: {
    label: "Ongoing",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/25",
    icon: Play,
  },
  judging: {
    label: "Judging",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    icon: Gavel,
  },
  completed: {
    label: "Completed",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/25",
    icon: CheckCircle2,
  },
  archived: {
    label: "Archived",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/25",
    icon: Archive,
  },
};

const MODE_CONFIG: Record<
  HackathonMode,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  online: { label: "Online", icon: Globe },
  hybrid: { label: "Hybrid", icon: Building },
  in_person: { label: "In-Person", icon: MapPin },
};

const PAGE_SIZE = 15;

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toLocalInputDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<{
    total: number;
    live: number;
    draft: number;
    completed: number;
  }>({ total: 0, live: 0, draft: 0, completed: 0 });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [page, setPage] = useState(1);

  // Inspector Sheet/Dialog
  const [inspectingItem, setInspectingItem] = useState<HackathonRow | null>(null);

  // Create / Edit Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HackathonRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [formTab, setFormTab] = useState("general");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTheme, setFormTheme] = useState("");
  const [formMode, setFormMode] = useState<HackathonMode>("online");
  const [formStatus, setFormStatus] = useState<HackathonStatus>("draft");
  const [formLocation, setFormLocation] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formRegOpens, setFormRegOpens] = useState("");
  const [formRegCloses, setFormRegCloses] = useState("");
  const [formSubmissionDeadline, setFormSubmissionDeadline] = useState("");
  const [formResultsAt, setFormResultsAt] = useState("");
  const [formMinTeam, setFormMinTeam] = useState(1);
  const [formMaxTeam, setFormMaxTeam] = useState(4);
  const [formEligibility, setFormEligibility] = useState("");
  const [formRules, setFormRules] = useState("");
  const [formBannerUrl, setFormBannerUrl] = useState<string | null>(null);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Confirmation Alert Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    confirmVariant?: "default" | "destructive";
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    confirmVariant: "default",
    action: async () => {},
  });

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const [totalRes, liveRes, draftRes, completedRes] = await Promise.all([
        supabase.from("hackathons").select("id", { count: "exact", head: true }),
        supabase
          .from("hackathons")
          .select("id", { count: "exact", head: true })
          .in("status", ["registrations_open", "ongoing"]),
        supabase
          .from("hackathons")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("hackathons")
          .select("id", { count: "exact", head: true })
          .in("status", ["completed", "archived"]),
      ]);

      setStats({
        total: totalRes.count ?? 0,
        live: liveRes.count ?? 0,
        draft: draftRes.count ?? 0,
        completed: completedRes.count ?? 0,
      });
    } catch {
      // Non-blocking for primary list
    }
  }, []);

  // Load hackathons table
  const loadHackathons = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from("hackathons").select("*", { count: "exact" });

      if (debouncedSearch) {
        const term = debouncedSearch;
        q = q.or(
          `title.ilike.%${term}%,slug.ilike.%${term}%,tagline.ilike.%${term}%,theme.ilike.%${term}%`,
        );
      }

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter as HackathonStatus);
      }

      if (modeFilter !== "all") {
        q = q.eq("mode", modeFilter as HackathonMode);
      }

      switch (sortOption) {
        case "oldest":
          q = q.order("created_at", { ascending: true });
          break;
        case "starts_soonest":
          q = q.order("starts_at", { ascending: true, nullsFirst: false });
          break;
        case "deadline":
          q = q.order("registration_closes_at", { ascending: true, nullsFirst: false });
          break;
        case "recently_updated":
          q = q.order("updated_at", { ascending: false });
          break;
        case "newest":
        default:
          q = q.order("created_at", { ascending: false });
          break;
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count, error } = await q.range(from, to);

      if (error) throw error;
      setHackathons(data ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load hackathons from database");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, modeFilter, sortOption, page]);

  useEffect(() => {
    void loadHackathons();
  }, [loadHackathons]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    statusFilter !== "all" ||
    modeFilter !== "all" ||
    sortOption !== "newest";

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setModeFilter("all");
    setSortOption("newest");
    setPage(1);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormTab("general");
    setFormTitle("");
    setFormSlug("");
    setFormTagline("");
    setFormDescription("");
    setFormTheme("");
    setFormMode("online");
    setFormStatus("draft");
    setFormLocation("");
    setFormStartsAt("");
    setFormEndsAt("");
    setFormRegOpens("");
    setFormRegCloses("");
    setFormSubmissionDeadline("");
    setFormResultsAt("");
    setFormMinTeam(1);
    setFormMaxTeam(4);
    setFormEligibility("");
    setFormRules("");
    setFormBannerUrl(null);
    setFormIsFeatured(false);
    setFormOpen(true);
  };

  const openEditDialog = (h: HackathonRow) => {
    setEditingItem(h);
    setFormTab("general");
    setFormTitle(h.title);
    setFormSlug(h.slug);
    setFormTagline(h.tagline ?? "");
    setFormDescription(h.description ?? "");
    setFormTheme(h.theme ?? "");
    setFormMode(h.mode);
    setFormStatus(h.status);
    setFormLocation(h.location ?? "");
    setFormStartsAt(toLocalInputDate(h.starts_at));
    setFormEndsAt(toLocalInputDate(h.ends_at));
    setFormRegOpens(toLocalInputDate(h.registration_opens_at));
    setFormRegCloses(toLocalInputDate(h.registration_closes_at));
    setFormSubmissionDeadline(toLocalInputDate(h.submission_deadline));
    setFormResultsAt(toLocalInputDate(h.results_at));
    setFormMinTeam(h.min_team_size);
    setFormMaxTeam(h.max_team_size);
    setFormEligibility(h.eligibility ?? "");
    setFormRules(h.rules ?? "");
    setFormBannerUrl(h.banner_url);
    setFormIsFeatured(h.is_featured);
    setFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingItem) {
      setFormSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      toast.error("Hackathon title is required.");
      setFormTab("general");
      return;
    }

    const cleanSlug = formSlug.trim();
    if (!cleanSlug) {
      toast.error("Unique URL slug is required.");
      setFormTab("general");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      toast.error("URL slug must contain only lowercase letters, numbers, and single hyphens.");
      setFormTab("general");
      return;
    }

    if (formMinTeam < 1) {
      toast.error("Minimum team size must be at least 1.");
      setFormTab("rules");
      return;
    }

    if (formMaxTeam < formMinTeam) {
      toast.error("Maximum team size cannot be smaller than minimum team size.");
      setFormTab("rules");
      return;
    }

    const startIso = formStartsAt ? new Date(formStartsAt).toISOString() : null;
    const endIso = formEndsAt ? new Date(formEndsAt).toISOString() : null;
    const regOpenIso = formRegOpens ? new Date(formRegOpens).toISOString() : null;
    const regCloseIso = formRegCloses ? new Date(formRegCloses).toISOString() : null;
    const subDeadlineIso = formSubmissionDeadline
      ? new Date(formSubmissionDeadline).toISOString()
      : null;
    const resultsIso = formResultsAt ? new Date(formResultsAt).toISOString() : null;

    if (startIso && endIso && new Date(startIso) > new Date(endIso)) {
      toast.error("Hackathon start date cannot be after the end date.");
      setFormTab("dates");
      return;
    }

    if (regOpenIso && regCloseIso && new Date(regOpenIso) > new Date(regCloseIso)) {
      toast.error("Registration opening cannot be after the registration closing deadline.");
      setFormTab("dates");
      return;
    }

    if (regCloseIso && endIso && new Date(regCloseIso) > new Date(endIso)) {
      toast.error("Registration deadline cannot be after the hackathon has ended.");
      setFormTab("dates");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication session expired. Please sign in again.");
      }

      const payload = {
        title: cleanTitle,
        slug: cleanSlug,
        tagline: formTagline.trim() || null,
        description: formDescription.trim() || null,
        theme: formTheme.trim() || null,
        mode: formMode,
        status: formStatus,
        location: formMode !== "online" ? formLocation.trim() || null : null,
        starts_at: startIso,
        ends_at: endIso,
        registration_opens_at: regOpenIso,
        registration_closes_at: regCloseIso,
        submission_deadline: subDeadlineIso,
        results_at: resultsIso,
        min_team_size: formMinTeam,
        max_team_size: formMaxTeam,
        eligibility: formEligibility.trim() || null,
        rules: formRules.trim() || null,
        banner_url: formBannerUrl,
        is_featured: formIsFeatured,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("hackathons")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;

        await logAdminAction({
          action: "hackathon.update",
          resourceType: "hackathons",
          resourceId: editingItem.id,
          meta: { title: payload.title, slug: payload.slug, status: payload.status },
        });

        toast.success(`Hackathon "${payload.title}" updated successfully.`);
      } else {
        const { data, error } = await supabase
          .from("hackathons")
          .insert({
            ...payload,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        await logAdminAction({
          action: "hackathon.create",
          resourceType: "hackathons",
          resourceId: data.id,
          meta: { title: payload.title, slug: payload.slug, status: payload.status },
        });

        toast.success(`Hackathon "${payload.title}" created successfully.`);
      }

      setFormOpen(false);
      void loadHackathons();
      void loadStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save hackathon.");
    } finally {
      setSaving(false);
    }
  };

  const promptPublish = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Publish "${h.title}"?`,
      description:
        "Publishing will make this hackathon publicly visible on the platform and discovery pages. Participants will be able to explore the competition brief and timeline.",
      confirmText: "Publish Hackathon",
      confirmVariant: "default",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "published" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.publish",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "published", title: h.title },
          });

          toast.success(`Hackathon "${h.title}" is now published.`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to publish hackathon.");
        }
      },
    });
  };

  const promptUnpublish = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Unpublish "${h.title}"?`,
      description:
        "Unpublishing will return this hackathon to Draft status. It will immediately be hidden from the public Hackathons listing. Admin access remains intact.",
      confirmText: "Unpublish (Return to Draft)",
      confirmVariant: "default",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "draft" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.unpublish",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "draft", title: h.title },
          });

          toast.success(`Hackathon "${h.title}" unpublished and returned to draft.`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to unpublish hackathon.");
        }
      },
    });
  };

  const promptOpenRegistrations = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Open Registrations for "${h.title}"?`,
      description:
        "This transitions the competition to 'Registrations Open'. Participants will be able to submit their registrations and form teams.",
      confirmText: "Open Registrations",
      confirmVariant: "default",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "registrations_open" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.open_registrations",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "registrations_open", title: h.title },
          });

          toast.success(`Registrations are now open for "${h.title}".`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to open registrations.");
        }
      },
    });
  };

  const promptStartCompetition = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Start Competition for "${h.title}"?`,
      description:
        "This sets the status to 'Ongoing'. The hacking window is now live and teams can build and prepare their project submissions.",
      confirmText: "Start Competition",
      confirmVariant: "default",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "ongoing" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.start",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "ongoing", title: h.title },
          });

          toast.success(`Competition "${h.title}" is now ongoing.`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to start competition.");
        }
      },
    });
  };

  const promptMarkCompleted = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Mark "${h.title}" as Completed?`,
      description:
        "This concludes the competition lifecycle and transitions it to 'Completed'. Results and awards will be accessible.",
      confirmText: "Mark Completed",
      confirmVariant: "default",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "completed" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.complete",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "completed", title: h.title },
          });

          toast.success(`Hackathon "${h.title}" marked as completed.`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to complete hackathon.");
        }
      },
    });
  };

  const promptArchive = (h: HackathonRow) => {
    setConfirmDialog({
      open: true,
      title: `Archive "${h.title}"?`,
      description:
        "Archiving removes this competition from active public listings while preserving all historical data, registrations, teams, submissions, and audit trails. The record remains viewable by admins.",
      confirmText: "Archive Competition",
      confirmVariant: "destructive",
      action: async () => {
        try {
          const { error } = await supabase
            .from("hackathons")
            .update({ status: "archived" })
            .eq("id", h.id);

          if (error) throw error;

          await logAdminAction({
            action: "hackathon.archive",
            resourceType: "hackathons",
            resourceId: h.id,
            meta: { from: h.status, to: "archived", title: h.title },
          });

          toast.success(`Hackathon "${h.title}" archived successfully.`);
          void loadHackathons();
          void loadStats();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to archive hackathon.");
        }
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Hackathons Management
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Step 28.4
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Governance of competitions, phase transitions, registrations, and lifecycle state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void loadHackathons();
              void loadStats();
            }}
            disabled={loading}
            className="gap-1.5"
            title="Refresh hackathons list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Hackathon
          </Button>
        </div>
      </header>

      {/* KPI Overview Cards */}
      <section
        aria-label="Hackathons Statistics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="border-border/60 bg-card/60 transition hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Competitions</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Database records in public.hackathons
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 transition hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Live / Ongoing</p>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-500">
                  {stats.live}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Registration open or competition live
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 transition hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Drafts</p>
                <p className="mt-1 font-display text-2xl font-bold text-muted-foreground">
                  {stats.draft}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                <FileEdit className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Unpublished, admin-only records
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 transition hover:border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed / Archived</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  {stats.completed}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Preserved historical competitions
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search, Filters, and Sorting Card */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, slug, theme, or tagline…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status filter */}
              <div className="w-40 sm:w-44">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="registrations_open">Registrations Open</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="judging">Judging</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mode filter */}
              <div className="w-32 sm:w-36">
                <Select
                  value={modeFilter}
                  onValueChange={(val) => {
                    setModeFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort filter */}
              <div className="w-36 sm:w-44">
                <Select
                  value={sortOption}
                  onValueChange={(val) => {
                    setSortOption(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Created</SelectItem>
                    <SelectItem value="oldest">Oldest Created</SelectItem>
                    <SelectItem value="starts_soonest">Starts Soonest</SelectItem>
                    <SelectItem value="deadline">Registration Deadline</SelectItem>
                    <SelectItem value="recently_updated">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hackathons Table Card */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading hackathons from database…</p>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted/60 text-muted-foreground/50">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">No hackathons found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "No hackathon records match the active search or filters."
                  : "No hackathon records exist yet in the database."}
              </p>
              {hasActiveFilters ? (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={openCreateDialog} size="sm" className="mt-4 gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Create First Hackathon
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Hackathon</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Timeline</th>
                    <th className="px-4 py-3">Team Size</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {hackathons.map((h) => {
                    const statusBadge = STATUS_CONFIG[h.status];
                    const StatusIcon = statusBadge.icon;
                    const modeItem = MODE_CONFIG[h.mode];
                    const ModeIcon = modeItem.icon;

                    return (
                      <tr key={h.id} className="group transition hover:bg-muted/30">
                        {/* Title & Slug */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/70 bg-muted/40">
                              {h.banner_url ? (
                                <img
                                  src={h.banner_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Trophy className="h-4 w-4 text-muted-foreground/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInspectingItem(h)}
                                  className="font-semibold text-foreground hover:text-primary transition hover:underline text-left truncate max-w-xs"
                                >
                                  {h.title}
                                </button>
                                {h.is_featured && (
                                  <span title="Featured Competition">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  /{h.slug}
                                </span>
                                {h.theme && (
                                  <Badge
                                    variant="secondary"
                                    className="px-1.5 py-0 text-[9.5px] font-normal"
                                  >
                                    {h.theme}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            <StatusIcon className="h-3 w-3 shrink-0" />
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Format & Location */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ModeIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-medium text-foreground">{modeItem.label}</span>
                          </div>
                          {h.location && (
                            <p
                              className="mt-0.5 text-[10.5px] text-muted-foreground truncate max-w-[140px]"
                              title={h.location}
                            >
                              {h.location}
                            </p>
                          )}
                        </td>

                        {/* Timeline */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">
                              {fmtDate(h.starts_at)}
                            </span>
                            {h.ends_at && <span> — {fmtDate(h.ends_at)}</span>}
                          </div>
                          {h.registration_closes_at && (
                            <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0 text-amber-500/80" />
                              <span>Reg closes: {fmtDate(h.registration_closes_at)}</span>
                            </div>
                          )}
                        </td>

                        {/* Team Limits */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <span>
                            {h.min_team_size}–{h.max_team_size} members
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <span>{fmtDate(h.updated_at)}</span>
                        </td>

                        {/* Actions Menu */}
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 text-xs">
                              <DropdownMenuItem onClick={() => setInspectingItem(h)}>
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                View Full Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(h)}>
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                Edit Configuration
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to="/hackathons/$slug"
                                  params={{ slug: h.slug }}
                                  target="_blank"
                                >
                                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                  {h.status === "draft"
                                    ? "Preview Public Page"
                                    : "View Public Page"}
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Lifecycle Actions */}
                              {h.status === "draft" && (
                                <DropdownMenuItem
                                  onClick={() => promptPublish(h)}
                                  className="text-blue-600 focus:text-blue-600 dark:text-blue-400"
                                >
                                  <Globe className="mr-2 h-3.5 w-3.5" />
                                  Publish Hackathon
                                </DropdownMenuItem>
                              )}

                              {h.status !== "draft" && h.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => promptUnpublish(h)}
                                  className="text-amber-600 focus:text-amber-600 dark:text-amber-400"
                                >
                                  <FileEdit className="mr-2 h-3.5 w-3.5" />
                                  Unpublish (To Draft)
                                </DropdownMenuItem>
                              )}

                              {h.status !== "registrations_open" &&
                                h.status !== "archived" &&
                                h.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() => promptOpenRegistrations(h)}
                                    className="text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                                  >
                                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                                    Open Registrations
                                  </DropdownMenuItem>
                                )}

                              {h.status !== "ongoing" &&
                                h.status !== "archived" &&
                                h.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() => promptStartCompetition(h)}
                                    className="text-purple-600 focus:text-purple-600 dark:text-purple-400"
                                  >
                                    <Play className="mr-2 h-3.5 w-3.5" />
                                    Start Competition
                                  </DropdownMenuItem>
                                )}

                              {h.status !== "completed" && h.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => promptMarkCompleted(h)}
                                  className="text-teal-600 focus:text-teal-600 dark:text-teal-400"
                                >
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {h.status !== "archived" && (
                                <DropdownMenuItem
                                  onClick={() => promptArchive(h)}
                                  className="text-rose-600 focus:text-rose-600 dark:text-rose-400"
                                >
                                  <Archive className="mr-2 h-3.5 w-3.5" />
                                  Archive Competition
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

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          Showing {total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)}{" "}
          of {total} hackathons
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="gap-1 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Inspector Details Modal */}
      <Dialog
        open={!!inspectingItem}
        onOpenChange={(open) => {
          if (!open) setInspectingItem(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {inspectingItem && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
                  <div>
                    <DialogTitle className="font-display text-2xl font-bold">
                      {inspectingItem.title}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs mt-0.5">
                      /{inspectingItem.slug}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_CONFIG[inspectingItem.status].bg} ${STATUS_CONFIG[inspectingItem.status].text} ${STATUS_CONFIG[inspectingItem.status].border}`}
                    >
                      {STATUS_CONFIG[inspectingItem.status].label}
                    </span>
                    <Badge variant="outline">{MODE_CONFIG[inspectingItem.mode].label}</Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Cover Banner */}
              {inspectingItem.banner_url && (
                <div className="overflow-hidden rounded-xl border border-border/60 max-h-48">
                  <img
                    src={inspectingItem.banner_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-6 py-2">
                {/* Tagline & Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Overview
                  </h4>
                  {inspectingItem.tagline && (
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {inspectingItem.tagline}
                    </p>
                  )}
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {inspectingItem.description || "No description provided."}
                  </p>
                </div>

                {/* Key Dates Grid */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Timeline & Schedule
                  </h4>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Registration Opens</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.registration_opens_at)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Registration Closes</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.registration_closes_at)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Hackathon Starts</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.starts_at)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Hackathon Ends</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.ends_at)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Submission Deadline</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.submission_deadline)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Results Announcement</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {fmtDateTime(inspectingItem.results_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Participation & Venue Details */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Participation & Format
                  </h4>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Team Size Range</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {inspectingItem.min_team_size} to {inspectingItem.max_team_size} members
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Theme</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {inspectingItem.theme || "General"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[11px] text-muted-foreground">Venue / Location</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        {inspectingItem.location || "Online"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Eligibility & Rules */}
                {(inspectingItem.eligibility || inspectingItem.rules) && (
                  <div className="space-y-3">
                    {inspectingItem.eligibility && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Eligibility Guidelines
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                          {inspectingItem.eligibility}
                        </p>
                      </div>
                    )}
                    {inspectingItem.rules && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Competition Rules
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                          {inspectingItem.rules}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-[11px] text-muted-foreground flex flex-wrap gap-4">
                  <div>
                    <span className="font-medium text-foreground">Database ID:</span>{" "}
                    <span className="font-mono">{inspectingItem.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Created:</span>{" "}
                    {fmtDateTime(inspectingItem.created_at)}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Updated:</span>{" "}
                    {fmtDateTime(inspectingItem.updated_at)}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Link
                    to="/hackathons/$slug"
                    params={{ slug: inspectingItem.slug }}
                    target="_blank"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Public Page
                  </Link>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const item = inspectingItem;
                      setInspectingItem(null);
                      openEditDialog(item);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Configuration
                  </Button>
                  <Button size="sm" onClick={() => setInspectingItem(null)} className="text-xs">
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit: ${editingItem.title}` : "Create New Hackathon"}
            </DialogTitle>
            <DialogDescription>
              Configure competition metadata, dates, team boundaries, venue, media, and lifecycle
              state.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <Tabs value={formTab} onValueChange={setFormTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="text-xs">
                  General
                </TabsTrigger>
                <TabsTrigger value="dates" className="text-xs">
                  Dates & Deadlines
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs">
                  Format & Rules
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs">
                  Media & Status
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: General Info */}
              <TabsContent value="general" className="space-y-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="h-title">Hackathon Title *</Label>
                    <Input
                      id="h-title"
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Genesis AI Hackathon 2026"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-slug">URL Slug *</Label>
                    <Input
                      id="h-slug"
                      value={formSlug}
                      onChange={(e) => setFormSlug(slugify(e.target.value))}
                      placeholder="genesis-ai-hackathon-2026"
                      required
                    />
                    <p className="text-[10.5px] text-muted-foreground">
                      Public path: /hackathons/{formSlug || "..."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-theme">Theme / Category</Label>
                    <Input
                      id="h-theme"
                      value={formTheme}
                      onChange={(e) => setFormTheme(e.target.value)}
                      placeholder="e.g. Artificial Intelligence, Web3, FinTech"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="h-tagline">Tagline</Label>
                    <Input
                      id="h-tagline"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. Build the future of decentralized intelligent systems"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="h-desc">Full Description</Label>
                    <Textarea
                      id="h-desc"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      placeholder="Comprehensive overview of the hackathon, problem statements, and goals…"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/70 p-3 sm:col-span-2">
                    <div>
                      <Label htmlFor="h-featured" className="font-semibold text-sm cursor-pointer">
                        Featured Competition
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Pin this hackathon prominently in top hero carousels and highlight sections.
                      </p>
                    </div>
                    <Switch
                      id="h-featured"
                      checked={formIsFeatured}
                      onCheckedChange={setFormIsFeatured}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Dates & Deadlines */}
              <TabsContent value="dates" className="space-y-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="h-reg-open">Registration Opens</Label>
                    <Input
                      id="h-reg-open"
                      type="datetime-local"
                      value={formRegOpens}
                      onChange={(e) => setFormRegOpens(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-reg-close">Registration Deadline (Closes)</Label>
                    <Input
                      id="h-reg-close"
                      type="datetime-local"
                      value={formRegCloses}
                      onChange={(e) => setFormRegCloses(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-starts">Hackathon Kick-off (Starts At)</Label>
                    <Input
                      id="h-starts"
                      type="datetime-local"
                      value={formStartsAt}
                      onChange={(e) => setFormStartsAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-ends">Hackathon Concludes (Ends At)</Label>
                    <Input
                      id="h-ends"
                      type="datetime-local"
                      value={formEndsAt}
                      onChange={(e) => setFormEndsAt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-sub-deadline">Project Submission Deadline</Label>
                    <Input
                      id="h-sub-deadline"
                      type="datetime-local"
                      value={formSubmissionDeadline}
                      onChange={(e) => setFormSubmissionDeadline(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-results">Results Announced At</Label>
                    <Input
                      id="h-results"
                      type="datetime-local"
                      value={formResultsAt}
                      onChange={(e) => setFormResultsAt(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Format & Rules */}
              <TabsContent value="rules" className="space-y-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="h-mode">Event Mode</Label>
                    <Select value={formMode} onValueChange={(v) => setFormMode(v as HackathonMode)}>
                      <SelectTrigger id="h-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="in_person">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-loc">Venue / City Location</Label>
                    <Input
                      id="h-loc"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder={
                        formMode === "online"
                          ? "Online (Global)"
                          : "e.g. Bangalore International Center, Bengaluru"
                      }
                      disabled={formMode === "online"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-min-team">Min Team Size</Label>
                    <Input
                      id="h-min-team"
                      type="number"
                      min={1}
                      max={20}
                      value={formMinTeam}
                      onChange={(e) => setFormMinTeam(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-max-team">Max Team Size</Label>
                    <Input
                      id="h-max-team"
                      type="number"
                      min={1}
                      max={20}
                      value={formMaxTeam}
                      onChange={(e) => setFormMaxTeam(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="h-eligibility">Eligibility Guidelines</Label>
                    <Textarea
                      id="h-eligibility"
                      value={formEligibility}
                      onChange={(e) => setFormEligibility(e.target.value)}
                      rows={3}
                      placeholder="Requirements for participation, age brackets, student or professional credentials…"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="h-rules">Competition Rules</Label>
                    <Textarea
                      id="h-rules"
                      value={formRules}
                      onChange={(e) => setFormRules(e.target.value)}
                      rows={3}
                      placeholder="Code of conduct, originality guidelines, intellectual property policies…"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Media & Status */}
              <TabsContent value="media" className="space-y-4 pt-3">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cover Banner Image</Label>
                    <ImageUpload
                      value={formBannerUrl}
                      onChange={setFormBannerUrl}
                      folder="hackathons"
                      label="Hackathon Cover Banner"
                    />
                    <div className="mt-2">
                      <Label htmlFor="h-banner-manual" className="text-xs text-muted-foreground">
                        Or enter direct image URL:
                      </Label>
                      <Input
                        id="h-banner-manual"
                        value={formBannerUrl ?? ""}
                        onChange={(e) => setFormBannerUrl(e.target.value || null)}
                        placeholder="https://..."
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="h-status">Lifecycle Status</Label>
                    <Select
                      value={formStatus}
                      onValueChange={(v) => setFormStatus(v as HackathonStatus)}
                    >
                      <SelectTrigger id="h-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Admin only)</SelectItem>
                        <SelectItem value="published">Published (Public)</SelectItem>
                        <SelectItem value="registrations_open">
                          Registrations Open (Live)
                        </SelectItem>
                        <SelectItem value="ongoing">Ongoing (Active Competition)</SelectItem>
                        <SelectItem value="judging">Judging (Evaluation)</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived (Historical)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10.5px] text-muted-foreground">
                      Draft records remain invisible to participants on public listings.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

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
                {editingItem ? "Save Changes" : "Create Hackathon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Transition & Confirmation Alert Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((p) => ({ ...p, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmDialog.confirmVariant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={() => {
                void confirmDialog.action();
              }}
            >
              {confirmDialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
