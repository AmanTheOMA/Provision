import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen, Globe, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import ProjectSearchBar from "@/components/ProjectSearchBar";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectCard from "@/components/CreateProjectCard";
import CreateProjectModal from "@/components/CreateProjectModal";
import { ProjectCardSkeleton } from "@/components/Skeleton";
import { createProject, deleteProject, fetchProjects, updateProject } from "@/services/projects";
import type { Project, ProjectVisibility } from "@/types/project";

function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function filterByName(projects: Project[], query: string) {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return projects;
  return projects.filter((p) => p.name.toLowerCase().includes(normalized));
}

function ProjectSection({
  title,
  projects,
  loading,
  emptyMessage,
  emptyIcon,
  onCreateClick,
  showCreateCard,
  onDelete,
  onEdit,
  currentUserId,
}: {
  title: string;
  projects: Project[];
  loading: boolean;
  emptyMessage: string;
  emptyIcon?: React.ReactNode;
  onCreateClick?: () => void;
  showCreateCard?: boolean;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (id: number, name: string, visibility: ProjectVisibility) => Promise<void>;
  currentUserId?: number;
}) {
  return (
    <section
      aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
      className="space-y-4"
    >
      <h2
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-lg font-semibold tracking-tight text-white/90"
      >
        {title}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 && !showCreateCard ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 px-6 py-14 text-center backdrop-blur-sm">
          <span className="mb-3 rounded-full border border-white/10 bg-white/5 p-3 text-white/40">
            {emptyIcon ?? <FolderOpen className="h-5 w-5" />}
          </span>
          <p className="text-sm text-white/50">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={
                onDelete && project.owner_id === currentUserId ? onDelete : undefined
              }
              onEdit={
                onEdit && project.owner_id === currentUserId ? onEdit : undefined
              }
            />
          ))}
          {showCreateCard && onCreateClick && (
            <CreateProjectCard onClick={onCreateClick} />
          )}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [privateProjects, setPrivateProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadProjects = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProjects();
      setPublicProjects(data.publicProjects);
      setPrivateProjects(data.privateProjects);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load projects."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredPublic = useMemo(
    () => filterByName(publicProjects, debouncedSearch),
    [publicProjects, debouncedSearch],
  );

  const filteredPrivate = useMemo(
    () => filterByName(privateProjects, debouncedSearch),
    [privateProjects, debouncedSearch],
  );

  const hasSearch = debouncedSearch.trim().length > 0;
  const noSearchResults =
    hasSearch && filteredPublic.length === 0 && filteredPrivate.length === 0;

  async function handleCreate(name: string, visibility: "public" | "private") {
    await createProject({ name, visibility });
    await loadProjects();
  }

  async function handleDelete(id: number) {
    await deleteProject(id);
    setPublicProjects((prev) => prev.filter((p) => p.id !== id));
    setPrivateProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleEdit(id: number, name: string, visibility: ProjectVisibility) {
    const updated = await updateProject(id, { name, visibility });
    const patch = (prev: Project[]) =>
      prev.map((p) => (p.id === id ? updated : p));
    setPublicProjects(patch);
    setPrivateProjects(patch);
    // If visibility changed, reload to re-bucket the project correctly
    if (updated.visibility !== visibility) await loadProjects();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black/50 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Provision</h1>
          <p className="text-sm text-white/50">Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-white/50 sm:inline" aria-label="Logged in as">
            {user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            aria-label="Log out"
            className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {/* Search — centered */}
        <div className="flex justify-center">
          <ProjectSearchBar value={search} onChange={setSearch} />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Empty search result */}
        {!loading && noSearchResults && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 px-6 py-14 text-center backdrop-blur-sm">
            <span className="mb-3 rounded-full border border-white/10 bg-white/5 p-3 text-white/40">
              <FolderOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-white/70">No results found</p>
            <p className="mt-1 text-xs text-white/40">
              No projects match &ldquo;{debouncedSearch}&rdquo;
            </p>
          </div>
        )}

        {!noSearchResults && (
          <>
            <ProjectSection
              title="Public Projects"
              projects={filteredPublic}
              loading={loading}
              emptyMessage="No public projects yet."
              emptyIcon={<Globe className="h-5 w-5" />}
              onDelete={handleDelete}
              onEdit={handleEdit}
              currentUserId={user?.id}
            />

            <ProjectSection
              title="My Private Projects"
              projects={filteredPrivate}
              loading={loading}
              emptyMessage="You have no private projects yet. Create one!"
              emptyIcon={<Lock className="h-5 w-5" />}
              showCreateCard
              onCreateClick={() => setModalOpen(true)}
              onDelete={handleDelete}
              onEdit={handleEdit}
              currentUserId={user?.id}
            />
          </>
        )}
      </main>

      <CreateProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
