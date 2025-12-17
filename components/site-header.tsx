import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { profile } from "@/lib/profile";

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
      <div className="pointer-events-auto mt-6 flex sm:w-full max-w-5xl items-center justify-center sm:justify-between rounded-full border border-white/10 bg-muted/25 px-6 sm:py-3 backdrop-blur-sm">
        <Link href="/" className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:text-foreground md:inline">
          {profile.name}
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
