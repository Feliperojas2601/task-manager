import { describe, it, expect, jest } from '@jest/globals';
import { GetProjectDetailUseCase } from '../../../src/application/use-cases/get-project-detail.use-case';
import { IProjectRepository } from '../../../src/application/repositories/project.repository';
import { ILogger } from '../../../src/application/logger/logger.interface';
import { ProjectDetail } from '../../../src/domain/entities/project.entity';
import { NotFoundError } from '../../../src/domain/errors/not-found.error';

const makeDetail = (overrides?: Partial<ProjectDetail>): ProjectDetail => ({
    id: 'proj-1',
    name: 'Test Project',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
    ...overrides,
});

const makeLogger = (): ILogger => ({ info: jest.fn(), error: jest.fn() });

const makeRepository = (detail: ProjectDetail | null): IProjectRepository => ({
    create: jest.fn<() => Promise<never>>(),
    findAll: jest.fn<() => Promise<never[]>>().mockResolvedValue([]),
    findById: jest.fn<() => Promise<ProjectDetail | null>>().mockResolvedValue(detail),
    delete: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

describe('GetProjectDetailUseCase', () => {
    it('returns the project detail when found', async () => {
        const detail = makeDetail();
        const useCase = new GetProjectDetailUseCase(makeRepository(detail), makeLogger());

        const result = await useCase.execute('proj-1');

        expect(result).toEqual(detail);
    });

    it('throws NotFoundError and logs error when project does not exist', async () => {
        const logger = makeLogger();
        const useCase = new GetProjectDetailUseCase(makeRepository(null), logger);

        await expect(useCase.execute('missing-id')).rejects.toThrow(NotFoundError);
        expect(logger.error).toHaveBeenCalledWith(
            'GetProjectDetailUseCase.execute - error',
            expect.objectContaining({ message: expect.stringContaining('missing-id') }),
        );
    });
});
