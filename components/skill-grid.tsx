"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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

export function SkillGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {grid.map((item, index) => (
        <motion.div
          key={item.title}
          custom={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <Card>
            <CardHeader>
              <CardTitle className="tracking-[0.22em] text-foreground/90">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {item.highlights.map((highlight) => (
                <Badge key={highlight} className="bg-transparent text-foreground/80">
                  {highlight}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
