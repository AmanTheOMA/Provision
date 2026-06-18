export type ProjectVisibility = "public" | "private";

export type Project = {
  id: number;
  name: string;
  visibility: ProjectVisibility;
  owner_id: number;
  created_at: string;
};

export type ProjectsResponse = {
  publicProjects: Project[];
  privateProjects: Project[];
};

export type CreateProjectPayload = {
  name: string;
  visibility: ProjectVisibility;
};

export type ProjectStats = {
  totalPublicProjects: number;
  myPrivateProjects: number;
  totalTasks: number;
};
