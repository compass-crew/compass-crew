import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  FolderOpen,
  Handshake,
  HeartPulse,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  Newspaper,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { globalSearch, hitHref, KIND_LABEL, pushRecentSearch, readRecentSearches, type SearchHit } from "@/lib/admin-search";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const QUICK_ACTIONS: Array<{ label: string; to: string; icon: React.ComponentType<{ className?: string }> }> = [
  { label: "Admin overview", to: "/admin", icon: LayoutDashboard },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Media library", to: "/admin/media", icon: ImageIcon },
  { label: "Security center", to: "/admin/security", icon: ShieldCheck },
  { label: "Storage", to: "/admin/storage", icon: FolderOpen },
  { label: "Audit logs", to: "/admin/audit", icon: History },
  { label: "Notifications", to: "/admin/admin-notifications", icon: Bell },
  { label: "System health", to: "/admin/system", icon: HeartPulse },
  { label: "Platform settings", to: "/admin/platform-settings", icon: Settings },
  { label: "Blog posts", to: "/admin/blog-posts", icon: Newspaper },
  { label: "Events", to: "/admin/site-events", icon: Calendar },
  { label: "Partners", to: "/admin/partners", icon: Handshake },
  { label: "Careers", to: "/admin/careers", icon: Briefcase },
];

export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (open) setRecent(readRecentSearches());
  }, [open]);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!query.trim()) {
      setHits([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(async () => {
      try {
        const r = await globalSearch(query);
        setHits(r);
      } catch {
        setHits([]);
      } finally {
        setBusy(false);
      }
    }, 180);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [query]);

  const grouped = useMemo(() => {
    const g: Record<string, SearchHit[]> = {};
    for (const h of hits) (g[h.kind] ||= []).push(h);
    return g;
  }, [hits]);

  function go(to: string) {
    onOpenChange(false);
    if (query.trim()) pushRecentSearch(query.trim());
    setTimeout(() => {
      navigate({ to });
    }, 0);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search users, hackathons, posts, applications…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>{busy ? "Searching…" : "No results. Try a different keyword."}</CommandEmpty>

        {!query.trim() && recent.length > 0 && (
          <>
            <CommandGroup heading="Recent searches">
              {recent.map((r) => (
                <CommandItem key={r} value={`recent-${r}`} onSelect={() => setQuery(r)}>
                  <Search className="mr-2 h-4 w-4" /> {r}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {!query.trim() && (
          <CommandGroup heading="Quick actions">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <CommandItem key={a.to} value={a.label} onSelect={() => go(a.to)}>
                  <Icon className="mr-2 h-4 w-4" /> {a.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {Object.entries(grouped).map(([kind, list]) => (
          <CommandGroup key={kind} heading={KIND_LABEL[kind as keyof typeof KIND_LABEL] ?? kind}>
            {list.map((h) => (
              <CommandItem key={`${h.kind}-${h.id}`} value={`${h.kind}-${h.id}-${h.title ?? ""}`} onSelect={() => go(hitHref(h))}>
                <Search className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{h.title ?? "(untitled)"}</span>
                {h.subtitle && <span className="ml-2 truncate text-xs text-muted-foreground">{h.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook that toggles the palette on ⌘/Ctrl + K. */
export function useCommandPaletteShortcut(onToggle: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onToggle]);
}
