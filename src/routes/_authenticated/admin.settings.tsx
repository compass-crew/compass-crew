import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ShieldCheck,
  Sliders,
  Bell,
  Palette,
  FileText,
  Building,
  CheckCircle2,
} from "lucide-react";
import { requireRole } from "@/lib/auth-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  fetchAllSettings,
  updateSettingsSection,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_CONTENT_SETTINGS,
  DEFAULT_NOTIFICATIONS_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  type SettingsMap,
  type SettingsSection,
} from "@/lib/platform-settings";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  beforeLoad: requireRole(["super_admin"], { allowForbiddenState: true }),
  head: () => ({
    meta: [
      { title: "Settings — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminSettingsPage,
});

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<SettingsMap> | null>(null);
  const [saving, setSaving] = useState<SettingsSection | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchAllSettings()
      .then((loaded) => setSettings(loaded))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load settings."));
  }, []);

  async function save<K extends SettingsSection>(section: K, data: SettingsMap[K]) {
    setSaving(section);
    try {
      await updateSettingsSection(section, data);
      setSettings((prev) => ({ ...(prev ?? {}), [section]: data }));
      toast.success(`Settings saved for ${section}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs uppercase tracking-wider font-semibold">
            Loading platform settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Platform Settings
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary text-[11px] font-mono"
            >
              Live Configuration
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage platform identity, maintenance mode, system flags, notifications, and review
            security policies.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              settings.platform?.maintenance_mode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            }`}
          />
          <span className="font-medium text-foreground">
            {settings.platform?.maintenance_mode
              ? "Maintenance Mode Active"
              : "Systems Operational"}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 p-1 sm:grid-cols-3 lg:grid-cols-6 bg-muted/40">
          <TabsTrigger value="general" className="flex items-center gap-1.5 text-xs">
            <Building className="h-3.5 w-3.5" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-1.5 text-xs">
            <Sliders className="h-3.5 w-3.5" />
            <span>Platform</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Security QA</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            <span>Branding & SEO</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. GENERAL SETTINGS */}
        <TabsContent value="general">
          <GeneralForm
            initial={settings.general}
            busy={saving === "general"}
            onSave={(d) => save("general", d)}
          />
        </TabsContent>

        {/* 2. PLATFORM & MAINTENANCE SETTINGS */}
        <TabsContent value="platform">
          <PlatformForm
            initial={settings.platform}
            busy={saving === "platform"}
            onSave={(d) => save("platform", d)}
          />
        </TabsContent>

        {/* 3. CONTENT & ANNOUNCEMENTS */}
        <TabsContent value="content">
          <ContentForm
            initial={settings.content}
            busy={saving === "content"}
            onSave={(d) => save("content", d)}
          />
        </TabsContent>

        {/* 4. NOTIFICATIONS */}
        <TabsContent value="notifications">
          <NotificationsForm
            initial={settings.notifications}
            busy={saving === "notifications"}
            onSave={(d) => save("notifications", d)}
          />
        </TabsContent>

        {/* 5. SECURITY REVIEW (SAFE UI SETTINGS) */}
        <TabsContent value="security">
          <SecurityForm
            initial={settings.security}
            busy={saving === "security"}
            onSave={(d) => save("security", d)}
          />
        </TabsContent>

        {/* 6. BRANDING, SOCIAL & SEO */}
        <TabsContent value="branding">
          <div className="space-y-6">
            <BrandingForm
              initial={settings.branding}
              busy={saving === "branding"}
              onSave={(d) => save("branding", d)}
            />
            <SocialForm
              initial={settings.social}
              busy={saving === "social"}
              onSave={(d) => save("social", d)}
            />
            <SeoForm
              initial={settings.seo}
              busy={saving === "seo"}
              onSave={(d) => save("seo", d)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// SUB-FORMS & SECTIONS
// =============================================================================

function SaveBar({ busy }: { busy: boolean }) {
  return (
    <div className="flex justify-end pt-4 border-t border-border/50">
      <Button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground min-w-[140px]"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}

function SectionShell({
  title,
  description,
  badge,
  children,
  onSubmit,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          {badge && (
            <Badge variant="secondary" className="text-[10px] font-mono">
              {badge}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          {children}
        </form>
      </CardContent>
    </Card>
  );
}

function useSectionState<T extends object>(initial: T | undefined, fallback: T) {
  const [state, setState] = useState<T>(initial ? { ...fallback, ...initial } : fallback);
  useEffect(() => {
    if (initial) setState({ ...fallback, ...initial });
  }, [initial, fallback]);
  return [state, setState] as const;
}

// -----------------------------------------------------------------------------
// 1. General Form
// -----------------------------------------------------------------------------
function GeneralForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["general"];
  busy: boolean;
  onSave: (d: SettingsMap["general"]) => void;
}) {
  const [s, setS] = useSectionState(initial, DEFAULT_GENERAL_SETTINGS);

  return (
    <SectionShell
      title="General Identity & Organization"
      description="Primary public identity and official contact channels for the platform."
      badge="Publicly Visible"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform_name">Platform Name</Label>
          <Input
            id="platform_name"
            value={s.platform_name}
            onChange={(e) => setS({ ...s, platform_name: e.target.value })}
            placeholder="Compass Crew"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Official Public Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={s.contact_email}
            onChange={(e) => setS({ ...s, contact_email: e.target.value })}
            placeholder="compasscrewnetwork.team@gmail.com"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Approved organization email displayed across footer, landing, and legal notices.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={s.tagline}
          onChange={(e) => setS({ ...s, tagline: e.target.value })}
          placeholder="An Entrepreneurship & Innovation Community"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Platform Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={s.description}
          onChange={(e) => setS({ ...s, description: e.target.value })}
          placeholder="Describe Compass Crew community mission and scope..."
        />
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

// -----------------------------------------------------------------------------
// 2. Platform & System Form (Maintenance Mode & Feature Flags)
// -----------------------------------------------------------------------------
function PlatformForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["platform"];
  busy: boolean;
  onSave: (d: SettingsMap["platform"]) => void;
}) {
  const [s, setS] = useSectionState(initial, DEFAULT_PLATFORM_SETTINGS);

  return (
    <SectionShell
      title="Platform Operations & Feature Flags"
      description="Manage platform-wide availability, maintenance mode, and core module feature switches."
      badge="Administrative Control"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      {/* Maintenance Mode Card */}
      <div
        className={`rounded-lg border p-4 transition-colors ${
          s.maintenance_mode ? "border-amber-500/40 bg-amber-500/10" : "border-border/80 bg-card/40"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Maintenance Mode</span>
              {s.maintenance_mode ? (
                <Badge variant="destructive" className="bg-amber-600 text-white text-[10px]">
                  ACTIVE
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-emerald-500 border-emerald-500/30 text-[10px]"
                >
                  OFFLINE
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, non-admin visitors navigating to public pages will see a scheduled
              maintenance notice.
            </p>
          </div>
          <Switch
            checked={s.maintenance_mode}
            onCheckedChange={(checked) => setS({ ...s, maintenance_mode: checked })}
          />
        </div>

        {s.maintenance_mode && (
          <div className="mt-4 space-y-2 border-t border-amber-500/20 pt-3">
            <Label htmlFor="maintenance_message" className="text-xs text-foreground">
              Public Maintenance Notice Message
            </Label>
            <Textarea
              id="maintenance_message"
              rows={2}
              value={s.maintenance_message}
              onChange={(e) => setS({ ...s, maintenance_message: e.target.value })}
              placeholder="Compass Crew is currently undergoing scheduled platform upgrades..."
            />
          </div>
        )}

        <Alert className="mt-3 border-border/50 bg-background/50 py-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertTitle className="text-xs font-semibold">Admin Access Guaranteed</AlertTitle>
          <AlertDescription className="text-[11px] text-muted-foreground">
            Platform administrators (<code className="font-mono text-primary">super_admin</code>)
            always retain uninterrupted access to the Admin Console and{" "}
            <code className="font-mono text-primary">/auth</code> login during maintenance mode.
          </AlertDescription>
        </Alert>
      </div>

      {/* Registration Control */}
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">User Registration State</span>
              {s.registration_open ? (
                <Badge
                  variant="outline"
                  className="text-emerald-500 border-emerald-500/30 text-[10px]"
                >
                  OPEN
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-amber-500 text-[10px]">
                  CLOSED
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Control whether new participants can sign up via{" "}
              <code className="font-mono text-xs">/auth</code>.
            </p>
          </div>
          <Switch
            checked={s.registration_open}
            onCheckedChange={(checked) => setS({ ...s, registration_open: checked })}
          />
        </div>
      </div>

      {/* Core Feature Flags */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Core Module Feature Flags
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Enable or disable platform areas dynamically without code redeployment.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Events Flag */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Events Module</p>
              <p className="text-[11px] text-muted-foreground">
                Public workshops, webinars & meetups
              </p>
            </div>
            <Switch
              checked={s.features?.events ?? true}
              onCheckedChange={(c) =>
                setS({ ...s, features: { ...(s.features ?? {}), events: c } })
              }
            />
          </div>

          {/* Community Flag */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Community Module</p>
              <p className="text-[11px] text-muted-foreground">
                Chapters, member directory & forums
              </p>
            </div>
            <Switch
              checked={s.features?.community ?? true}
              onCheckedChange={(c) =>
                setS({ ...s, features: { ...(s.features ?? {}), community: c } })
              }
            />
          </div>

          {/* Resources Flag */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Resources Module</p>
              <p className="text-[11px] text-muted-foreground">
                Learning library, templates & guides
              </p>
            </div>
            <Switch
              checked={s.features?.resources ?? true}
              onCheckedChange={(c) =>
                setS({ ...s, features: { ...(s.features ?? {}), resources: c } })
              }
            />
          </div>

          {/* Hackathons Flag */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Hackathons Module</p>
              <p className="text-[11px] text-muted-foreground">
                Competition portal & team submissions
              </p>
            </div>
            <Switch
              checked={s.features?.hackathons ?? true}
              onCheckedChange={(c) =>
                setS({ ...s, features: { ...(s.features ?? {}), hackathons: c } })
              }
            />
          </div>
        </div>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

// -----------------------------------------------------------------------------
// 3. Content Form (Announcements & Banners)
// -----------------------------------------------------------------------------
function ContentForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["content"];
  busy: boolean;
  onSave: (d: SettingsMap["content"]) => void;
}) {
  const [s, setS] = useSectionState(initial, DEFAULT_CONTENT_SETTINGS);

  return (
    <SectionShell
      title="Content & Announcements"
      description="Control sitewide announcements and top notification banners."
      badge="Global Banner"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="space-y-1">
          <span className="font-semibold text-sm text-foreground">Top Announcement Banner</span>
          <p className="text-xs text-muted-foreground">
            Display a highlighted banner message at the top of every public platform page.
          </p>
        </div>
        <Switch
          checked={s.announcement_banner_enabled}
          onCheckedChange={(checked) => setS({ ...s, announcement_banner_enabled: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_text">Announcement Message Text</Label>
        <Input
          id="banner_text"
          value={s.announcement_banner_text}
          onChange={(e) => setS({ ...s, announcement_banner_text: e.target.value })}
          placeholder="e.g. 🚀 Registrations are now open for National Student AI Hackathon 2026!"
          disabled={!s.announcement_banner_enabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner_link">Banner Destination Link URL</Label>
        <Input
          id="banner_link"
          value={s.announcement_banner_link}
          onChange={(e) => setS({ ...s, announcement_banner_link: e.target.value })}
          placeholder="/hackathons or https://..."
          disabled={!s.announcement_banner_enabled}
        />
        <p className="text-[11px] text-muted-foreground">
          Must be an internal route (e.g. /hackathons) or safe https:// URL.
        </p>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

// -----------------------------------------------------------------------------
// 4. Notifications Form
// -----------------------------------------------------------------------------
function NotificationsForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["notifications"];
  busy: boolean;
  onSave: (d: SettingsMap["notifications"]) => void;
}) {
  const [s, setS] = useSectionState(initial, DEFAULT_NOTIFICATIONS_SETTINGS);

  return (
    <SectionShell
      title="Platform Notifications Behavior"
      description="Configure platform-level broadcast channels and dispatch policies."
      badge="Alerts Configuration"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="space-y-1">
            <span className="font-semibold text-sm text-foreground">System Broadcast Alerts</span>
            <p className="text-xs text-muted-foreground">
              Allow platform administrators to push in-app broadcast alerts to all connected
              accounts.
            </p>
          </div>
          <Switch
            checked={s.system_alerts_enabled}
            onCheckedChange={(c) => setS({ ...s, system_alerts_enabled: c })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="space-y-1">
            <span className="font-semibold text-sm text-foreground">
              Transactional Email Notifications
            </span>
            <p className="text-xs text-muted-foreground">
              Send system emails for registration confirmations, submissions, certificates, and
              alerts.
            </p>
          </div>
          <Switch
            checked={s.email_notifications_enabled}
            onCheckedChange={(c) => setS({ ...s, email_notifications_enabled: c })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="space-y-1">
            <span className="font-semibold text-sm text-foreground">
              Default Broadcast Audience
            </span>
            <p className="text-xs text-muted-foreground">
              Include all verified participants and mentors in sitewide milestone announcements.
            </p>
          </div>
          <Switch
            checked={s.broadcast_to_all_users}
            onCheckedChange={(c) => setS({ ...s, broadcast_to_all_users: c })}
          />
        </div>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

// -----------------------------------------------------------------------------
// 5. Security QA & Posture Form (Safe UI Configuration Only)
// -----------------------------------------------------------------------------
function SecurityForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["security"];
  busy: boolean;
  onSave: (d: SettingsMap["security"]) => void;
}) {
  const [s, setS] = useSectionState(initial, DEFAULT_SECURITY_SETTINGS);

  return (
    <div className="space-y-6">
      {/* Security Posture Status Banner */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle className="font-display text-lg font-semibold text-foreground">
                Platform Security Architecture
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-500 text-[11px] font-mono"
            >
              Enforced Server-Side
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Audit of verified security controls and active isolation policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Super Admin RBAC</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                All 15 /admin/* subroutes guarded with{" "}
                <code className="font-mono">requireRole</code>.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Last-Admin Safety</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Database RPC blocks revoking the last active platform super administrator.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Row Level Security (RLS)</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Active on all core tables (platform_settings, audit_logs, users, hackathons).
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Cloudflare Turnstile</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Server-side secret validation prevents bot spam on public forms.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Secrets Isolation</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Service role keys & SMTP passwords strictly isolated to server functions.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Open Redirect Defense</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Strict relative-path check rejects external URL injection in auth queries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurable Safe Security Settings Form */}
      <SectionShell
        title="Session & Protection Parameters"
        description="Safe configuration parameters that can be customized for platform defense."
        badge="Safe Parameters"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(s);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session_timeout">Session Inactivity Timeout (Hours)</Label>
            <Input
              id="session_timeout"
              type="number"
              min={1}
              max={168}
              value={s.session_timeout_hours}
              onChange={(e) =>
                setS({ ...s, session_timeout_hours: parseInt(e.target.value, 10) || 24 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit_info">Audit Logging Integrity</Label>
            <Input
              id="audit_info"
              readOnly
              value="Append-Only Trail via logAdminAction()"
              className="bg-muted text-muted-foreground font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Enforce Email Verification</p>
              <p className="text-[11px] text-muted-foreground">
                Require email confirmation before allowing team submission
              </p>
            </div>
            <Switch
              checked={s.enforce_email_verification}
              onCheckedChange={(c) => setS({ ...s, enforce_email_verification: c })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Turnstile Bot Challenge on Auth
              </p>
              <p className="text-[11px] text-muted-foreground">
                Protect signup and login endpoints against credential stuffing
              </p>
            </div>
            <Switch
              checked={s.turnstile_protection}
              onCheckedChange={(c) => setS({ ...s, turnstile_protection: c })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">API Rate Limiting Enforcement</p>
              <p className="text-[11px] text-muted-foreground">
                Throttle repeated requests across public submission endpoints
              </p>
            </div>
            <Switch
              checked={s.rate_limiting_enabled}
              onCheckedChange={(c) => setS({ ...s, rate_limiting_enabled: c })}
            />
          </div>
        </div>

        <SaveBar busy={busy} />
      </SectionShell>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 6. Branding & SEO Forms
// -----------------------------------------------------------------------------
function BrandingForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["branding"];
  busy: boolean;
  onSave: (d: SettingsMap["branding"]) => void;
}) {
  const [s, setS] = useSectionState(initial, {
    logo_url: "",
    favicon_url: "",
    hero_background_url: "",
    primary_color: "",
    accent_color: "",
  });

  return (
    <SectionShell
      title="Brand Assets & Visual Tokens"
      description="Logos, favicon, background artwork, and custom palette tokens."
      badge="Visual Identity"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <ImageUpload
          value={s.logo_url || null}
          folder="branding"
          label="Platform Logo"
          onChange={(v) => setS({ ...s, logo_url: v ?? "" })}
        />
        <ImageUpload
          value={s.favicon_url || null}
          folder="branding"
          label="Favicon"
          onChange={(v) => setS({ ...s, favicon_url: v ?? "" })}
        />
        <ImageUpload
          value={s.hero_background_url || null}
          folder="branding"
          label="Hero Background Artwork"
          onChange={(v) => setS({ ...s, hero_background_url: v ?? "" })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primary_color">Primary Color (Hex)</Label>
          <Input
            id="primary_color"
            placeholder="#3b46f4"
            value={s.primary_color}
            onChange={(e) => setS({ ...s, primary_color: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accent_color">Accent Color (Hex)</Label>
          <Input
            id="accent_color"
            placeholder="#7c5cff"
            value={s.accent_color}
            onChange={(e) => setS({ ...s, accent_color: e.target.value })}
          />
        </div>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function SocialForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["social"];
  busy: boolean;
  onSave: (d: SettingsMap["social"]) => void;
}) {
  const [s, setS] = useSectionState(initial, {
    linkedin: "https://www.linkedin.com/company/compasscrewindia",
    instagram: "https://www.instagram.com/compasscrewnetwork",
    github: "",
    x: "",
    youtube: "",
  });

  return (
    <SectionShell
      title="Official Social Profiles"
      description="Public channels rendered in navigation and footer."
      badge="Approved Profiles"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="social_linkedin">LinkedIn URL</Label>
          <Input
            id="social_linkedin"
            value={s.linkedin}
            onChange={(e) => setS({ ...s, linkedin: e.target.value })}
            placeholder="https://www.linkedin.com/company/compasscrewindia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_instagram">Instagram URL</Label>
          <Input
            id="social_instagram"
            value={s.instagram}
            onChange={(e) => setS({ ...s, instagram: e.target.value })}
            placeholder="https://www.instagram.com/compasscrewnetwork"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_x">X / Twitter Handle or URL</Label>
          <Input
            id="social_x"
            value={s.x}
            onChange={(e) => setS({ ...s, x: e.target.value })}
            placeholder="https://x.com/compasscrew"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_youtube">YouTube Channel</Label>
          <Input
            id="social_youtube"
            value={s.youtube}
            onChange={(e) => setS({ ...s, youtube: e.target.value })}
            placeholder="https://youtube.com/@compasscrew"
          />
        </div>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function SeoForm({
  initial,
  busy,
  onSave,
}: {
  initial?: SettingsMap["seo"];
  busy: boolean;
  onSave: (d: SettingsMap["seo"]) => void;
}) {
  const [s, setS] = useSectionState(initial, {
    default_title: "Compass Crew — AI, Tech & Startup Community for Students",
    default_description:
      "Compass Crew is a student-led community running hackathons, workshops, bootcamps and startup programs in AI, technology and innovation across India.",
    og_image_url: "",
    twitter_handle: "@compasscrew",
  });

  return (
    <SectionShell
      title="Search Engine Optimization (SEO)"
      description="Sitewide meta titles, OpenGraph description tags, and social cards."
      badge="Search & Sharing"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(s);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="seo_title">Default Page Title</Label>
        <Input
          id="seo_title"
          value={s.default_title}
          onChange={(e) => setS({ ...s, default_title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo_desc">Default Meta Description</Label>
        <Textarea
          id="seo_desc"
          rows={3}
          value={s.default_description}
          onChange={(e) => setS({ ...s, default_description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="twitter_handle">Twitter/X Handle</Label>
          <Input
            id="twitter_handle"
            placeholder="@compasscrew"
            value={s.twitter_handle}
            onChange={(e) => setS({ ...s, twitter_handle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <ImageUpload
            value={s.og_image_url || null}
            folder="seo"
            label="OpenGraph Preview Image"
            onChange={(v) => setS({ ...s, og_image_url: v ?? "" })}
          />
        </div>
      </div>

      <SaveBar busy={busy} />
    </SectionShell>
  );
}
