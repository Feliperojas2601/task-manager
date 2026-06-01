import { TaskStatus, Priority } from './enums';

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskFilter {
    status?: TaskStatus;
    priority?: Priority;
    sortBy?: 'createdAt' | 'priority';
    order?: 'asc' | 'desc';
}
