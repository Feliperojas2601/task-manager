import { describe, it, expect, jest } from '@jest/globals';
import { ListTasksUseCase } from '../../../src/application/use-cases/list-tasks.use-case';
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
    id: 'task-1', title: 'Task', description: null, status: 'PENDING', priority: 'MEDIUM',
    projectId: VALID_UUID, createdAt: new Date(), updatedAt: new Date(),
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeProjectRepository = (detail: ProjectDetail | null): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<ProjectDetail | null>>().mockResolvedValue(detail),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

const makeTaskRepository = (tasks: Task[]): ITaskRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    update: jest.fn<() => Promise<Task>>().mockResolvedValue(makeTask()),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    findByProject: jest.fn<() => Promise<Task[]>>().mockResolvedValue(tasks),
});

describe('ListTasksUseCase', () => {
    it('returns tasks for a project with no filters', async () => {
        const tasks = [makeTask()];
        const taskRepo = makeTaskRepository(tasks);
        const useCase = new ListTasksUseCase(makeProjectRepository(makeDetail()), taskRepo, makeLogger());

        const result = await useCase.execute({ projectId: VALID_UUID, filters: {} });

        expect(taskRepo.findByProject).toHaveBeenCalledWith(VALID_UUID, {});
        expect(result).toEqual(tasks);
    });

    it('passes filters to the repository', async () => {
        const taskRepo = makeTaskRepository([]);
        const useCase = new ListTasksUseCase(makeProjectRepository(makeDetail()), taskRepo, makeLogger());

        await useCase.execute({ projectId: VALID_UUID, filters: { status: 'DONE', priority: 'HIGH' } });

        expect(taskRepo.findByProject).toHaveBeenCalledWith(VALID_UUID, { status: 'DONE', priority: 'HIGH' });
    });

    it('returns empty array when no tasks match filters', async () => {
        const useCase = new ListTasksUseCase(makeProjectRepository(makeDetail()), makeTaskRepository([]), makeLogger());
        expect(await useCase.execute({ projectId: VALID_UUID, filters: {} })).toEqual([]);
    });

    it('throws NotFoundError and logs error when project does not exist', async () => {
        const logger = makeLogger();
        const useCase = new ListTasksUseCase(makeProjectRepository(null), makeTaskRepository([]), logger);

        await expect(useCase.execute({ projectId: VALID_UUID, filters: {} })).rejects.toThrow(NotFoundError);
        expect(logger.error).toHaveBeenCalledWith(
            'ListTasksUseCase.execute - error',
            expect.objectContaining({ message: expect.any(String) }),
        );
    });
});
