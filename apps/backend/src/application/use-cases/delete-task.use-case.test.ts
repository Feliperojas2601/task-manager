import { describe, it, expect, jest } from '@jest/globals';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { ITaskRepository } from '../repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const makeTask = (): Task => ({
    id: 'task-1',
    title: 'My Task',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: 'proj-1',
    createdAt: new Date(),
    updatedAt: new Date(),
});

const makeRepository = (task: Task | null): ITaskRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findById: jest.fn<() => Promise<Task | null>>().mockResolvedValue(task),
    update: jest.fn<() => Promise<Task>>().mockResolvedValue(makeTask()),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    findByProject: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
});

describe('DeleteTaskUseCase', () => {
    it('calls findById then delete when task exists', async () => {
        const repository = makeRepository(makeTask());
        const useCase = new DeleteTaskUseCase(repository);

        await useCase.execute('task-1');

        expect(repository.findById).toHaveBeenCalledWith('task-1');
        expect(repository.delete).toHaveBeenCalledWith('task-1');
    });

    it('throws NotFoundError when task does not exist', async () => {
        const repository = makeRepository(null);
        const useCase = new DeleteTaskUseCase(repository);

        await expect(useCase.execute('missing')).rejects.toThrow(NotFoundError);
        expect(repository.delete).not.toHaveBeenCalled();
    });
});
