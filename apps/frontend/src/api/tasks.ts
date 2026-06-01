import { api } from './client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from '../types';

function buildQuery(filters: TaskFilter): string {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.order) params.set('order', filters.order);
    const q = params.toString();
    return q ? `?${q}` : '';
}

export const tasksApi = {
    list: (projectId: string, filters: TaskFilter = {}) =>
        api.get<Task[]>(`/projects/${projectId}/tasks${buildQuery(filters)}`),
    create: (projectId: string, input: CreateTaskInput) =>
        api.post<Task>(`/projects/${projectId}/tasks`, input),
    update: (id: string, data: UpdateTaskInput) =>
        api.patch<Task>(`/tasks/${id}`, data),
    delete: (id: string) =>
        api.delete(`/tasks/${id}`),
};
