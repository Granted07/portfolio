"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const grid = [
  {
    title: "Frontend Development",
    highlights: ["Next.js", "TypeScript", "Tailwind v4"],
  },
  {
    title: "Languages",
    highlights: ["C++", "Rust", "Python", "C"],
  },
];

const snappyEase: [number, number, number, number] = [0.32, 1, 0.68, 1];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + index * 0.05, duration: 0.5, ease: snappyEase },
  }),
};

const accentPalette = [
  "var(--term-blue)",
  "var(--term-magenta)",
  "var(--term-green)",
  "var(--term-yellow)",
  "var(--term-red)",
];

export function SkillGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {grid.map((item, index) => {
        const tone = accentPalette[index % accentPalette.length];

        return (
          <motion.div
            key={item.title}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
          >
            <Card style={{ "--card-accent": tone } as CSSProperties}>
              <CardHeader>
                <CardTitle className="tracking-[0.22em] mb-6 text-foreground/90">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {item.highlights.map((highlight, highlightIndex) => {
                  const badgeTone = accentPalette[(index + highlightIndex) % accentPalette.length];
                  const badgeStyle: CSSProperties = {
                    borderColor: `color-mix(in oklab, ${badgeTone} 55%, transparent)`,
                    color: badgeTone,
                    backgroundColor: `color-mix(in oklab, ${badgeTone} 18%, transparent)`,
                  };

                  return (
                    <Badge key={highlight} className="backdrop-blur" style={badgeStyle}>
                      {highlight}
                    </Badge>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </section>
  );
}
