import { describe, it, expect, jest } from '@jest/globals';
import { ListProjectsUseCase } from '../../../src/application/use-cases/list-projects.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
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
        const useCase = new ListProjectsUseCase(repository);

        const result = await useCase.execute();

        expect(repository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(projects);
    });

    it('returns empty array when no projects exist', async () => {
        const repository = makeRepository([]);
        const useCase = new ListProjectsUseCase(repository);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
