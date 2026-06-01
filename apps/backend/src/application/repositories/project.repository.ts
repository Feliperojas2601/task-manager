import { Project, ProjectSummary, ProjectDetail } from '../../domain/entities/project.entity';

export interface IProjectRepository {
    create(data: { name: string; description: string | null }): Promise<Project>;
    findAll(): Promise<ProjectSummary[]>;
    findById(id: string): Promise<ProjectDetail | null>;
}
