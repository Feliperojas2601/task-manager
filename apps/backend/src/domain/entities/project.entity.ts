export interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectSummary extends Project {
    taskCount: number;
}
