export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectSummary {
    id: string;
    name: string;
    description: string | null;
    taskCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectDetail {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    tasks: Task[];
}

export interface CreateProjectInput {
    name: string;
    description?: string;
}
