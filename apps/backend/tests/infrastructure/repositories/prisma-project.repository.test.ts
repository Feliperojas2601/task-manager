import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../../src/infrastructure/logging/pino-logger', () => ({
    createLogger: jest.fn().mockReturnValue({ info: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../src/infrastructure/database/prisma', () => ({
    prisma: { project: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() } },
}));

import { PrismaProjectRepository } from '../../../src/infrastructure/repositories/prisma-project.repository';
import { prisma } from '../../../src/infrastructure/database/prisma';

const mockCreate = prisma.project.create as jest.MockedFunction<typeof prisma.project.create>;
const mockFindMany = prisma.project.findMany as jest.MockedFunction<typeof prisma.project.findMany>;
const mockFindUnique = prisma.project.findUnique as jest.MockedFunction<typeof prisma.project.findUnique>;
const mockDelete = prisma.project.delete as jest.MockedFunction<typeof prisma.project.delete>;

describe('PrismaProjectRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
        mockFindMany.mockReset();
        mockFindUnique.mockReset();
        mockDelete.mockReset();
    });

    it('create calls prisma.project.create and returns the result', async () => {
        const now = new Date();
        const expected = { id: 'abc', name: 'Test', description: null, createdAt: now, updatedAt: now };
        mockCreate.mockResolvedValue(expected as never);
        const result = await new PrismaProjectRepository().create({ name: 'Test', description: null });
        expect(mockCreate).toHaveBeenCalledWith({ data: { name: 'Test', description: null } });
        expect(result).toEqual(expected);
    });

    it('create throws and rethrows when prisma fails', async () => {
        mockCreate.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaProjectRepository().create({ name: 'T', description: null })).rejects.toThrow('DB error');
    });

    it('findAll returns mapped summaries ordered by createdAt desc', async () => {
        const now = new Date();
        const raw = [
            { id: '1', name: 'A', description: null, createdAt: now, updatedAt: now, _count: { tasks: 2 } },
            { id: '2', name: 'B', description: 'desc', createdAt: now, updatedAt: now, _count: { tasks: 0 } },
        ];
        mockFindMany.mockResolvedValue(raw as never);
        const result = await new PrismaProjectRepository().findAll();
        expect(result).toEqual([
            { id: '1', name: 'A', description: null, taskCount: 2, createdAt: now, updatedAt: now },
            { id: '2', name: 'B', description: 'desc', taskCount: 0, createdAt: now, updatedAt: now },
        ]);
    });

    it('findAll returns empty array when no projects exist', async () => {
        mockFindMany.mockResolvedValue([] as never);
        expect(await new PrismaProjectRepository().findAll()).toEqual([]);
    });

    it('findAll throws and rethrows when prisma fails', async () => {
        mockFindMany.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaProjectRepository().findAll()).rejects.toThrow('DB error');
    });

    it('findById returns mapped ProjectDetail with tasks when found', async () => {
        const now = new Date();
        const raw = {
            id: 'proj-1', name: 'My Project', description: null, createdAt: now, updatedAt: now,
            tasks: [{ id: 'task-1', title: 'Task A', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: 'proj-1', createdAt: now, updatedAt: now }],
        };
        mockFindUnique.mockResolvedValue(raw as never);
        const result = await new PrismaProjectRepository().findById('proj-1');
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'proj-1' }, include: { tasks: true } });
        expect(result?.id).toBe('proj-1');
        expect(result?.tasks).toHaveLength(1);
    });

    it('findById returns null when project does not exist', async () => {
        mockFindUnique.mockResolvedValue(null as never);
        expect(await new PrismaProjectRepository().findById('no-such-id')).toBeNull();
    });

    it('findById throws and rethrows when prisma fails', async () => {
        mockFindUnique.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaProjectRepository().findById('id')).rejects.toThrow('DB error');
    });

    it('delete calls prisma.project.delete with the given id', async () => {
        mockDelete.mockResolvedValue({} as never);
        await new PrismaProjectRepository().delete('proj-1');
        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'proj-1' } });
    });

    it('delete throws and rethrows when prisma fails', async () => {
        mockDelete.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaProjectRepository().delete('id')).rejects.toThrow('DB error');
    });
});
