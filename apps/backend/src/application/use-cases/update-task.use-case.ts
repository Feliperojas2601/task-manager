import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../repositories/task.repository';
import { UpdateTaskInput } from '../validators/task.validator';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class UpdateTaskUseCase {
    constructor(
        private readonly taskRepository: ITaskRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(id: string, data: UpdateTaskInput): Promise<Task> {
        this.logger.info('UpdateTaskUseCase.execute - start');
        try {
            const task = await this.taskRepository.findById(id);
            if (!task) {
                throw new NotFoundError(`Task with id ${id} not found`);
            }
            const result = await this.taskRepository.update(id, data);
            this.logger.info('UpdateTaskUseCase.execute - end');
            return result;
        } catch (error) {
            this.logger.error('UpdateTaskUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
