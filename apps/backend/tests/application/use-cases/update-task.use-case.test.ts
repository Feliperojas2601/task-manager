import { describe, it, expect, jest } from '@jest/globals';
import { UpdateTaskUseCase } from '../../../src/application/use-cases/update-task.use-case';
import { ITaskRepository } from '../../../src/application/repositories/task.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { Task } from '../../../src/domain/entities/task.entity';
import { NotFoundError } from '../../../src/domain/errors/not-found.error';

const makeTask = (overrides?: Partial<Task>): Task => ({
    id: 'task-1', title: 'My Task', description: null, status: 'PENDING', priority: 'MEDIUM',
    projectId: 'proj-1', createdAt: new Date(), updatedAt: new Date(), ...overrides,
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeRepository = (existing: Task | null, updated?: Task): ITaskRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findById: jest.fn<() => Promise<Task | null>>().mockResolvedValue(existing),
    update: jest.fn<() => Promise<Task>>().mockResolvedValue(updated ?? existing ?? makeTask()),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    findByProject: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
});

describe('UpdateTaskUseCase', () => {
    it('calls findById then update and returns updated task', async () => {
        const updated = makeTask({ title: 'Updated', status: 'DONE' });
        const repository = makeRepository(makeTask(), updated);
        const useCase = new UpdateTaskUseCase(repository, makeLogger());

        const result = await useCase.execute('task-1', { title: 'Updated', status: 'DONE' });

        expect(repository.findById).toHaveBeenCalledWith('task-1');
        expect(repository.update).toHaveBeenCalledWith('task-1', { title: 'Updated', status: 'DONE' });
        expect(result).toEqual(updated);
    });

    it('throws NotFoundError and logs error when task does not exist', async () => {
        const logger = makeLogger();
        const useCase = new UpdateTaskUseCase(makeRepository(null), logger);

        await expect(useCase.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundError);
        expect(logger.error).toHaveBeenCalledWith(
            'UpdateTaskUseCase.execute - error',
            expect.objectContaining({ message: expect.stringContaining('missing') }),
        );
    });
});
