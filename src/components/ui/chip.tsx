import * as React from "react";
import { cn } from "@/lib/cn";

export const Chip = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "bg-surface-raised text-text-muted border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-[var(--shadow-xs)] transition-colors hover:border-primary-border hover:bg-primary-soft hover:text-primary",
      className,
    )}
    {...props}
  />
));
Chip.displayName = "Chip";
