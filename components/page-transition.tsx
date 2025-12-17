"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const transition: Transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.6, ease: smoothEase };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: -16, transition }}
        className="relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
