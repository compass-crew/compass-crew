import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Upload,
  FolderOpen,
  Folder,
  Grid3x3,
  List as ListIcon,
  Copy,
  Trash2,
  Image as ImageIcon,
  FileText,
  Film,
  File as FileIcon,
  ArrowUp,
  Home,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { CMS_BUCKET, cmsMediaUrl } from "@/lib/cms-media";
import { cn } from "@/lib/utils";

import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/media")({
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [{ title: "Media Library — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: MediaPage,
});

interface StorageEntry {
  name: string;
  id: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  metadata?: { size?: number; mimetype?: string } | null;
}

function bytes(n: number | undefined | null) {
  if (!n || n <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function iconFor(mime?: string | null, name?: string) {
  if (mime?.startsWith("image/")) return ImageIcon;
  if (mime?.startsWith("video/")) return Film;
  if (mime === "application/pdf" || name?.toLowerCase().endsWith(".pdf")) return FileText;
  return FileIcon;
}

function MediaPage() {
  const [prefix, setPrefix] = useState<string>("");
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(CMS_BUCKET).list(p || undefined, {
        limit: 500,
        sortBy: { column: "updated_at", order: "desc" },
      });
      if (error) throw error;
      setEntries((data ?? []) as StorageEntry[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to list media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(prefix);
  }, [prefix, load]);

  // Total usage — walk one level (fast approximation)
  useEffect(() => {
    (async () => {
      let sum = 0;
      const walk = async (p: string, depth: number) => {
        if (depth > 2) return;
        const { data } = await supabase.storage
          .from(CMS_BUCKET)
          .list(p || undefined, { limit: 1000 });
        for (const e of data ?? []) {
          if (e.id) sum += (e.metadata as { size?: number } | null)?.size ?? 0;
          else await walk(p ? `${p}/${e.name}` : e.name, depth + 1);
        }
      };
      await walk("", 0);
      setTotalBytes(sum);
    })().catch(() => {});
  }, []);

  const folders = entries.filter((e) => !e.id);
  const files = entries.filter((e) => !!e.id);
  const filtered = search
    ? [
        ...folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
        ...files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
      ]
    : [...folders, ...files];

  const crumbs = prefix ? prefix.split("/").filter(Boolean) : [];

  function pathOf(name: string) {
    return prefix ? `${prefix}/${name}` : name;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const toastId = toast.loading(`Uploading ${files.length} file(s)…`);
    try {
      for (const file of Array.from(files)) {
        const key = pathOf(`${Date.now()}-${file.name}`);
        const { error } = await supabase.storage.from(CMS_BUCKET).upload(key, file, {
          upsert: false,
          contentType: file.type || undefined,
        });
        if (error) throw error;
      }
      toast.success("Uploaded", { id: toastId });
      void load(prefix);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.", { id: toastId });
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(entry: StorageEntry) {
    const key = pathOf(entry.name);
    try {
      const { error } = await supabase.storage.from(CMS_BUCKET).remove([key]);
      if (error) throw error;
      toast.success("Deleted");
      void load(prefix);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  function copyUrl(entry: StorageEntry) {
    const url = cmsMediaUrl(pathOf(entry.name));
    if (!url) return;
    const absolute = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(absolute).then(() => toast.success("URL copied"));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="space-y-6" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage every file across Compass Crew content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Total: {totalBytes == null ? "…" : bytes(totalBytes)}</Badge>
          <div className="flex overflow-hidden rounded-md border border-border">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Upload
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <button
              className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-muted"
              onClick={() => setPrefix("")}
            >
              <Home className="h-3.5 w-3.5" /> cms-media
            </button>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <button
                  className="rounded px-2 py-1 hover:bg-muted"
                  onClick={() => setPrefix(crumbs.slice(0, i + 1).join("/"))}
                >
                  {c}
                </button>
              </span>
            ))}
            {prefix && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setPrefix(crumbs.slice(0, -1).join("/"))}
              >
                <ArrowUp className="mr-1 h-3.5 w-3.5" /> Up
              </Button>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter in this folder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nothing here yet"
          description="Drop files anywhere on this page to upload."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((e) => {
            if (!e.id) {
              return (
                <button
                  key={e.name}
                  onClick={() => setPrefix(pathOf(e.name))}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  <Folder className="h-10 w-10 text-primary" />
                  <span className="truncate w-full text-center text-sm font-medium">{e.name}</span>
                </button>
              );
            }
            const mime = e.metadata?.mimetype;
            const isImage = mime?.startsWith("image/");
            const url = cmsMediaUrl(pathOf(e.name));
            const Icon = iconFor(mime, e.name);
            return (
              <div
                key={e.name}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-card"
              >
                <div className="grid aspect-square w-full place-items-center bg-muted/30">
                  {isImage && url ? (
                    <img
                      src={url}
                      alt={e.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1 p-2">
                  <p className="truncate text-xs font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{bytes(e.metadata?.size)}</p>
                </div>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={() => copyUrl(e)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <DeleteButton onConfirm={() => handleDelete(e)} name={e.name} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((e) => {
                if (!e.id) {
                  return (
                    <button
                      key={e.name}
                      onClick={() => setPrefix(pathOf(e.name))}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40"
                    >
                      <Folder className="h-5 w-5 text-primary" />
                      <span className="flex-1 truncate font-medium">{e.name}</span>
                    </button>
                  );
                }
                const Icon = iconFor(e.metadata?.mimetype, e.name);
                return (
                  <div key={e.name} className={cn("flex items-center gap-3 p-3")}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 truncate">{e.name}</span>
                    <span className="hidden text-xs text-muted-foreground md:inline">
                      {bytes(e.metadata?.size)}
                    </span>
                    <span className="hidden text-xs text-muted-foreground lg:inline">
                      {e.updated_at ? new Date(e.updated_at).toLocaleDateString() : ""}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => copyUrl(e)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteButton onConfirm={() => handleDelete(e)} name={e.name} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DeleteButton({ onConfirm, name }: { onConfirm: () => void; name: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive" className="h-7 w-7">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete file?</AlertDialogTitle>
          <AlertDialogDescription>
            {name} will be permanently removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
