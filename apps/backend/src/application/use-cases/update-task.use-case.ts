import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../repositories/task.repository';
import { UpdateTaskInput } from '../validators/task.validator';
import { NotFoundError } from '../../domain/errors/not-found.error';

export class UpdateTaskUseCase {
    constructor(private readonly taskRepository: ITaskRepository) {}

    async execute(id: string, data: UpdateTaskInput): Promise<Task> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }
        return this.taskRepository.update(id, data);
    }
}
