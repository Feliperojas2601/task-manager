import { Task } from '../../domain/entities/task.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { ITaskRepository } from '../repositories/task.repository';
import { ListTasksInput } from '../validators/task.validator';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class ListTasksUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(input: ListTasksInput): Promise<Task[]> {
        this.logger.info('ListTasksUseCase.execute - start');
        try {
            const project = await this.projectRepository.findById(input.projectId);
            if (!project) {
                throw new NotFoundError(`Project with id ${input.projectId} not found`);
            }
            const result = await this.taskRepository.findByProject(input.projectId, input.filters);
            this.logger.info('ListTasksUseCase.execute - end');
            return result;
        } catch (error) {
            this.logger.error('ListTasksUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
