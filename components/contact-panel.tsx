"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ContactLink = {
  label: string;
  value: string;
  href: string;
};

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ContactPanel({ contacts }: { contacts: ContactLink[] }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } }}
        className="space-y-4"
      >
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-medium uppercase tracking-[0.2em] text-foreground sm:text-5xl">
          Reference desk
        </h1>
        <p className="mx-auto max-w-sm text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Prefer written correspondence focused on knowledge exchange and engineering research.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.55, ease: smoothEase } }}
      >
        <Card className="border-border/60 bg-muted/30 p-0">
          <CardHeader className="px-6 pt-6 text-left">
            <CardTitle>Reference channels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border/50 px-6 py-6 text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
            {contacts.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                <span>{item.label}</span>
                <Link
                  href={item.href}
                  className="text-foreground transition-colors duration-[var(--transition-base)] hover:text-muted-foreground"
                  rel="noopener noreferrer"
                >
                  {item.value}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
      <motion.p
        className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
      >
        Provided for informational purposes—please no commission requests.
      </motion.p>
    </div>
  );
}
