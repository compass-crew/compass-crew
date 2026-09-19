import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Users2,
  Award,
  Users,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  ArrowLeft,
  ChevronDown,
  UserCheck,
  Gavel,
  Handshake,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { RESOURCES } from "@/lib/admin-config";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from "@/lib/auth/roles";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { primaryRole } = useAuth();
  const [cmsOpen, setCmsOpen] = useState(false);

  const badge = ROLE_BADGE_VARIANTS[primaryRole] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };

  const NAV_GROUPS: NavGroup[] = [
    {
      heading: "Overview",
      items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      heading: "Manage",
      items: [
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/hackathons", label: "Hackathons", icon: Trophy },
        { to: "/admin/events", label: "Events", icon: Calendar },
        { to: "/admin/community", label: "Community", icon: Users2 },
        { to: "/admin/mentors", label: "Mentors", icon: UserCheck },
        { to: "/admin/judges", label: "Judges", icon: Gavel },
        { to: "/admin/sponsors", label: "Sponsors", icon: Award },
        { to: "/admin/partners", label: "Partners", icon: Handshake },
        { to: "/admin/resources", label: "Resources", icon: BookOpen },
      ],
    },
    {
      heading: "Content",
      items: [
        { to: "/admin/content", label: "Content", icon: FileText },
        { to: "/admin/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      heading: "System",
      items: [
        { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
        { to: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-border/60 bg-card/40 backdrop-blur-md md:w-64",
        className,
      )}
    >
      {/* Brand / Role pill top */}
      <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
        <Link
          to="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground transition hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-sm font-mono text-xs">
            CC
          </div>
          <span>Compass Admin</span>
        </Link>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {ROLE_LABELS[primaryRole] ?? primaryRole}
        </span>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {/* Return to platform link */}
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="mb-4 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit to App Dashboard</span>
        </Link>

        {/* Groups */}
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="mb-4">
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {group.heading}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isExact = item.to === "/admin" ? pathname === "/admin" : pathname === item.to;
                const isChild =
                  item.to !== "/admin" &&
                  (pathname.startsWith(item.to + "/") ||
                    (item.to === "/admin/audit-logs" && pathname.startsWith("/admin/audit")) ||
                    (item.to === "/admin/settings" &&
                      pathname.startsWith("/admin/platform-settings")) ||
                    (item.to === "/admin/notifications" &&
                      pathname.startsWith("/admin/admin-notifications")));

                const active = isExact || isChild;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition",
                      active
                        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 transition",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Generic CMS Direct Table Access Collapsible */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setCmsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 transition hover:text-foreground"
          >
            <span>Direct Table Inspector ({RESOURCES.length})</span>
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", cmsOpen ? "rotate-0" : "-rotate-90")}
            />
          </button>

          {cmsOpen && (
            <div className="mt-1 space-y-0.5 pl-2 border-l border-border/40 ml-2">
              {RESOURCES.map((r) => {
                const active =
                  pathname === `/admin/${r.key}` || pathname.startsWith(`/admin/${r.key}/`);
                return (
                  <Link
                    key={r.key}
                    to="/admin/$resource"
                    params={{ resource: r.key }}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition",
                      active
                        ? "bg-muted font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    <span className="truncate">{r.plural}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer / System status indicator */}
      <div className="border-t border-border/60 p-3 text-[10px] text-muted-foreground flex items-center justify-between">
        <span className="font-mono">v2.5.0-admin</span>
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Operating System Active
        </span>
      </div>
    </aside>
  );
}
