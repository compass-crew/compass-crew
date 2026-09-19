import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { useAuth } from "@/hooks/use-auth";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md shadow-elegant">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Securing session…</p>
          <p className="text-xs text-muted-foreground">Verifying access to Compass Crew</p>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const { loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  return <Outlet />;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: requireAuth({ requireOnboarding: true }),
  pendingComponent: AuthLoadingScreen,
  component: AuthenticatedLayout,
});
