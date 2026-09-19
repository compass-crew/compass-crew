import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminErrorStateProps {
  error?: Error;
  reset?: () => void;
}

export function AdminErrorState({ error, reset }: AdminErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-inner">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="mb-2 font-display text-xl font-bold text-foreground">Workspace Error</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred while processing this administrative request. The failure has
          been safely isolated.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left font-mono text-xs text-red-400 overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          {reset && (
            <Button onClick={reset} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin">
              <LayoutDashboard className="h-4 w-4" /> Admin Overview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
