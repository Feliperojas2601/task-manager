import { describe, it, expect, jest } from '@jest/globals';
import { ListProjectsUseCase } from '../../../src/application/use-cases/list-projects.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { ProjectSummary } from '../../../src/domain/entities/project.entity';

const makeSummary = (overrides?: Partial<ProjectSummary>): ProjectSummary => ({
    id: 'abc-123',
    name: 'Test Project',
    description: null,
    taskCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeRepository = (projects: ProjectSummary[] = []): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<ProjectSummary[]>>().mockResolvedValue(projects),
    findById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

describe('ListProjectsUseCase', () => {
    it('returns all projects from repository', async () => {
        const projects = [makeSummary({ id: '1' }), makeSummary({ id: '2', taskCount: 3 })];
        const repository = makeRepository(projects);
        const useCase = new ListProjectsUseCase(repository, makeLogger());

        const result = await useCase.execute();

        expect(repository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(projects);
    });

    it('returns empty array when no projects exist', async () => {
        const useCase = new ListProjectsUseCase(makeRepository([]), makeLogger());
        expect(await useCase.execute()).toEqual([]);
    });

    it('logs error and rethrows when repository throws', async () => {
        const logger = makeLogger();
        const repository = makeRepository();
        (repository.findAll as jest.Mock).mockRejectedValue(new Error('DB error') as never);
        const useCase = new ListProjectsUseCase(repository, logger);

        await expect(useCase.execute()).rejects.toThrow('DB error');
        expect(logger.error).toHaveBeenCalledWith(
            'ListProjectsUseCase.execute - error',
            expect.objectContaining({ message: 'DB error' }),
        );
    });
});
