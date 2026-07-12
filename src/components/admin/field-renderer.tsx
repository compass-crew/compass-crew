import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { MarkdownEditor } from "./markdown-editor";
import type { FieldConfig } from "@/lib/admin-config";
import { slugify } from "@/lib/admin-api";

interface Props {
  field: FieldConfig;
  value: unknown;
  values: Record<string, unknown>;
  onChange: (v: unknown) => void;
}

function toIsoLocal(value: unknown): string {
  if (!value || typeof value !== "string") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FieldRenderer({ field, value, values, onChange }: Props) {
  const [jsonText, setJsonText] = useState<string>(() =>
    field.type === "json" ? JSON.stringify(value ?? (field.name === "data" ? {} : []), null, 2) : "",
  );

  useEffect(() => {
    if (field.type === "json") {
      setJsonText(JSON.stringify(value ?? (field.name === "data" ? {} : []), null, 2));
    }
     
  }, [value !== undefined ? JSON.stringify(value) : ""]);

  const commonId = `f-${field.name}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/40 px-4 py-3">
        <div>
          <Label htmlFor={commonId} className="font-medium">{field.label}</Label>
          {field.helpText && <p className="mt-0.5 text-xs text-muted-foreground">{field.helpText}</p>}
        </div>
        <Switch id={commonId} checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={commonId}>
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {(() => {
        switch (field.type) {
          case "textarea":
            return (
              <Textarea
                id={commonId}
                rows={field.rows ?? 4}
                value={(value as string) ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => onChange(e.target.value)}
              />
            );
          case "markdown":
            return (
              <MarkdownEditor
                value={(value as string) ?? ""}
                rows={field.rows ?? 10}
                onChange={onChange}
                placeholder={field.placeholder}
              />
            );
          case "image":
            return (
              <ImageUpload
                value={(value as string) ?? null}
                onChange={onChange}
                folder={field.folder ?? "misc"}
                label={field.label}
              />
            );
          case "select":
            return (
              <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
                <SelectTrigger id={commonId}>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          case "tags":
            return (
              <Input
                id={commonId}
                placeholder="Comma-separated (e.g. ai, ml, python)"
                value={Array.isArray(value) ? (value as string[]).join(", ") : ""}
                onChange={(e) => {
                  const parts = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  onChange(parts);
                }}
              />
            );
          case "number":
            return (
              <Input
                id={commonId}
                type="number"
                value={(value as number | null) ?? ""}
                onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
              />
            );
          case "datetime":
            return (
              <Input
                id={commonId}
                type="datetime-local"
                value={toIsoLocal(value)}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange(v ? new Date(v).toISOString() : null);
                }}
              />
            );
          case "email":
            return (
              <Input
                id={commonId}
                type="email"
                value={(value as string) ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => onChange(e.target.value)}
              />
            );
          case "url":
            return (
              <Input
                id={commonId}
                type="url"
                value={(value as string) ?? ""}
                placeholder={field.placeholder ?? "https://…"}
                onChange={(e) => onChange(e.target.value || null)}
              />
            );
          case "slug":
            return (
              <div className="flex gap-2">
                <Input
                  id={commonId}
                  value={(value as string) ?? ""}
                  placeholder="my-slug"
                  onChange={(e) => onChange(slugify(e.target.value))}
                />
                {field.from && (
                  <button
                    type="button"
                    className="rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const source = values[field.from!];
                      if (typeof source === "string" && source.trim()) onChange(slugify(source));
                    }}
                  >
                    From {field.from}
                  </button>
                )}
              </div>
            );
          case "json":
            return (
              <Textarea
                id={commonId}
                rows={field.rows ?? 6}
                value={jsonText}
                className="font-mono text-xs"
                onChange={(e) => {
                  setJsonText(e.target.value);
                  try {
                    onChange(JSON.parse(e.target.value));
                  } catch {
                    // keep raw text; validation on save
                  }
                }}
              />
            );
          default:
            return (
              <Input
                id={commonId}
                value={(value as string) ?? ""}
                placeholder={field.placeholder}
                onChange={(e) => onChange(e.target.value)}
              />
            );
        }
      })()}
      {field.helpText && field.type !== "boolean" && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
