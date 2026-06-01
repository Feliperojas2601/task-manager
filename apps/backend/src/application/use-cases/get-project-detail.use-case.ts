import { ProjectDetail } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { NotFoundError } from '../../domain/errors/not-found.error';

export class GetProjectDetailUseCase {
    constructor(private readonly projectRepository: IProjectRepository) {}

    async execute(id: string): Promise<ProjectDetail> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new NotFoundError(`Project with id ${id} not found`);
        }
        return project;
    }
}
