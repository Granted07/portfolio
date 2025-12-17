import { Hero } from "@/components/hero";
import { SkillGrid } from "@/components/skill-grid";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 pb-24">
      <Hero />
      <section className="grid gap-8 md:grid-cols-[1fr,1.2fr] md:items-start">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Focus</p>
          <p className="text-base leading-7 text-muted-foreground/85">
            Calm systems, legible pace layers, and motion that clarifies rather than decorates.
          </p>
        </div>
        <SkillGrid />
      </section>
    </div>
  );
}
