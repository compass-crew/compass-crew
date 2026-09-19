import { Link, useLocation } from "@tanstack/react-router";
import {
  Search,
  Menu,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Shield,
  ExternalLink,
  Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from "@/lib/auth/roles";

interface AdminHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileNav?: () => void;
}

const SECTION_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/admin": { title: "Admin Console", subtitle: "Platform overview & content statistics" },
  "/admin/hackathons": {
    title: "Hackathons",
    subtitle: "Manage hackathon competitions & lifecycle",
  },
  "/admin/events": {
    title: "Events & Workshops",
    subtitle: "Community events, schedules & venues",
  },
  "/admin/teams": {
    title: "Teams & Submissions",
    subtitle: "Team rosters, projects & judging queues",
  },
  "/admin/applications": {
    title: "Applications",
    subtitle: "Review applicant submissions & approvals",
  },
  "/admin/sponsors": {
    title: "Sponsors Management",
    subtitle: "Corporate brands, tiering & inquiry queues",
  },
  "/admin/partners": {
    title: "Partners Management",
    subtitle: "Ecosystem alliances, academic hubs & partner queues",
  },
  "/admin/resources": {
    title: "Resources Management",
    subtitle: "Developer guides, starter kits & reference docs",
  },
  "/admin/content": { title: "Content Management", subtitle: "Platform pages, posts & resources" },
  "/admin/users": { title: "User Management", subtitle: "Roles, profiles & user lifecycle" },
  "/admin/analytics": { title: "Analytics", subtitle: "Platform telemetry & conversion metrics" },
  "/admin/security": {
    title: "Security Operations",
    subtitle: "Access control, session hygiene & posture",
  },
  "/admin/audit": { title: "Audit Trail", subtitle: "Immutable administrative event history" },
  "/admin/audit-logs": {
    title: "Audit Trail",
    subtitle: "Immutable administrative event history & security trail",
  },
  "/admin/emails": { title: "Email System", subtitle: "Templates, broadcasts & delivery logs" },
  "/admin/email": { title: "Email Broadcasts", subtitle: "Transactional and campaign mailer" },
  "/admin/media": { title: "Media Library", subtitle: "Asset uploads & CDN management" },
  "/admin/storage": {
    title: "Storage Buckets",
    subtitle: "Object store management & bucket policies",
  },
  "/admin/system": { title: "System Health", subtitle: "Infrastructure metrics & database health" },
  "/admin/platform-settings": {
    title: "Platform Settings",
    subtitle: "Global environment & feature toggles",
  },
  "/admin/activity": { title: "Activity Feed", subtitle: "Real-time user & admin events stream" },
  "/admin/admin-notifications": {
    title: "Admin Notifications",
    subtitle: "Platform alerts & escalated notices",
  },
};

export function AdminHeader({ onOpenSearch, onOpenMobileNav }: AdminHeaderProps) {
  const { pathname } = useLocation();
  const { user, profile, primaryRole, signOut } = useAuth();

  // Determine current title
  let section = SECTION_TITLES[pathname];
  if (!section) {
    // Check prefix
    const match = Object.keys(SECTION_TITLES).find(
      (prefix) => prefix !== "/admin" && pathname.startsWith(prefix),
    );
    section = match ? SECTION_TITLES[match] : { title: "Admin Console" };
  }

  const badge = ROLE_BADGE_VARIANTS[primaryRole];
  const userInitials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "AD";

  const { data: adminUnreadCount = 0 } = useQuery({
    queryKey: ["admin-notifications", "unread-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .eq("is_archived", false);
      if (error) return 0;
      return count ?? 0;
    },
    refetchInterval: 20000,
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left: Mobile Nav Toggle & Current Section Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileNav}
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-base sm:text-lg font-semibold tracking-tight text-foreground">
              {section.title}
            </h1>
            <span
              className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {ROLE_LABELS[primaryRole] ?? primaryRole}
            </span>
          </div>
          {section.subtitle && (
            <p className="hidden md:block text-xs text-muted-foreground">{section.subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Search, Return to App & User Identity Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="h-9 gap-2 border-border/60 bg-background/50 px-3 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Search console</span>
          <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </Button>

        {/* Return to platform link */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden lg:inline-flex h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Link to="/dashboard">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Platform</span>
          </Link>
        </Button>

        {/* Admin Notifications Bell */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          aria-label={
            adminUnreadCount > 0
              ? `${adminUnreadCount} unread platform alerts`
              : "Admin Notifications"
          }
        >
          <Link to="/admin/notifications">
            <Bell className="h-4 w-4" />
            {adminUnreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {adminUnreadCount > 99 ? "99+" : adminUnreadCount > 9 ? "9+" : adminUnreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0 ring-offset-background transition-all hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="User navigation menu"
            >
              <Avatar className="h-9 w-9 border border-border/60">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.full_name ?? user?.email ?? "Admin"}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none text-foreground truncate max-w-[150px]">
                    {profile?.full_name || "Admin User"}
                  </p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {ROLE_LABELS[primaryRole] ?? primaryRole}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/dashboard" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span>Go to User Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin/security" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Security Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
