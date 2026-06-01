import { ProjectSummary } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { ILogger } from '../logger/logger.interface';

export class ListProjectsUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(): Promise<ProjectSummary[]> {
        this.logger.info('ListProjectsUseCase.execute - start');
        try {
            const result = await this.projectRepository.findAll();
            this.logger.info('ListProjectsUseCase.execute - end');
            return result;
        } catch (error) {
            this.logger.error('ListProjectsUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
