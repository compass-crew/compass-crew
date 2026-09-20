import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/70", className)}>
      <CardContent className="relative flex flex-col items-center gap-3 px-5 py-8 text-center sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          style={{
            backgroundImage:
              "radial-gradient(40% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 70%)",
          }}
        />
        {Icon && (
          <span className="relative grid h-11 w-11 place-items-center rounded-xl border border-border/70 bg-card text-primary shadow-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="relative space-y-1">
          <h3 className="font-display text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h3>
          {description && (
            <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          )}
        </div>
        {(action || secondaryAction) && (
          <div className="relative mt-1 flex flex-wrap items-center justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
