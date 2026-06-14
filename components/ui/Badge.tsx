import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "blue" | "gray" | "red";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "gray", children, ...props }, ref) => {
    const variants = {
      green: "bg-success/10 text-success border-success/20",
      blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
      gray: "bg-surface-muted text-text-muted border-border",
      red: "bg-error/10 text-error border-error/20",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
