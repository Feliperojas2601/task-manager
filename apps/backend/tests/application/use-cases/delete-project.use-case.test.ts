import { describe, it, expect, jest } from '@jest/globals';
import { DeleteProjectUseCase } from '../../../src/application/use-cases/delete-project.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
import { ProjectDetail } from '../../../src/domain/entities/project.entity';
import { NotFoundError } from '../../../src/domain/errors/not-found.error';

const makeDetail = (): ProjectDetail => ({
    id: 'proj-1',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
});

const makeRepository = (detail: ProjectDetail | null): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<ProjectDetail | null>>().mockResolvedValue(detail),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

describe('DeleteProjectUseCase', () => {
    it('calls findById then delete when project exists', async () => {
        const detail = makeDetail();
        const repository = makeRepository(detail);
        const useCase = new DeleteProjectUseCase(repository);

        await useCase.execute('proj-1');

        expect(repository.findById).toHaveBeenCalledWith('proj-1');
        expect(repository.delete).toHaveBeenCalledWith('proj-1');
    });

    it('throws NotFoundError when project does not exist', async () => {
        const repository = makeRepository(null);
        const useCase = new DeleteProjectUseCase(repository);

        await expect(useCase.execute('missing')).rejects.toThrow(NotFoundError);
        expect(repository.delete).not.toHaveBeenCalled();
    });
});
