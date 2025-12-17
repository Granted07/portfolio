import Link from "next/link";
import { profile } from "@/lib/profile";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/40 px-6 py-10 text-xs text-muted-foreground sm:px-10 md:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-semibold tracking-[0.3em] uppercase">{profile.name}</p>
          <p className="max-w-sm leading-relaxed">
            Building calm, systems-driven products that feel inevitable.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-right sm:text-left">
          <Link
            href={`mailto:${profile.email}`}
            className="transition-colors duration-150 hover:text-foreground"
          >
            {profile.email}
          </Link>
          <Link
            href={profile.github}
            className="transition-colors duration-150 hover:text-foreground"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link
            href={profile.linkedin}
            className="transition-colors duration-150 hover:text-foreground"
            rel="noopener noreferrer"
          >
            LinkedIn
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-8 flex w-full max-w-5xl justify-between text-[10px] uppercase tracking-[0.28em]">
        <span>© {new Date().getFullYear()} Anjishnu Dey</span>
        <span className="text-right">Engineered with Next.js & Tailwind CSS v4</span>
      </div>
    </footer>
  );
}
