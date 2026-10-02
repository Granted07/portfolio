"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const label: Record<string, string> = { current: "research" };

export function Crumb() {
  const segs = usePathname().split("/").filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="fixed left-0 top-0 z-50 flex gap-2 px-6 py-4 text-xs mix-blend-difference md:px-16">
      <Link href="/" className="text-foreground hover:text-[#0dbc79]">~/anjishnu</Link>
      {segs.map((s) => (
        <span key={s} className="flex gap-2"><span className="text-dim">/</span><span style={{ color: "#0dbc79" }}>{label[s] ?? s}</span></span>
      ))}
    </nav>
  );
}