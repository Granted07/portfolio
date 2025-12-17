"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { cn } from "@/lib/utils";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const underlineTransition: Transition = { duration: 0.32, ease: smoothEase };

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="hidden items-center gap-6 text-sm uppercase tracking-[0.18em] text-muted-foreground md:flex"
      >
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-2 transition-colors duration-200 hover:text-foreground"
            >
              {item.label}
              {isActive ? (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-0 -bottom-1 h-[1.5px] bg-foreground"
                  transition={underlineTransition}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <nav
        aria-label="Primary navigation"
        className="flex items-center gap-3 text-muted-foreground md:hidden"
      >
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                isActive ? "text-foreground" : "hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.7} />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
