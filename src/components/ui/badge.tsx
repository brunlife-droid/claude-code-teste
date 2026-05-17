import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-snug tracking-wide",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-text-muted border-border",
        primary: "bg-primary-soft text-primary border-primary-border",
        success: "bg-success-soft text-success-fg border-success/20",
        warning: "bg-warning-soft text-warning-fg border-warning/20",
        danger: "bg-danger-soft text-danger-fg border-danger/20",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({
  className,
  tone,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}
