"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const underlineTransition: Transition = { duration: 0.32, ease: smoothEase };

export function MainNav() {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false, tone: "var(--term-blue)" });

  const updateIndicator = useCallback(() => {
    const navEl = desktopNavRef.current;
    if (!navEl) {
      return;
    }

    const activeLink = navEl.querySelector<HTMLElement>("[data-active='true']");
    if (!activeLink) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    setIndicator({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      visible: true,
      tone: activeLink.dataset.tone ?? "var(--term-blue)",
    });
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [pathname, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        ref={desktopNavRef}
        className="relative hidden items-center gap-6 text-sm uppercase tracking-[0.18em] text-muted-foreground md:flex"
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-[1.5px]"
          animate={{
            x: indicator.left,
            width: indicator.width,
            opacity: indicator.visible ? 1 : 0,
            backgroundColor: indicator.tone,
          }}
          transition={underlineTransition}
        />
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive ? "true" : undefined}
              data-tone={item.tone}
              style={isActive ? { color: item.tone } : undefined}
              className="relative py-2 transition-colors duration-200 hover:text-foreground"
            >
              {item.label}
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
                isActive ? undefined : "hover:text-foreground"
              )}
              style={isActive ? {
                color: item.tone,
                boxShadow: `0 0 0 1px ${item.tone}, 0 10px 24px -16px ${item.tone}`,
                backgroundColor: "color-mix(in oklab, var(--background) 75%, transparent)",
              } : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={1.7} style={isActive ? { color: item.tone } : undefined} />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
