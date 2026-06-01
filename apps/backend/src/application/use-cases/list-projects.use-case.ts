import { ProjectSummary } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';

export class ListProjectsUseCase {
    constructor(private readonly projectRepository: IProjectRepository) {}

    async execute(): Promise<ProjectSummary[]> {
        return this.projectRepository.findAll();
    }
}
