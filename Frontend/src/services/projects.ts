import api from "@/services/api";
import type {
  CreateProjectPayload,
  Project,
  ProjectsResponse,
  ProjectStats,
} from "@/types/project";

export async function fetchProjects() {
  const res = await api.get<ProjectsResponse>("/projects");
  return res.data;
}

export async function fetchProject(id: number) {
  const res = await api.get<{ project: Project }>(`/projects/${id}`);
  return res.data.project;
}

export async function createProject(payload: CreateProjectPayload) {
  const res = await api.post<{ project: Project }>("/projects", payload);
  return res.data.project;
}

export async function updateProject(
  id: number,
  payload: CreateProjectPayload,
) {
  const res = await api.put<{ project: Project }>(`/projects/${id}`, payload);
  return res.data.project;
}

export async function deleteProject(id: number) {
  await api.delete(`/projects/${id}`);
}

export async function fetchStats() {
  const res = await api.get<ProjectStats>("/projects/stats");
  return res.data;
}
