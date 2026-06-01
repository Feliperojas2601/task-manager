import { describe, it, expect, jest } from '@jest/globals';
import { ListTasksUseCase } from './list-tasks.use-case';
import { IProjectRepository } from '../repositories/project.repository';
import { ITaskRepository } from '../repositories/task.repository';
import { ProjectDetail } from '../../domain/entities/project.entity';
import { Task } from '../../domain/entities/task.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeDetail = (): ProjectDetail => ({
    id: VALID_UUID,
    name: 'Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
});

const makeTask = (): Task => ({
    id: 'task-1',
    title: 'Task',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: VALID_UUID,
    createdAt: new Date(),
    updatedAt: new Date(),
});

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
        const projectRepo = makeProjectRepository(makeDetail());
        const taskRepo = makeTaskRepository(tasks);
        const useCase = new ListTasksUseCase(projectRepo, taskRepo);

        const result = await useCase.execute({ projectId: VALID_UUID, filters: {} });

        expect(projectRepo.findById).toHaveBeenCalledWith(VALID_UUID);
        expect(taskRepo.findByProject).toHaveBeenCalledWith(VALID_UUID, {});
        expect(result).toEqual(tasks);
    });

    it('passes filters to the repository', async () => {
        const projectRepo = makeProjectRepository(makeDetail());
        const taskRepo = makeTaskRepository([]);
        const useCase = new ListTasksUseCase(projectRepo, taskRepo);

        await useCase.execute({ projectId: VALID_UUID, filters: { status: 'DONE', priority: 'HIGH' } });

        expect(taskRepo.findByProject).toHaveBeenCalledWith(VALID_UUID, { status: 'DONE', priority: 'HIGH' });
    });

    it('returns empty array when no tasks match filters', async () => {
        const projectRepo = makeProjectRepository(makeDetail());
        const taskRepo = makeTaskRepository([]);
        const useCase = new ListTasksUseCase(projectRepo, taskRepo);

        const result = await useCase.execute({ projectId: VALID_UUID, filters: {} });

        expect(result).toEqual([]);
    });

    it('throws NotFoundError when project does not exist', async () => {
        const projectRepo = makeProjectRepository(null);
        const taskRepo = makeTaskRepository([]);
        const useCase = new ListTasksUseCase(projectRepo, taskRepo);

        await expect(useCase.execute({ projectId: VALID_UUID, filters: {} })).rejects.toThrow(NotFoundError);
        expect(taskRepo.findByProject).not.toHaveBeenCalled();
    });
});
