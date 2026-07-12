import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CommandPalette, useCommandPaletteShortcut } from "@/components/admin/command-palette";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data: rolesRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const roles = (rolesRows ?? []).map((r) => r.role as string);
    if (!roles.includes("super_admin")) {
      throw redirect({ to: "/dashboard" });
    }
    return { user: userData.user };
  },
  head: () => ({
    meta: [{ title: "Admin — Compass Crew" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteShortcut(() => setPaletteOpen((v) => !v));

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            className="gap-2 text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="pointer-events-none ml-2 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
              ⌘K
            </kbd>
          </Button>
        </div>
        <Outlet />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </main>
    </div>
  );
}
