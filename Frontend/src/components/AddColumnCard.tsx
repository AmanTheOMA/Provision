import { Plus } from "lucide-react";

interface AddColumnCardProps {
  onClick: () => void;
}

export default function AddColumnCard({ onClick }: AddColumnCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add a new column"
      className="flex h-full min-h-[280px] w-72 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent/20 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
    >
      <Plus className="mb-2 h-6 w-6" aria-hidden="true" />
      <span className="text-sm font-medium">Add Column</span>
    </button>
  );
}
