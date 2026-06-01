import { Project } from '../../domain/entities/project.entity';

export interface IProjectRepository {
    create(data: { name: string; description: string | null }): Promise<Project>;
}
