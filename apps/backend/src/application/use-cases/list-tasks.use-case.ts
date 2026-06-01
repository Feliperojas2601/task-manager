import { Task } from '../../domain/entities/task.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { ITaskRepository } from '../repositories/task.repository';
import { ListTasksInput } from '../validators/task.validator';
import { NotFoundError } from '../../domain/errors/not-found.error';

export class ListTasksUseCase {
    constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly taskRepository: ITaskRepository,
    ) {}

    async execute(input: ListTasksInput): Promise<Task[]> {
        const project = await this.projectRepository.findById(input.projectId);
        if (!project) {
            throw new NotFoundError(`Project with id ${input.projectId} not found`);
        }
        return this.taskRepository.findByProject(input.projectId, input.filters);
    }
}
