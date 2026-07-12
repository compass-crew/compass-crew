import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
