import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Newspaper,
  BookOpen,
  Calendar,
  Megaphone,
  Award,
  Handshake,
  Inbox,
  Gavel,
  GraduationCap,
  UserRoundCog,
  Briefcase,
  MessageSquare,
  MailPlus,
  LayoutTemplate,
  Settings,
  Mail,
  ArrowLeft,
  BarChart3,
  ShieldCheck,
  Bell,
  Activity,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { RESOURCES } from "@/lib/admin-config";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  LayoutTemplate,
  Newspaper,
  BookOpen,
  Calendar,
  Megaphone,
  Award,
  Handshake,
  Inbox,
  Gavel,
  GraduationCap,
  UserRoundCog,
  Briefcase,
  MessageSquare,
  MailPlus,
};

export function AdminSidebar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="w-full shrink-0 border-b border-border bg-card/40 md:w-64 md:border-b-0 md:border-r">
      <div className="flex flex-col gap-1 p-4">
        <Link
          to="/dashboard"
          className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to app
        </Link>
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
            path === "/admin"
              ? "bg-gradient-brand text-white"
              : "text-foreground/80 hover:bg-muted hover:text-foreground",
          )}
        >
          <LayoutDashboard className="h-4 w-4" /> Overview
        </Link>
        <div className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Content
        </div>
        {RESOURCES.map((r) => {
          const Icon = ICONS[r.icon] ?? Newspaper;
          const active = path === `/admin/${r.key}` || path.startsWith(`/admin/${r.key}/`);
          return (
            <Link
              key={r.key}
              to="/admin/$resource"
              params={{ resource: r.key }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {r.plural}
            </Link>
          );
        })}
        <div className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          System
        </div>
        <Link
          to="/admin/platform-settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
            path.startsWith("/admin/platform-settings")
              ? "bg-muted font-semibold text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings className="h-4 w-4" /> Platform Settings
        </Link>
        <Link
          to="/admin/email"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
            path.startsWith("/admin/email")
              ? "bg-muted font-semibold text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Mail className="h-4 w-4" /> Email
        </Link>
      </div>
    </aside>
  );
}
