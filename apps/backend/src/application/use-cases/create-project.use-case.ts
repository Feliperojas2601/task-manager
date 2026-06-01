import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { CreateProjectInput } from '../validators/project.validator';
import { ILogger } from '../logger/logger.interface';

export class CreateProjectUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(input: CreateProjectInput): Promise<Project> {
        this.logger.info('CreateProjectUseCase.execute - start');
        try {
            const result = await this.projectRepository.create({
                name: input.name,
                description: input.description ?? null,
            });
            this.logger.info('CreateProjectUseCase.execute - end');
            return result;
        } catch (error) {
            this.logger.error('CreateProjectUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
