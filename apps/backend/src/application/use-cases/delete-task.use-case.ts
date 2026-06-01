import { ITaskRepository } from '../repositories/task.repository';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ILogger } from '../logger/logger.interface';

export class DeleteTaskUseCase {
    constructor(
        private readonly taskRepository: ITaskRepository,
        private readonly logger: ILogger,
    ) {}

    async execute(id: string): Promise<void> {
        this.logger.info('DeleteTaskUseCase.execute - start');
        try {
            const task = await this.taskRepository.findById(id);
            if (!task) {
                throw new NotFoundError(`Task with id ${id} not found`);
            }
            await this.taskRepository.delete(id);
            this.logger.info('DeleteTaskUseCase.execute - end');
        } catch (error) {
            this.logger.error('DeleteTaskUseCase.execute - error', { message: (error as Error).message });
            throw error;
        }
    }
}
