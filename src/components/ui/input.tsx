import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-200",
          "placeholder:text-muted-foreground/70",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "hover:border-foreground/20",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
