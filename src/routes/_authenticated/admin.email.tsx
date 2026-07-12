import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Eye, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/markdown";
import {
  fetchEmailProviderSettings,
  updateEmailProviderSettings,
  listEmailTemplates,
  updateEmailTemplate,
  renderTemplatePreview,
  PROVIDER_OPTIONS,
  type EmailProviderSettings,
  type EmailProvider,
  type EmailTemplate,
} from "@/lib/email-config";

export const Route = createFileRoute("/_authenticated/admin/email")({
  component: EmailAdminPage,
});

function EmailAdminPage() {
  const [provider, setProvider] = useState<EmailProviderSettings | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  async function refresh() {
    try {
      const [p, t] = await Promise.all([fetchEmailProviderSettings(), listEmailTemplates()]);
      setProvider(p);
      setTemplates(t);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load email settings.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your email provider and edit templates. Templates use <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{variable}}"}</code> placeholders.
        </p>
      </header>

      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="provider">
          {provider ? (
            <ProviderForm initial={provider} onSaved={refresh} />
          ) : (
            <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesList
            templates={templates}
            onEdit={setEditing}
          />
        </TabsContent>
      </Tabs>

      <TemplateEditorDialog
        template={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); void refresh(); }}
      />
    </div>
  );
}

// ---------- Provider ----------

function ProviderForm({ initial, onSaved }: { initial: EmailProviderSettings; onSaved: () => void }) {
  const [s, setS] = useState<EmailProviderSettings>(initial);
  const [busy, setBusy] = useState(false);

  const option = PROVIDER_OPTIONS.find((o) => o.value === s.provider)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateEmailProviderSettings({
        provider: s.provider,
        from_email: s.from_email,
        from_name: s.from_name,
        reply_to: s.reply_to,
        config: s.config,
        is_active: s.is_active,
      });
      toast.success("Saved.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Provider</CardTitle>
        <CardDescription>
          Choose which service sends outbound email. Provider secrets are stored separately as environment variables — set them when activating a non-Lovable provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select value={s.provider} onValueChange={(v) => setS({ ...s, provider: v as EmailProvider })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{option.description}</p>
            {option.requiresSecrets.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {option.requiresSecrets.map((k) => (
                  <Badge key={k} variant="outline" className="font-mono text-[10px]">{k}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>From email</Label>
              <Input type="email" placeholder="hello@yourdomain.com" value={s.from_email} onChange={(e) => setS({ ...s, from_email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>From name</Label>
              <Input value={s.from_name} onChange={(e) => setS({ ...s, from_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Reply-to</Label>
              <Input type="email" value={s.reply_to} onChange={(e) => setS({ ...s, reply_to: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={s.is_active} onCheckedChange={(v) => setS({ ...s, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>

          {s.provider !== "lovable" && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Architecture is ready. To send with {option.label}, add the required secrets to the project and wire a send helper in a server function. No emails will be sent until credentials are configured.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save provider
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------- Templates list ----------

function TemplatesList({ templates, onEdit }: { templates: EmailTemplate[] | null; onEdit: (t: EmailTemplate) => void }) {
  if (templates === null) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center py-16 text-center text-sm text-muted-foreground">
          <Mail className="mb-3 h-8 w-8 opacity-40" />
          No email templates yet.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {templates.map((t) => (
        <Card key={t.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{t.key}</p>
              </div>
              <Badge variant={t.is_active ? "default" : "outline"}>{t.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            {t.description && <CardDescription className="mt-2">{t.description}</CardDescription>}
          </CardHeader>
          <CardContent className="mt-auto space-y-3">
            <p className="line-clamp-1 text-sm"><span className="text-muted-foreground">Subject:</span> {t.subject || <em className="text-muted-foreground">empty</em>}</p>
            {t.variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {t.variables.map((v) => (
                  <Badge key={v} variant="outline" className="font-mono text-[10px]">{`{{${v}}}`}</Badge>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => onEdit(t)}>Edit</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- Template editor ----------

function TemplateEditorDialog({ template, onClose, onSaved }: { template: EmailTemplate | null; onClose: () => void; onSaved: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState(true);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setSubject(template.subject);
      setBody(template.body_markdown);
      setActive(template.is_active);
      setPreviewValues(Object.fromEntries(template.variables.map((v) => [v, ""])));
      setShowPreview(false);
    }
  }, [template]);

  const previewSubject = useMemo(
    () => (template ? renderTemplatePreview(subject, template.variables, previewValues) : ""),
    [subject, template, previewValues],
  );
  const previewBody = useMemo(
    () => (template ? renderTemplatePreview(body, template.variables, previewValues) : ""),
    [body, template, previewValues],
  );

  async function save() {
    if (!template) return;
    setBusy(true);
    try {
      await updateEmailTemplate(template.id, { subject, body_markdown: body, is_active: active });
      toast.success("Template saved.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        {template && (
          <>
            <DialogHeader>
              <DialogTitle>{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={active} onCheckedChange={setActive} id="active" />
                <Label htmlFor="active">Active</Label>
                <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowPreview((v) => !v)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> {showPreview ? "Hide preview" : "Show preview"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Body (Markdown)</Label>
                <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm" />
              </div>

              {template.variables.length > 0 && (
                <div className="rounded-md border border-border p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Available variables</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline" className="cursor-pointer font-mono text-[10px]" onClick={() => {
                        navigator.clipboard.writeText(`{{${v}}}`);
                        toast.success(`Copied {{${v}}}`);
                      }}>{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {showPreview && (
                <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preview</p>
                  </div>
                  {template.variables.length > 0 && (
                    <div className="grid gap-2 md:grid-cols-2">
                      {template.variables.map((v) => (
                        <div key={v} className="grid gap-1">
                          <Label className="text-xs">{`{{${v}}}`}</Label>
                          <Input
                            value={previewValues[v] ?? ""}
                            onChange={(e) => setPreviewValues((p) => ({ ...p, [v]: e.target.value }))}
                            placeholder={`Sample ${v}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-md bg-background p-4">
                    <p className="mb-2 text-xs text-muted-foreground">Subject</p>
                    <p className="font-semibold">{previewSubject}</p>
                    <div className="mt-4 border-t border-border pt-4">
                      <Markdown content={previewBody} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={save} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save template
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
