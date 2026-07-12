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
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="relative flex flex-col items-center gap-4 px-6 py-14 text-center sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          style={{
            backgroundImage:
              "radial-gradient(40% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)",
          }}
        />
        {Icon && (
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-border/70 bg-card text-primary shadow-elegant">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
        <div className="relative space-y-1.5">
          <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {(action || secondaryAction) && (
          <div className="relative mt-2 flex flex-wrap items-center justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
