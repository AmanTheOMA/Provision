import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProjectSearchBar({
  value,
  onChange,
}: ProjectSearchBarProps) {
  return (
    <div className="w-full max-w-xl" role="search">
      <label
        htmlFor="project-search"
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        Search projects
      </label>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="project-search"
          type="search"
          placeholder="Search by project name…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9"
          aria-label="Search projects by name"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
