import { ProjectDetail } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class GetProjectDetailUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(id: string): Promise<ProjectDetail> {
        this.logger.info('GetProjectDetailUseCase.execute - start');
        try {
            const project = await this.projectRepository.findById(id);
            if (!project) {
                throw new NotFoundError(`Project with id ${id} not found`);
            }
            this.logger.info('GetProjectDetailUseCase.execute - end');
            return project;
        } catch (error) {
            this.logger.error('GetProjectDetailUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
