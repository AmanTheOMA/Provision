import { Plus } from "lucide-react";

interface CreateProjectCardProps {
  onClick: () => void;
}

export default function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create a new project"
      className="flex aspect-[4/5] h-[320px] w-full max-w-[260px] flex-col items-center justify-center rounded-[25px] border border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent/30 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background"
        aria-hidden="true"
      >
        <Plus className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium">Create project</p>
    </button>
  );
}
