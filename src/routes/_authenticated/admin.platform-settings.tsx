import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  fetchAllSettings,
  updateSettingsSection,
  type SettingsMap,
  type SettingsSection,
} from "@/lib/platform-settings";

export const Route = createFileRoute("/_authenticated/admin/platform-settings")({
  component: PlatformSettingsPage,
});

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "general", label: "General" },
  { key: "branding", label: "Branding" },
  { key: "homepage", label: "Homepage" },
  { key: "navigation", label: "Navigation" },
  { key: "footer", label: "Footer" },
  { key: "contact", label: "Contact" },
  { key: "social", label: "Social" },
  { key: "seo", label: "SEO" },
  { key: "analytics", label: "Analytics" },
];

function PlatformSettingsPage() {
  const [settings, setSettings] = useState<Partial<SettingsMap> | null>(null);
  const [saving, setSaving] = useState<SettingsSection | null>(null);

  useEffect(() => {
    fetchAllSettings()
      .then(setSettings)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load settings."));
  }, []);

  async function save<K extends SettingsSection>(section: K, data: SettingsMap[K]) {
    setSaving(section);
    try {
      await updateSettingsSection(section, data);
      setSettings((prev) => ({ ...(prev ?? {}), [section]: data }));
      toast.success("Saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  if (!settings) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure branding, navigation, SEO, and analytics for the entire platform. Changes go live immediately.
        </p>
      </header>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap gap-1">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.key} value={s.key}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <GeneralForm
            initial={settings.general}
            busy={saving === "general"}
            onSave={(d) => save("general", d)}
          />
        </TabsContent>
        <TabsContent value="branding">
          <BrandingForm
            initial={settings.branding}
            busy={saving === "branding"}
            onSave={(d) => save("branding", d)}
          />
        </TabsContent>
        <TabsContent value="homepage">
          <HomepageForm
            initial={settings.homepage}
            busy={saving === "homepage"}
            onSave={(d) => save("homepage", d)}
          />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationForm
            initial={settings.navigation}
            busy={saving === "navigation"}
            onSave={(d) => save("navigation", d)}
          />
        </TabsContent>
        <TabsContent value="footer">
          <FooterForm
            initial={settings.footer}
            busy={saving === "footer"}
            onSave={(d) => save("footer", d)}
          />
        </TabsContent>
        <TabsContent value="contact">
          <ContactForm
            initial={settings.contact}
            busy={saving === "contact"}
            onSave={(d) => save("contact", d)}
          />
        </TabsContent>
        <TabsContent value="social">
          <SocialForm
            initial={settings.social}
            busy={saving === "social"}
            onSave={(d) => save("social", d)}
          />
        </TabsContent>
        <TabsContent value="seo">
          <SeoForm
            initial={settings.seo}
            busy={saving === "seo"}
            onSave={(d) => save("seo", d)}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsForm
            initial={settings.analytics}
            busy={saving === "analytics"}
            onSave={(d) => save("analytics", d)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Section forms ----------

function SaveBar({ busy }: { busy: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save changes
      </Button>
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
  onSubmit,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </CardContent>
    </Card>
  );
}

function useSectionState<T extends object>(initial: T | undefined, fallback: T) {
  const [state, setState] = useState<T>(initial ?? fallback);
  useEffect(() => {
    if (initial) setState(initial);
  }, [initial]);
  return [state, setState] as const;
}

function GeneralForm({ initial, busy, onSave }: { initial?: SettingsMap["general"]; busy: boolean; onSave: (d: SettingsMap["general"]) => void }) {
  const [s, setS] = useSectionState(initial, { platform_name: "", tagline: "", description: "" });
  return (
    <SectionShell title="General" description="Public platform identity." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-2">
        <Label>Platform name</Label>
        <Input value={s.platform_name} onChange={(e) => setS({ ...s, platform_name: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Tagline</Label>
        <Input value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea rows={3} value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} />
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function BrandingForm({ initial, busy, onSave }: { initial?: SettingsMap["branding"]; busy: boolean; onSave: (d: SettingsMap["branding"]) => void }) {
  const [s, setS] = useSectionState(initial, { logo_url: "", favicon_url: "", hero_background_url: "", primary_color: "", accent_color: "" });
  return (
    <SectionShell title="Branding" description="Logo, favicon, hero image, and theme colours." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-4 md:grid-cols-3">
        <ImageUpload value={s.logo_url || null} folder="branding" label="Logo" onChange={(v) => setS({ ...s, logo_url: v ?? "" })} />
        <ImageUpload value={s.favicon_url || null} folder="branding" label="Favicon" onChange={(v) => setS({ ...s, favicon_url: v ?? "" })} />
        <ImageUpload value={s.hero_background_url || null} folder="branding" label="Hero background" onChange={(v) => setS({ ...s, hero_background_url: v ?? "" })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Primary colour (hex or hsl)</Label>
          <Input placeholder="#0ea5e9" value={s.primary_color} onChange={(e) => setS({ ...s, primary_color: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Accent colour</Label>
          <Input placeholder="#a855f7" value={s.accent_color} onChange={(e) => setS({ ...s, accent_color: e.target.value })} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Colours are stored here and consumed by pages that opt into dynamic theming. Existing design tokens continue to control the current UI.
      </p>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function HomepageForm({ initial, busy, onSave }: { initial?: SettingsMap["homepage"]; busy: boolean; onSave: (d: SettingsMap["homepage"]) => void }) {
  const [s, setS] = useSectionState(initial, {
    hero_title: "", hero_subtitle: "", cta_primary_label: "", cta_primary_url: "", cta_secondary_label: "", cta_secondary_url: "", stats: [],
  });
  return (
    <SectionShell title="Homepage" description="Hero text, calls to action, and headline statistics." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-2">
        <Label>Hero title</Label>
        <Input value={s.hero_title} onChange={(e) => setS({ ...s, hero_title: e.target.value })} />
      </div>
      <div className="grid gap-2">
        <Label>Hero subtitle</Label>
        <Textarea rows={2} value={s.hero_subtitle} onChange={(e) => setS({ ...s, hero_subtitle: e.target.value })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Primary CTA label</Label>
          <Input value={s.cta_primary_label} onChange={(e) => setS({ ...s, cta_primary_label: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Primary CTA URL</Label>
          <Input value={s.cta_primary_url} onChange={(e) => setS({ ...s, cta_primary_url: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Secondary CTA label</Label>
          <Input value={s.cta_secondary_label} onChange={(e) => setS({ ...s, cta_secondary_label: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Secondary CTA URL</Label>
          <Input value={s.cta_secondary_url} onChange={(e) => setS({ ...s, cta_secondary_url: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Stats</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => setS({ ...s, stats: [...s.stats, { label: "", value: "" }] })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add stat
          </Button>
        </div>
        {s.stats.length === 0 ? (
          <p className="text-xs text-muted-foreground">No stats yet.</p>
        ) : (
          s.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Label (e.g. Hackathons)" value={stat.label} onChange={(e) => {
                const next = [...s.stats]; next[i] = { ...next[i], label: e.target.value }; setS({ ...s, stats: next });
              }} />
              <Input placeholder="Value (e.g. 24)" value={stat.value} onChange={(e) => {
                const next = [...s.stats]; next[i] = { ...next[i], value: e.target.value }; setS({ ...s, stats: next });
              }} />
              <Button type="button" size="icon" variant="ghost" onClick={() => setS({ ...s, stats: s.stats.filter((_, j) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function LinksEditor({
  links,
  onChange,
  labelKey = "Label",
}: {
  links: { label: string; href: string }[];
  onChange: (v: { label: string; href: string }[]) => void;
  labelKey?: string;
}) {
  return (
    <div className="space-y-2">
      {links.length === 0 ? (
        <p className="text-xs text-muted-foreground">No links.</p>
      ) : (
        links.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input placeholder={labelKey} value={l.label} onChange={(e) => {
              const next = [...links]; next[i] = { ...next[i], label: e.target.value }; onChange(next);
            }} />
            <Input placeholder="/route or https://…" value={l.href} onChange={(e) => {
              const next = [...links]; next[i] = { ...next[i], href: e.target.value }; onChange(next);
            }} />
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(links.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...links, { label: "", href: "" }])}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add link
      </Button>
    </div>
  );
}

function NavigationForm({ initial, busy, onSave }: { initial?: SettingsMap["navigation"]; busy: boolean; onSave: (d: SettingsMap["navigation"]) => void }) {
  const [s, setS] = useSectionState(initial, { links: [] });
  return (
    <SectionShell title="Navigation" description="Top navigation links." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <LinksEditor links={s.links} onChange={(links) => setS({ ...s, links })} />
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function FooterForm({ initial, busy, onSave }: { initial?: SettingsMap["footer"]; busy: boolean; onSave: (d: SettingsMap["footer"]) => void }) {
  const [s, setS] = useSectionState(initial, { tagline: "", columns: [], copyright: "" });
  return (
    <SectionShell title="Footer" description="Footer tagline, columns of links, and copyright line." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-2">
        <Label>Footer tagline</Label>
        <Textarea rows={2} value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Link columns</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => setS({ ...s, columns: [...s.columns, { title: "", links: [] }] })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add column
          </Button>
        </div>
        {s.columns.map((col, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Column title" value={col.title} onChange={(e) => {
                const next = [...s.columns]; next[i] = { ...next[i], title: e.target.value }; setS({ ...s, columns: next });
              }} />
              <Button type="button" size="icon" variant="ghost" onClick={() => setS({ ...s, columns: s.columns.filter((_, j) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <LinksEditor links={col.links} onChange={(links) => {
              const next = [...s.columns]; next[i] = { ...next[i], links }; setS({ ...s, columns: next });
            }} />
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Label>Copyright line</Label>
        <Input placeholder="© 2026 Compass Crew" value={s.copyright} onChange={(e) => setS({ ...s, copyright: e.target.value })} />
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function ContactForm({ initial, busy, onSave }: { initial?: SettingsMap["contact"]; busy: boolean; onSave: (d: SettingsMap["contact"]) => void }) {
  const [s, setS] = useSectionState(initial, { support_email: "", press_email: "", phone: "", address: "" });
  return (
    <SectionShell title="Contact" description="Official contact details displayed publicly." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2"><Label>Support email</Label><Input type="email" value={s.support_email} onChange={(e) => setS({ ...s, support_email: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Press email</Label><Input type="email" value={s.press_email} onChange={(e) => setS({ ...s, press_email: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Phone</Label><Input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Address</Label><Input value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></div>
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function SocialForm({ initial, busy, onSave }: { initial?: SettingsMap["social"]; busy: boolean; onSave: (d: SettingsMap["social"]) => void }) {
  const [s, setS] = useSectionState(initial, { linkedin: "", instagram: "", github: "", x: "", youtube: "" });
  return (
    <SectionShell title="Social" description="Public profile URLs displayed in navbar and footer." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-4 md:grid-cols-2">
        {(["linkedin", "instagram", "github", "x", "youtube"] as const).map((k) => (
          <div className="grid gap-2" key={k}>
            <Label className="capitalize">{k}</Label>
            <Input value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
          </div>
        ))}
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function SeoForm({ initial, busy, onSave }: { initial?: SettingsMap["seo"]; busy: boolean; onSave: (d: SettingsMap["seo"]) => void }) {
  const [s, setS] = useSectionState(initial, { default_title: "", default_description: "", og_image_url: "", twitter_handle: "" });
  return (
    <SectionShell title="SEO" description="Default meta tags used across pages unless overridden." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-2"><Label>Default title</Label><Input value={s.default_title} onChange={(e) => setS({ ...s, default_title: e.target.value })} /></div>
      <div className="grid gap-2"><Label>Default description</Label><Textarea rows={3} value={s.default_description} onChange={(e) => setS({ ...s, default_description: e.target.value })} /></div>
      <ImageUpload value={s.og_image_url || null} folder="seo" label="Default Open Graph image" onChange={(v) => setS({ ...s, og_image_url: v ?? "" })} />
      <div className="grid gap-2"><Label>Twitter handle</Label><Input placeholder="@compasscrew" value={s.twitter_handle} onChange={(e) => setS({ ...s, twitter_handle: e.target.value })} /></div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}

function AnalyticsForm({ initial, busy, onSave }: { initial?: SettingsMap["analytics"]; busy: boolean; onSave: (d: SettingsMap["analytics"]) => void }) {
  const [s, setS] = useSectionState(initial, { ga4_id: "", gtm_id: "", plausible_domain: "", posthog_key: "" });
  return (
    <SectionShell title="Analytics" description="IDs for analytics providers. Values are safe to expose publicly." onSubmit={(e) => { e.preventDefault(); onSave(s); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2"><Label>Google Analytics 4 ID</Label><Input placeholder="G-XXXXXXX" value={s.ga4_id} onChange={(e) => setS({ ...s, ga4_id: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Google Tag Manager ID</Label><Input placeholder="GTM-XXXX" value={s.gtm_id} onChange={(e) => setS({ ...s, gtm_id: e.target.value })} /></div>
        <div className="grid gap-2"><Label>Plausible domain</Label><Input placeholder="compasscrew.com" value={s.plausible_domain} onChange={(e) => setS({ ...s, plausible_domain: e.target.value })} /></div>
        <div className="grid gap-2"><Label>PostHog key</Label><Input value={s.posthog_key} onChange={(e) => setS({ ...s, posthog_key: e.target.value })} /></div>
      </div>
      <SaveBar busy={busy} />
    </SectionShell>
  );
}
