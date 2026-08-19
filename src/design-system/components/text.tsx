import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../lib/utils";

const textVariants = cva("font-sans", {
  variants: {
    tone: { default: "text-text", muted: "text-text-muted", inverse: "text-primary-foreground" },
    size: { sm: "text-sm leading-relaxed", md: "text-base leading-relaxed", lg: "text-lg leading-relaxed" },
  },
  defaultVariants: { tone: "default", size: "md" },
});

export interface TextProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

/** Body copy tuned for outdoor legibility. */
export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, tone, size, ...props }, ref) => (
    <p ref={ref} className={cn(textVariants({ tone, size }), className)} {...props} />
  ),
);
Text.displayName = "Text";

export { textVariants };