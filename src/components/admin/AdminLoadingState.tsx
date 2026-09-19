import { Loader2 } from "lucide-react";

export function AdminLoadingState({ message = "Loading admin workspace…" }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md shadow-elegant">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">Authenticating credentials & permissions</p>
        </div>
      </div>
    </div>
  );
}
