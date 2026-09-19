import { useState, type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { CommandPalette, useCommandPaletteShortcut } from "./command-palette";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface AdminShellProps {
  children?: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Global keyboard shortcut for command palette (⌘K / Ctrl+K)
  useCommandPaletteShortcut(() => setPaletteOpen((v) => !v));

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar (fixed/sticky) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <AdminSidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] border-r border-border/60">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for the Compass Crew admin console
          </SheetDescription>
          <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Admin Header */}
        <AdminHeader
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        {/* Page Content Outlet */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children ?? <Outlet />}</div>
        </main>
      </div>

      {/* Admin Command Palette */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
