import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 hover:bg-primary/15",
        solid:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary/12 text-secondary ring-1 ring-inset ring-secondary/25 hover:bg-secondary/18",
        destructive:
          "border-transparent bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25 hover:bg-destructive/15",
        success: "border-transparent bg-success/12 text-success ring-1 ring-inset ring-success/25",
        warning:
          "border-transparent bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/30",
        outline: "text-foreground border-border/70 bg-background/60",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
