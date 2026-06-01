import { describe, it, expect, jest } from '@jest/globals';
import { CreateProjectUseCase } from '../../../src/application/use-cases/create-project.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { Project } from '../../../src/domain/entities/project.entity';

const makeProject = (overrides?: Partial<Project>): Project => ({
    id: 'abc-123',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeRepository = (project?: Project): IProjectRepository => ({
    create: jest.fn<() => Promise<Project>>().mockResolvedValue(project ?? makeProject()),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<null>>().mockResolvedValue(null),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

describe('CreateProjectUseCase', () => {
    it('calls repository with name and null description and returns project', async () => {
        const project = makeProject();
        const repository = makeRepository(project);
        const useCase = new CreateProjectUseCase(repository, makeLogger());

        const result = await useCase.execute({ name: 'Test Project' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test Project', description: null });
        expect(result).toEqual(project);
    });

    it('passes description when provided', async () => {
        const repository = makeRepository(makeProject({ description: 'A description' }));
        const useCase = new CreateProjectUseCase(repository, makeLogger());

        await useCase.execute({ name: 'Test', description: 'A description' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test', description: 'A description' });
    });

    it('stores null when description is not provided', async () => {
        const repository = makeRepository();
        const useCase = new CreateProjectUseCase(repository, makeLogger());

        await useCase.execute({ name: 'Test' });

        expect(repository.create).toHaveBeenCalledWith({ name: 'Test', description: null });
    });

    it('logs error and rethrows when repository throws', async () => {
        const logger = makeLogger();
        const repository = makeRepository();
        (repository.create as jest.Mock).mockRejectedValue(new Error('DB error') as never);
        const useCase = new CreateProjectUseCase(repository, logger);

        await expect(useCase.execute({ name: 'Test' })).rejects.toThrow('DB error');
        expect(logger.error).toHaveBeenCalledWith(
            'CreateProjectUseCase.execute - error',
            expect.objectContaining({ message: 'DB error' }),
        );
    });
});
