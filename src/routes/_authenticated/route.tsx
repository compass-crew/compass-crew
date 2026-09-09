import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. Fast check for active session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentPath = location.pathname + (location.searchStr || "");
    const safeDest = safeRedirect(currentPath, "/dashboard");

    if (!sessionData.session) {
      throw redirect({
        to: "/auth",
        search: safeDest !== "/auth" && !safeDest.startsWith("/auth") ? { redirect: safeDest } : undefined,
      });
    }

    // 2. Validate session with Supabase Auth server
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw redirect({
        to: "/auth",
        search: safeDest !== "/auth" && !safeDest.startsWith("/auth") ? { redirect: safeDest } : undefined,
      });
    }

    return { user: userData.user };
  },
  component: () => <Outlet />,
});
