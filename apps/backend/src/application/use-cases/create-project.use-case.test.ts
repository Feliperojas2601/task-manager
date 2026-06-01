import { describe, it, expect, jest } from '@jest/globals';
import { CreateProjectUseCase } from './create-project.use-case';
import { IProjectRepository } from '../repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';

const makeProject = (overrides?: Partial<Project>): Project => ({
    id: 'abc-123',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const makeRepository = (project?: Project): IProjectRepository => ({
    create: jest.fn<() => Promise<Project>>().mockResolvedValue(project ?? makeProject()),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
});

describe('CreateProjectUseCase', () => {
    it('calls repository with name and null description and returns project', async () => {
        const project = makeProject();
        const repository = makeRepository(project);
        const useCase = new CreateProjectUseCase(repository);

        const result = await useCase.execute({ name: 'Test Project' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test Project', description: null });
        expect(result).toEqual(project);
    });

    it('passes description when provided', async () => {
        const project = makeProject({ description: 'A description' });
        const repository = makeRepository(project);
        const useCase = new CreateProjectUseCase(repository);

        await useCase.execute({ name: 'Test', description: 'A description' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test', description: 'A description' });
    });

    it('stores null when description is not provided', async () => {
        const repository = makeRepository();
        const useCase = new CreateProjectUseCase(repository);

        await useCase.execute({ name: 'Test' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test', description: null });
    });
});
