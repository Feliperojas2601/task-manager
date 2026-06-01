import { describe, it, expect, jest } from '@jest/globals';
import { CreateTaskUseCase } from './create-task.use-case';
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
    title: 'My Task',
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
        const projectRepo = makeProjectRepository(makeDetail());
        const taskRepo = makeTaskRepository(task);
        const useCase = new CreateTaskUseCase(projectRepo, taskRepo);

        const result = await useCase.execute({
            projectId: VALID_UUID,
            title: 'My Task',
            status: 'PENDING',
            priority: 'MEDIUM',
        });

        expect(projectRepo.findById).toHaveBeenCalledWith(VALID_UUID);
        expect(taskRepo.create).toHaveBeenCalledWith({
            title: 'My Task',
            description: null,
            status: 'PENDING',
            priority: 'MEDIUM',
            projectId: VALID_UUID,
        });
        expect(result).toEqual(task);
    });

    it('passes description when provided', async () => {
        const task = makeTask();
        const projectRepo = makeProjectRepository(makeDetail());
        const taskRepo = makeTaskRepository(task);
        const useCase = new CreateTaskUseCase(projectRepo, taskRepo);

        await useCase.execute({
            projectId: VALID_UUID,
            title: 'My Task',
            description: 'A desc',
            status: 'PENDING',
            priority: 'MEDIUM',
        });

        expect(taskRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({ description: 'A desc' }),
        );
    });

    it('throws NotFoundError when project does not exist', async () => {
        const projectRepo = makeProjectRepository(null);
        const taskRepo = makeTaskRepository(makeTask());
        const useCase = new CreateTaskUseCase(projectRepo, taskRepo);

        await expect(
            useCase.execute({ projectId: VALID_UUID, title: 'Task', status: 'PENDING', priority: 'MEDIUM' }),
        ).rejects.toThrow(NotFoundError);
        expect(taskRepo.create).not.toHaveBeenCalled();
    });
});
