"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/projects";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } },
};

const accentPalette = [
  "var(--term-blue)",
  "var(--term-magenta)",
  "var(--term-green)",
  "var(--term-yellow)",
  "var(--term-red)",
];

export function ProjectTeasers() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Project Archive</h2>
        <Link
          href="/projects"
          className="text-[11px] uppercase tracking-[0.28em] transition-colors duration-[--transition-base] hover:opacity-85"
          style={{ color: "var(--term-magenta)" }}
        >
          View archive →
        </Link>
      </div>
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
      >
        {projects.slice(0, 2).map((project, index) => {
          const cardTone = accentPalette[index % accentPalette.length];
          const timeframeTone = accentPalette[(index + 1) % accentPalette.length];

          const badgeStyle: CSSProperties = {
            borderColor: `color-mix(in oklab, ${timeframeTone} 55%, transparent)`,
            color: timeframeTone,
            backgroundColor: `color-mix(in oklab, ${timeframeTone} 16%, transparent)`,
          };

          return (
            <motion.div key={project.name} variants={item} whileHover={{ y: -6 }} transition={{ duration: 0.45, ease: smoothEase }}>
              <Card
                className="border-border/50 bg-muted/30 transition duration-500 hover:bg-muted/40"
                style={{ "--card-accent": cardTone } as CSSProperties}
              >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="tracking-[0.24em] text-foreground/80">{project.name}</CardTitle>
                <Badge className="bg-transparent" style={badgeStyle}>
                  {project.timeframe}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>{project.outcome}</p>
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
                  {project.stack.slice(0, 4).map((tech, stackIndex) => {
                    const tone = accentPalette[(index + stackIndex) % accentPalette.length];
                    const chipStyle: CSSProperties = {
                      borderColor: `color-mix(in oklab, ${tone} 50%, transparent)`,
                      color: tone,
                      backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
                    };

                    return (
                      <span
                        key={tech}
                        className="rounded-full border px-3 py-1"
                        style={chipStyle}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] transition duration-(--transition-base) hover:opacity-90"
                  style={{
                    color: cardTone,
                    textShadow: `0 8px 24px ${cardTone}`,
                  }}
                  rel="noopener noreferrer"
                >
                  Project notes →
                </Link>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
