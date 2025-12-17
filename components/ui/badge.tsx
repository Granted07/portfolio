import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
