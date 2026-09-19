import { useState, useEffect, useMemo } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "./field-renderer";
import type { ResourceConfig } from "@/lib/admin-config";
import { createRow, updateRow, softDeleteRow } from "@/lib/admin-api";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  resource: ResourceConfig;
  initial?: Record<string, unknown>;
  id?: string;
}

export function AdminForm({ resource, initial, id }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(() => initial ?? {});

  const isNew = !id;
  const { handleSubmit, formState } = useForm<FieldValues>({ defaultValues: initial ?? {} });

  useEffect(() => {
    setValues(initial ?? {});
  }, [initial]);

  const cleanedFields = useMemo(() => resource.fields, [resource]);

  function setField(name: string, v: unknown) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function onSubmit() {
    // Required-field validation
    for (const f of resource.fields) {
      if (!f.required) continue;
      const v = values[f.name];
      const missing =
        v === undefined ||
        v === null ||
        (typeof v === "string" && !v.trim()) ||
        (Array.isArray(v) && v.length === 0);
      if (missing) {
        toast.error(`${f.label} is required.`);
        return;
      }
    }
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of resource.fields) {
        payload[f.name] = values[f.name] ?? null;
      }
      if (isNew) {
        const created = await createRow(resource, payload);
        toast.success(`${resource.singular} created.`);
        navigate({
          to: "/admin/$resource/$itemId",
          params: { resource: resource.key, itemId: (created.id as string) ?? "" },
        });
      } else {
        await updateRow(resource, id!, payload);
        toast.success("Saved.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm(`Delete this ${resource.singular.toLowerCase()}? It can be restored later.`))
      return;
    setDeleting(true);
    try {
      await softDeleteRow(resource, id);
      toast.success("Deleted.");
      navigate({ to: "/admin/$resource", params: { resource: resource.key } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
      aria-busy={busy || formState.isSubmitting}
    >
      {cleanedFields.map((f) => (
        <FieldRenderer
          key={f.name}
          field={f}
          value={values[f.name]}
          values={values}
          onChange={(v) => setField(f.name, v)}
        />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={busy}
            className="bg-gradient-brand text-white hover:opacity-90"
          >
            {busy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            {isNew ? "Create" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: "/admin/$resource", params: { resource: resource.key } })}
          >
            Cancel
          </Button>
        </div>
        {!isNew && resource.softDelete && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}
