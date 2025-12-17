import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/70 bg-muted/40 p-6 shadow-(--shadow-soft) backdrop-blur transition-[border-color,transform] duration-500",
        "before:pointer-events-none before:absolute before:-inset-[40%] before:-z-10 before:rounded-[160px] before:bg-[radial-gradient(120%_140%_at_0%_-20%,color-mix(in_oklab,var(--card-accent,var(--term-blue))_42%,transparent),transparent)] before:opacity-45 before:transition before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-['']",
        "hover:border-[color-mix(in_oklab,var(--card-accent,var(--term-blue))_55%,rgba(26,26,31,0.7))] hover:before:opacity-80",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(" space-y-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm uppercase tracking-[0.28em] text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-7 text-muted-foreground/90", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}
