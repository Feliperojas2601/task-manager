import { api } from './client';
import type { ProjectSummary, ProjectDetail, CreateProjectInput } from '../types';

export const projectsApi = {
    list: () => api.get<ProjectSummary[]>('/projects'),
    getById: (id: string) => api.get<ProjectDetail>(`/projects/${id}`),
    create: (input: CreateProjectInput) => api.post<ProjectSummary>('/projects', input),
    delete: (id: string) => api.delete(`/projects/${id}`),
};
