import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** Text field matching the system's semi-rounded control shape. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";