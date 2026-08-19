import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../lib/utils";

const headingVariants = cva("font-display font-bold tracking-tight text-primary", {
  variants: {
    level: {
      1: "text-4xl leading-tight sm:text-5xl",
      2: "text-3xl leading-tight",
      3: "text-xl",
      4: "text-base",
    },
  },
  defaultVariants: { level: 2 },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4";
}

/** Alpine-modern display heading. `as` controls semantics, `level` controls scale. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, as, ...props }, ref) => {
    const Tag = as ?? (`h${level}` as "h1" | "h2" | "h3" | "h4");
    return <Tag ref={ref} className={cn(headingVariants({ level }), className)} {...props} />;
  },
);
Heading.displayName = "Heading";

export { headingVariants };