import { projects } from "@/lib/projects";
import { ProjectsGrid } from "@/components/projects-grid";

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 pt-28">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Projects</p>
        <h1 className="mt-4 text-4xl font-medium uppercase tracking-[0.2em] text-foreground sm:text-5xl">
          Project dossiers
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm uppercase tracking-[0.28em] text-muted-foreground">
        </p>
      </div>
      <ProjectsGrid projects={projects} />
    </div>
  );
}
