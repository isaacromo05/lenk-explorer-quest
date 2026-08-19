import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../lib/utils";

export interface MedalProps extends HTMLAttributes<HTMLDivElement> {
  /** Reward label, e.g. "Summit Master". */
  label: string;
  /** Locked medals render neutral; gold is reserved for unlocked rewards. */
  locked?: boolean;
}

/** Reward medal. Gold styling applies only when unlocked. */
export const Medal = forwardRef<HTMLDivElement, MedalProps>(
  ({ className, label, locked = false, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center gap-2", className)} {...props}>
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full text-xl font-bold",
          locked
            ? "border border-border bg-background text-text-muted"
            : "bg-gold text-gold-foreground shadow-md",
        )}
        aria-hidden="true"
      >
        {children ?? (locked ? "?" : "★")}
      </div>
      <span className={cn("text-xs font-semibold", locked ? "text-text-muted" : "text-primary")}>
        {label}
      </span>
    </div>
  ),
);
Medal.displayName = "Medal";