import { describe, it, expect, jest } from '@jest/globals';
import { CreateTaskUseCase } from '../../../src/application/use-cases/create-task.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
import { ITaskRepository } from '../../../src/application/repositories/task.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { ProjectDetail } from '../../../src/domain/entities/project.entity';
import { Task } from '../../../src/domain/entities/task.entity';
import { NotFoundError } from '../../../src/domain/errors/not-found.error';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeDetail = (): ProjectDetail => ({
    id: VALID_UUID, name: 'Project', description: null, createdAt: new Date(), updatedAt: new Date(), tasks: [],
});

const makeTask = (): Task => ({
    id: 'task-1', title: 'My Task', description: null, status: 'PENDING', priority: 'MEDIUM',
    projectId: VALID_UUID, createdAt: new Date(), updatedAt: new Date(),
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeProjectRepository = (detail: ProjectDetail | null): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<ProjectDetail | null>>().mockResolvedValue(detail),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

const makeTaskRepository = (task: Task): ITaskRepository => ({
    create: jest.fn<() => Promise<Task>>().mockResolvedValue(task),
    findById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    update: jest.fn<() => Promise<Task>>().mockResolvedValue(task),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    findByProject: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
});

describe('CreateTaskUseCase', () => {
    it('creates and returns task when project exists', async () => {
        const task = makeTask();
        const taskRepo = makeTaskRepository(task);
        const useCase = new CreateTaskUseCase(makeProjectRepository(makeDetail()), taskRepo, makeLogger());

        const result = await useCase.execute({ projectId: VALID_UUID, title: 'My Task', status: 'PENDING', priority: 'MEDIUM' });

        expect(taskRepo.create).toHaveBeenCalledWith({
            title: 'My Task', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: VALID_UUID,
        });
        expect(result).toEqual(task);
    });

    it('passes description when provided', async () => {
        const taskRepo = makeTaskRepository(makeTask());
        const useCase = new CreateTaskUseCase(makeProjectRepository(makeDetail()), taskRepo, makeLogger());

        await useCase.execute({ projectId: VALID_UUID, title: 'My Task', description: 'A desc', status: 'PENDING', priority: 'MEDIUM' });

        expect(taskRepo.create).toHaveBeenCalledWith(expect.objectContaining({ description: 'A desc' }));
    });

    it('throws NotFoundError and logs error when project does not exist', async () => {
        const logger = makeLogger();
        const useCase = new CreateTaskUseCase(makeProjectRepository(null), makeTaskRepository(makeTask()), logger);

        await expect(useCase.execute({ projectId: VALID_UUID, title: 'Task', status: 'PENDING', priority: 'MEDIUM' }))
            .rejects.toThrow(NotFoundError);
        expect(logger.error).toHaveBeenCalledWith(
            'CreateTaskUseCase.execute - error',
            expect.objectContaining({ message: expect.any(String) }),
        );
    });
});
