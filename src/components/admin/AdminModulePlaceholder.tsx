import { Link } from "@tanstack/react-router";
import {
  type LucideIcon,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AdminModulePlaceholderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  capabilities: {
    title: string;
    description: string;
    permission: string;
  }[];
}

export function AdminModulePlaceholder({
  title,
  subtitle,
  icon: Icon,
  badge = "Foundation Initialized",
  capabilities,
}: AdminModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-background p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-2.5 w-2.5" />
                  {badge}
                </span>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:self-start">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/admin">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Console Overview</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Planned Architecture / Capability Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Planned Architectural Capabilities</span>
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Enforced by Server Authorization Layer
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <Card
              key={cap.title}
              className="border-border/60 bg-card/40 backdrop-blur-sm transition hover:border-primary/40 hover:bg-card/70"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {cap.title}
                  </CardTitle>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                    {cap.permission}
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {cap.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  <span>RLS & Server Guard Bound</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Architectural Security Notice */}
      <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            This route is strictly guarded by{" "}
            <code className="font-mono text-foreground">requireRole(["super_admin"])</code> and
            TanStack Start server guards. Direct URLs without authentication will be safely
            rejected.
          </span>
        </div>
        <Link
          to="/admin/security"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline whitespace-nowrap"
        >
          <span>View Security Policy</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
