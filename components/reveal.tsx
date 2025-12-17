"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import type { ReactNode } from "react";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const revealTransition: Transition = { duration: 0.7, ease: smoothEase };

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      viewport={{ once: true, amount: 0.2 }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
