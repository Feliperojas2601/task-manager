import { describe, it, expect, jest } from '@jest/globals';
import { DeleteTaskUseCase } from '../../../src/application/use-cases/delete-task.use-case';
import { ITaskRepository } from '../../../src/application/repositories/task.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { Task } from '../../../src/domain/entities/task.entity';
import { NotFoundError } from '../../../src/domain/errors/not-found.error';

const makeTask = (): Task => ({
    id: 'task-1', title: 'My Task', description: null, status: 'PENDING', priority: 'MEDIUM',
    projectId: 'proj-1', createdAt: new Date(), updatedAt: new Date(),
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

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
        const useCase = new DeleteTaskUseCase(repository, makeLogger());

        await useCase.execute('task-1');

        expect(repository.findById).toHaveBeenCalledWith('task-1');
        expect(repository.delete).toHaveBeenCalledWith('task-1');
    });

    it('throws NotFoundError and logs error when task does not exist', async () => {
        const logger = makeLogger();
        const useCase = new DeleteTaskUseCase(makeRepository(null), logger);

        await expect(useCase.execute('missing')).rejects.toThrow(NotFoundError);
        expect(logger.error).toHaveBeenCalledWith(
            'DeleteTaskUseCase.execute - error',
            expect.objectContaining({ message: expect.stringContaining('missing') }),
        );
    });
});
