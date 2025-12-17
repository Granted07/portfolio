"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const snappyEase: [number, number, number, number] = [0.32, 1, 0.68, 1];

const nameVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: smoothEase },
  },
};

const tagVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + index * 0.06, duration: 0.5, ease: snappyEase },
  }),
};

const orbitTags = ["Systems", "Fullstack", "Security"];

export function Hero() {
  return (
    <section className="relative flex min-h-[68vh] flex-col items-center justify-center overflow-hidden rounded-[40px] border border-border/80 bg-muted/30 px-6 text-center shadow-(--shadow-soft)">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(113,113,122,0.12),transparent_60%)]" />
      {/* <BackgroundRippleEffect /> */}
      <motion.div
        className="relative z-0 flex flex-col items-center gap-6"
        initial="hidden"
        animate="visible"
        variants={nameVariants}
      >
        <motion.span className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
          Engineering notebooks
        </motion.span>
        <motion.h1
          className="text-5xl font-medium uppercase tracking-[0.24em] text-foreground sm:text-6xl md:text-7xl"
          variants={nameVariants}
        >
          Anjishnu Dey
        </motion.h1>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial="hidden"
          animate="visible"
        >
          {orbitTags.map((label, index) => (
            <motion.div key={label} custom={index} variants={tagVariants}>
              <Badge className="bg-transparent text-foreground/90">{label}</Badge>
            </motion.div>
          ))}
        </motion.div>
        <motion.p className="max-w-md text-sm leading-7 text-muted-foreground" variants={nameVariants}>
          Notes on full stack and systems.
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.28em] text-muted-foreground"
          variants={nameVariants}
        >
          <Link
            href="/projects"
            className="rounded-full border border-border px-4 py-2 transition-colors duration-[var(--transition-base)] hover:border-foreground hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-4 py-2 transition-colors duration-[var(--transition-base)] hover:border-foreground hover:text-foreground"
          >
            Contact
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
