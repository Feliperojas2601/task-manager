import { Task } from '../../domain/entities/task.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { ITaskRepository } from '../repositories/task.repository';
import { CreateTaskInput } from '../validators/task.validator';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class CreateTaskUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(input: CreateTaskInput): Promise<Task> {
        this.logger.info('CreateTaskUseCase.execute - start');
        try {
            const project = await this.projectRepository.findById(input.projectId);
            if (!project) {
                throw new NotFoundError(`Project with id ${input.projectId} not found`);
            }
            const result = await this.taskRepository.create({
                title: input.title,
                description: input.description ?? null,
                status: input.status,
                priority: input.priority,
                projectId: input.projectId,
            });
            this.logger.info('CreateTaskUseCase.execute - end');
            return result;
        } catch (error) {
            this.logger.error('CreateTaskUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
