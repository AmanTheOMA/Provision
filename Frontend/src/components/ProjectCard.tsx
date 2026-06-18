import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import TiltedCard from "@/components/ui/tilted-card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditProjectModal from "@/components/EditProjectModal";
import type { Project, ProjectVisibility } from "@/types/project";

function gradientSrc(visibility: "public" | "private"): string {
  const stops =
    visibility === "public"
      ? ["#0f2a4a", "#0e4172", "#1a6bb5"]
      : ["#3b0a2a", "#6b1044", "#9d2060"];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="200"><defs><radialGradient id="g" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${stops[2]}"/><stop offset="50%" stop-color="${stops[1]}"/><stop offset="100%" stop-color="${stops[0]}"/></radialGradient></defs><rect width="260" height="200" fill="url(#g)" rx="15"/></svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (id: number, name: string, visibility: ProjectVisibility) => Promise<void>;
}

export default function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(project.id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  async function handleSaveEdit(name: string, visibility: ProjectVisibility) {
    if (!onEdit) return;
    await onEdit(project.id, name, visibility);
  }

  const overlay = (
    <div
      className="flex w-[260px] flex-col justify-end gap-2 rounded-[15px] p-4 pt-24"
      style={{ height: "200px" }}
    >
      <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white drop-shadow-lg">
        {project.name}
      </h3>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            project.visibility === "public"
              ? "bg-sky-500/30 text-sky-200"
              : "bg-rose-500/30 text-rose-200"
          }`}
        >
          {project.visibility}
        </span>
        <span className="text-xs text-white/60">{formatDate(project.created_at)}</span>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="group relative w-full max-w-[260px] focus-within:outline-none"
        role="group"
        aria-label={`Project: ${project.name}`}
      >
        {/* Clickable card area */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Open project: ${project.name} (${project.visibility})`}
          className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 rounded-[15px]"
          onClick={() => navigate(`/projects/${project.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate(`/projects/${project.id}`);
            }
          }}
        >
          <TiltedCard
            imageSrc={gradientSrc(project.visibility)}
            altText={project.name}
            captionText={project.name}
            containerHeight="200px"
            containerWidth="260px"
            imageHeight="200px"
            imageWidth="260px"
            scaleOnHover={1.05}
            rotateAmplitude={12}
            showTooltip={false}
            displayOverlayContent
            overlayContent={overlay}
          />
        </div>

        {/* Owner action buttons — appear on hover */}
        {(onEdit || onDelete) && (
          <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {onEdit && (
              <button
                type="button"
                aria-label={`Edit project ${project.name}`}
                onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                aria-label={`Delete project ${project.name}`}
                onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-red-400/70 backdrop-blur-sm transition-colors hover:bg-red-950/60 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete project?"
        description={`"${project.name}" and all its columns and tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />

      {onEdit && (
        <EditProjectModal
          open={editOpen}
          onOpenChange={setEditOpen}
          project={project}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
