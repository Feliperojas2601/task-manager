import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../../src/infrastructure/logging/pino-logger', () => ({
    createLogger: jest.fn().mockReturnValue({ info: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../src/infrastructure/database/prisma', () => ({
    prisma: { task: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() } },
}));

import { PrismaTaskRepository } from '../../../src/infrastructure/repositories/prisma-task.repository';
import { prisma } from '../../../src/infrastructure/database/prisma';

const mockCreate = prisma.task.create as jest.MockedFunction<typeof prisma.task.create>;
const mockFindUnique = prisma.task.findUnique as jest.MockedFunction<typeof prisma.task.findUnique>;
const mockUpdate = prisma.task.update as jest.MockedFunction<typeof prisma.task.update>;
const mockDelete = prisma.task.delete as jest.MockedFunction<typeof prisma.task.delete>;
const mockFindMany = prisma.task.findMany as jest.MockedFunction<typeof prisma.task.findMany>;

const makeRaw = (overrides = {}) => ({
    id: 'task-1', title: 'Task A', description: null, status: 'PENDING', priority: 'MEDIUM',
    projectId: 'proj-1', createdAt: new Date(), updatedAt: new Date(), ...overrides,
});

describe('PrismaTaskRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
        mockFindUnique.mockReset();
        mockUpdate.mockReset();
        mockDelete.mockReset();
        mockFindMany.mockReset();
    });

    it('create calls prisma.task.create with correct data and returns the result', async () => {
        const expected = makeRaw();
        mockCreate.mockResolvedValue(expected as never);
        const result = await new PrismaTaskRepository().create({ title: 'Task A', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: 'proj-1' });
        expect(mockCreate).toHaveBeenCalledWith({ data: { title: 'Task A', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: 'proj-1' } });
        expect(result).toEqual(expected);
    });

    it('create throws and rethrows when prisma fails', async () => {
        mockCreate.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaTaskRepository().create({ title: 'T', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: 'p' })).rejects.toThrow('DB error');
    });

    it('findById returns task when found', async () => {
        mockFindUnique.mockResolvedValue(makeRaw() as never);
        const result = await new PrismaTaskRepository().findById('task-1');
        expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'task-1' } });
        expect(result?.id).toBe('task-1');
    });

    it('findById returns null when not found', async () => {
        mockFindUnique.mockResolvedValue(null as never);
        expect(await new PrismaTaskRepository().findById('no-such-id')).toBeNull();
    });

    it('findById throws and rethrows when prisma fails', async () => {
        mockFindUnique.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaTaskRepository().findById('id')).rejects.toThrow('DB error');
    });

    it('update calls prisma.task.update and returns result', async () => {
        const expected = makeRaw({ title: 'Updated', status: 'DONE' });
        mockUpdate.mockResolvedValue(expected as never);
        const result = await new PrismaTaskRepository().update('task-1', { title: 'Updated', status: 'DONE' });
        expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'task-1' }, data: { title: 'Updated', status: 'DONE' } });
        expect(result).toEqual(expected);
    });

    it('update throws and rethrows when prisma fails', async () => {
        mockUpdate.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaTaskRepository().update('id', { title: 'X' })).rejects.toThrow('DB error');
    });

    it('delete calls prisma.task.delete with the given id', async () => {
        mockDelete.mockResolvedValue({} as never);
        await new PrismaTaskRepository().delete('task-1');
        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('delete throws and rethrows when prisma fails', async () => {
        mockDelete.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaTaskRepository().delete('id')).rejects.toThrow('DB error');
    });

    it('findByProject returns tasks with no filters, ordered by createdAt desc', async () => {
        const tasks = [makeRaw()];
        mockFindMany.mockResolvedValue(tasks as never);
        const result = await new PrismaTaskRepository().findByProject('proj-1', {});
        expect(mockFindMany).toHaveBeenCalledWith({ where: { projectId: 'proj-1' }, orderBy: { createdAt: 'desc' } });
        expect(result).toEqual(tasks);
    });

    it('findByProject applies status and priority filters', async () => {
        mockFindMany.mockResolvedValue([] as never);
        await new PrismaTaskRepository().findByProject('proj-1', { status: 'DONE', priority: 'HIGH' });
        expect(mockFindMany).toHaveBeenCalledWith({ where: { projectId: 'proj-1', status: 'DONE', priority: 'HIGH' }, orderBy: { createdAt: 'desc' } });
    });

    it('findByProject applies sortBy priority with asc order', async () => {
        mockFindMany.mockResolvedValue([] as never);
        await new PrismaTaskRepository().findByProject('proj-1', { sortBy: 'priority', order: 'asc' });
        expect(mockFindMany).toHaveBeenCalledWith({ where: { projectId: 'proj-1' }, orderBy: { priority: 'asc' } });
    });

    it('findByProject throws and rethrows when prisma fails', async () => {
        mockFindMany.mockRejectedValue(new Error('DB error'));
        await expect(new PrismaTaskRepository().findByProject('proj-1', {})).rejects.toThrow('DB error');
    });
});
