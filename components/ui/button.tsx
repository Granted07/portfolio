import type react from "react";
import { cn } from "@/lib/utils";

type ButtonProps = react.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md";
};

const sizeMap = {
  sm: "h-9 px-4 text-[11px]",
  md: "h-11 px-5 text-xs",
} as const;

const variantMap = {
  default:
    "bg-foreground text-background transition hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground",
  outline:
    "border border-border text-foreground hover:border-foreground hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground",
} as const;

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full uppercase tracking-[0.3em] transition duration-(--transition-base)",
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
}
