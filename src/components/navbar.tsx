import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Settings, Shield, User as UserIcon, X, Users, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useAuth, ROLE_LABEL } from "@/hooks/use-auth";

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/hackathons", label: "Hackathons" },
  { to: "/events", label: "Events" },
  { to: "/community", label: "Community" },
  { to: "/resources", label: "Resources" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, primaryRole, hasRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = ((profile?.full_name ?? user?.email ?? "?").trim()[0] ?? "?").toUpperCase();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out.");
    navigate({ to: "/" });
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "pt-3" : "pt-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div
          className={`flex w-full items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-300 ${
            scrolled
              ? "border-border/60 bg-background/70 shadow-elegant backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
              : "border-transparent bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/30"
          }`}
        >
          <Logo />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {NAV_LINKS.slice(1).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="group relative rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground data-[status=active]:text-foreground"
              >
                <span className="relative z-10">{l.label}</span>
                <span
                  aria-hidden
                  className="absolute inset-0 -z-0 rounded-full bg-muted/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-data-[status=active]:opacity-100"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-4 -bottom-[3px] h-[2px] rounded-full bg-gradient-brand opacity-0 transition-opacity duration-200 group-data-[status=active]:opacity-100"
                />
              </Link>
            ))}
          </nav>


        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 rounded-full px-1.5 sm:px-2.5">
                  <Avatar className="h-7 w-7 ring-1 ring-border">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-brand text-xs text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                    {profile?.full_name ?? user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="pb-2">
                  <p className="text-sm font-semibold">{profile?.full_name ?? "Compass member"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {ROLE_LABEL[primaryRole]}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/teams">
                    <Users className="mr-2 h-4 w-4" /> My teams
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/invitations">
                    <Mail className="mr-2 h-4 w-4" /> Invitations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                {hasRole("super_admin") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" /> Admin Console
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden h-9 rounded-md text-sm sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                asChild
                className="hidden h-9 rounded-md text-sm btn-premium hover:btn-premium-hover sm:inline-flex"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Join the crew
                </Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-0">
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle className="flex items-center justify-between">
                  <Logo />
                  <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 py-6" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    className="rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 px-2">
                  {user ? (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOpen(false);
                          void handleSignOut();
                        }}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/auth">Sign in</Link>
                      </Button>
                      <Button
                        asChild
                        className="btn-premium hover:btn-premium-hover"
                        onClick={() => setOpen(false)}
                      >
                        <Link to="/auth" search={{ mode: "signup" }}>
                          Join the crew
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>

  );
}
