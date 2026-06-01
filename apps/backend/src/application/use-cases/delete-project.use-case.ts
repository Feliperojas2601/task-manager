import { IProjectRepository } from '../repositories/project.repository';
import { NotFoundError } from '../../domain/errors/not-found.error';

export class DeleteProjectUseCase {
    constructor(private readonly projectRepository: IProjectRepository) {}

    async execute(id: string): Promise<void> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new NotFoundError(`Project with id ${id} not found`);
        }
        await this.projectRepository.delete(id);
    }
}
