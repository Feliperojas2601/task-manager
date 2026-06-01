import { describe, it, expect, jest } from '@jest/globals';
import { UpdateTaskUseCase } from './update-task.use-case';
import { ITaskRepository } from '../repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const makeTask = (overrides?: Partial<Task>): Task => ({
    id: 'task-1',
    title: 'My Task',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: 'proj-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const makeRepository = (existing: Task | null, updated?: Task): ITaskRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findById: jest.fn<() => Promise<Task | null>>().mockResolvedValue(existing),
    update: jest.fn<() => Promise<Task>>().mockResolvedValue(updated ?? existing ?? makeTask()),
});

describe('UpdateTaskUseCase', () => {
    it('calls findById then update and returns updated task', async () => {
        const updated = makeTask({ title: 'Updated', status: 'DONE' });
        const repository = makeRepository(makeTask(), updated);
        const useCase = new UpdateTaskUseCase(repository);

        const result = await useCase.execute('task-1', { title: 'Updated', status: 'DONE' });

        expect(repository.findById).toHaveBeenCalledWith('task-1');
        expect(repository.update).toHaveBeenCalledWith('task-1', { title: 'Updated', status: 'DONE' });
        expect(result).toEqual(updated);
    });

    it('throws NotFoundError when task does not exist', async () => {
        const repository = makeRepository(null);
        const useCase = new UpdateTaskUseCase(repository);

        await expect(useCase.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundError);
        expect(repository.update).not.toHaveBeenCalled();
    });
});
