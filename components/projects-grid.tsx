"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  return (
    <motion.div className="grid gap-8 md:grid-cols-2" initial="hidden" animate="visible" variants={container}>
      {projects.map((project) => (
        <motion.div key={project.name} id={project.name.toLowerCase().replace(/\s+/g, "-")} variants={item}>
          <Card className="h-full border-border/60 bg-muted/30 p-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-6">
              <div className="space-y-2">
                <Badge className="bg-transparent text-muted-foreground/80">{project.role}</Badge>
                <CardTitle className="text-lg tracking-[0.18em] text-foreground/90">
                  {project.name}
                </CardTitle>
              </div>
              <Badge className="bg-transparent text-muted-foreground">{project.timeframe}</Badge>
            </CardHeader>
            <CardContent className="space-y-5 border-t border-border/50 p-6 text-sm leading-7 text-muted-foreground">
              <p className="text-foreground/80">{project.outcome}</p>
              <p>{project.problem}</p>
              <ul className="space-y-2 text-muted-foreground/90">
                {project.impact.map((impact) => (
                  <li key={impact} className="flex gap-2 text-xs uppercase tracking-[0.26em]">
                    <span className="text-foreground/50">•</span>
                    <span className="text-left text-muted-foreground/70">{impact}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
                {project.stack.map((tech) => (
                  <span key={tech} className="rounded-full border border-border/70 px-3 py-1">
                    {tech}
                  </span>
                ))}
              </div>
              <Link
                href={project.href}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-[var(--transition-base)] hover:text-foreground"
                rel="noopener noreferrer"
              >
                Open project →
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
