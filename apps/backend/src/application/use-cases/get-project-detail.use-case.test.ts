import { describe, it, expect, jest } from '@jest/globals';
import { GetProjectDetailUseCase } from './get-project-detail.use-case';
import { IProjectRepository } from '../repositories/project.repository';
import { ProjectDetail } from '../../domain/entities/project.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const makeDetail = (overrides?: Partial<ProjectDetail>): ProjectDetail => ({
    id: 'proj-1',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
    ...overrides,
});

const makeRepository = (detail: ProjectDetail | null): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<ProjectDetail | null>>().mockResolvedValue(detail),
});

describe('GetProjectDetailUseCase', () => {
    it('returns the project detail when found', async () => {
        const detail = makeDetail();
        const repository = makeRepository(detail);
        const useCase = new GetProjectDetailUseCase(repository);

        const result = await useCase.execute('proj-1');

        expect(repository.findById).toHaveBeenCalledWith('proj-1');
        expect(result).toEqual(detail);
    });

    it('throws NotFoundError when project does not exist', async () => {
        const repository = makeRepository(null);
        const useCase = new GetProjectDetailUseCase(repository);

        await expect(useCase.execute('missing-id')).rejects.toThrow(NotFoundError);
        await expect(useCase.execute('missing-id')).rejects.toThrow('Project with id missing-id not found');
    });
});
