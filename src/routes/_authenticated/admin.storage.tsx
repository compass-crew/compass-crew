import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, FolderOpen, HardDrive, Image as ImageIcon, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CMS_BUCKET } from "@/lib/cms-media";

import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/storage")({
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({ meta: [{ title: "Storage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: StoragePage,
});

interface BucketStat {
  bucket: string;
  files: number;
  bytes: number;
  largest: { name: string; size: number }[];
  recent: { name: string; updated_at: string | null; size: number }[];
}

function humanBytes(n: number) {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

async function scanBucket(bucket: string): Promise<BucketStat> {
  const all: { name: string; size: number; updated_at: string | null }[] = [];
  const walk = async (p: string, depth: number) => {
    if (depth > 3) return;
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(p || undefined, { limit: 1000 });
    if (error) throw error;
    for (const e of data ?? []) {
      if (e.id) {
        const meta = (e.metadata as { size?: number } | null) ?? null;
        all.push({
          name: p ? `${p}/${e.name}` : e.name,
          size: meta?.size ?? 0,
          updated_at: e.updated_at ?? null,
        });
      } else {
        await walk(p ? `${p}/${e.name}` : e.name, depth + 1);
      }
    }
  };
  await walk("", 0);
  const bytes = all.reduce((s, f) => s + f.size, 0);
  const largest = [...all].sort((a, b) => b.size - a.size).slice(0, 5);
  const recent = [...all]
    .filter((f) => f.updated_at)
    .sort((a, b) => (b.updated_at! > a.updated_at! ? 1 : -1))
    .slice(0, 5);
  return { bucket, files: all.length, bytes, largest, recent };
}

function StoragePage() {
  const [stats, setStats] = useState<BucketStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all([
          scanBucket(CMS_BUCKET),
          scanBucket("certificates").catch(() => null),
        ]);
        setStats(results.filter((s): s is BucketStat => !!s));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load storage stats.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  const grand = stats.reduce((s, b) => s + b.bytes, 0);
  const grandFiles = stats.reduce((s, b) => s + b.files, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Storage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bucket usage across Compass Crew.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/media">
            <FolderOpen className="mr-1.5 h-4 w-4" /> Open Media Library
          </Link>
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total files</p>
              <p className="mt-1 font-display text-3xl font-semibold">{grandFiles}</p>
            </div>
            <FileText className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total usage</p>
              <p className="mt-1 font-display text-3xl font-semibold">{humanBytes(grand)}</p>
            </div>
            <HardDrive className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Buckets</p>
              <p className="mt-1 font-display text-3xl font-semibold">{stats.length}</p>
            </div>
            <ImageIcon className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
      </div>

      {stats.map((b) => (
        <Card key={b.bucket}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{b.bucket}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{b.files} files</Badge>
              <Badge>{humanBytes(b.bytes)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Largest files
              </p>
              {b.largest.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {b.largest.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between gap-3 border-b border-border/40 pb-1"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{humanBytes(f.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Recently uploaded
              </p>
              {b.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent uploads.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {b.recent.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between gap-3 border-b border-border/40 pb-1"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.updated_at ? new Date(f.updated_at).toLocaleDateString() : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
