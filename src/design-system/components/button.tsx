import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes } from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover",
        gold: "bg-gold text-gold-foreground shadow-md hover:bg-gold-hover",
        outline: "border border-border bg-surface text-text shadow-sm hover:bg-background",
        ghost: "text-primary hover:bg-border/60",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/** Primary action control. Use `gold` only for reward/premium actions. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
        ref,
        ...props,
      });
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
