"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: smoothEase } },
};

const accentPalette = [
  "var(--term-blue)",
  "var(--term-magenta)",
  "var(--term-green)",
  "var(--term-yellow)",
  "var(--term-red)",
];

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <motion.div className="grid gap-8 md:grid-cols-2" initial="hidden" animate="visible" variants={container}>
      {projects.map((project, index) => {
        const tone = accentPalette[index % accentPalette.length];
        const secondaryTone = accentPalette[(index + 2) % accentPalette.length];

        const roleStyle: CSSProperties = {
          borderColor: `color-mix(in oklab, ${tone} 55%, transparent)`,
          color: "white",
          backgroundColor: "color-mix(in oklab, white 14%, transparent)",
        };
        const timeframeStyle: CSSProperties = {
          borderColor: `color-mix(in oklab, ${tone} 55%, transparent)`,
          color: "white",
          backgroundColor: `color-mix(in oklab, white 12%, transparent)`,
        };

        return (
          <motion.div
            key={project.name}
            id={project.name.toLowerCase().replace(/\s+/g, "-")}
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.45, ease: smoothEase }}
          >
            <Card className="h-full border-border/60 bg-muted/30 p-0" style={{ "--card-accent": tone } as CSSProperties}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-0">
                <div className="space-y-7">
                  <Badge className="bg-transparent" style={roleStyle}>
                    {project.role}
                  </Badge>
                  <CardTitle className="text-lg tracking-[0.18em] text-foregroun/90">
                  {project.name}
                </CardTitle>
              </div>
                <Badge className="bg-transparent" style={timeframeStyle}>
                  {project.timeframe}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-5 border-t border-border/50 p-6 text-sm leading-7 text-muted-foreground">
              <p className="text-foreground/80">{project.outcome}</p>
              <p>{project.problem}</p>
              <ul className="space-y-2 text-muted-foreground/90">
                {project.impact.map((impact) => (
                  <li key={impact} className="flex gap-2 text-xs uppercase tracking-[0.26em]">
                    <span className="text-foreground/50" style={{ color: tone }}>
                      •
                    </span>
                    <span className="text-left text-muted-foreground/70">{impact}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
                {project.stack.map((tech, stackIndex) => {
                  // const chipTone = accentPalette[(index + stackIndex) % accentPalette.length];
                  const chipStyle: CSSProperties = {
                    borderColor: `color-mix(in oklab, ${tone} 45%, transparent)`,
                    color: tone,
                    backgroundColor: `color-mix(in oklab, ${tone} 12%, transparent)`,
                  };

                  return (
                    <span key={tech} className="rounded-full border px-3 py-1" style={chipStyle}>
                      {tech}
                    </span>
                  );
                })}
              </div>
              <Link
                href={project.href}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] transition duration-(--transition-base) hover:opacity-90"
                style={{
                  color: tone,
                  textShadow: `0 10px 28px ${tone}`,
                }}
                rel="noopener noreferrer"
              >
                Open project →
              </Link>
            </CardContent>
          </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
