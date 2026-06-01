import { IProjectRepository } from '../repositories/project.repository';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class DeleteProjectUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(id: string): Promise<void> {
        this.logger.info('DeleteProjectUseCase.execute - start');
        try {
            const project = await this.projectRepository.findById(id);
            if (!project) {
                throw new NotFoundError(`Project with id ${id} not found`);
            }
            await this.projectRepository.delete(id);
            this.logger.info('DeleteProjectUseCase.execute - end');
        } catch (error) {
            this.logger.error('DeleteProjectUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
