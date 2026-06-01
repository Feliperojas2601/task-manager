import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../database/prisma', () => ({
    prisma: { task: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), findMany: jest.fn() } },
}));

import { PrismaTaskRepository } from './prisma-task.repository';
import { prisma } from '../database/prisma';

const mockCreate = prisma.task.create as jest.MockedFunction<typeof prisma.task.create>;
const mockFindUnique = prisma.task.findUnique as jest.MockedFunction<typeof prisma.task.findUnique>;
const mockUpdate = prisma.task.update as jest.MockedFunction<typeof prisma.task.update>;
const mockDelete = prisma.task.delete as jest.MockedFunction<typeof prisma.task.delete>;
const mockFindMany = prisma.task.findMany as jest.MockedFunction<typeof prisma.task.findMany>;

const makeRaw = (overrides = {}) => {
    const now = new Date();
    return {
        id: 'task-1',
        title: 'Task A',
        description: null,
        status: 'PENDING',
        priority: 'MEDIUM',
        projectId: 'proj-1',
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
};

describe('PrismaTaskRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
        mockFindUnique.mockReset();
        mockUpdate.mockReset();
        mockDelete.mockReset();
        mockFindMany.mockReset();
    });

    it('calls prisma.task.create with correct data and returns the result', async () => {
        const expected = makeRaw();
        mockCreate.mockResolvedValue(expected as never);
        const repository = new PrismaTaskRepository();

        const result = await repository.create({
            title: 'Task A',
            description: null,
            status: 'PENDING',
            priority: 'MEDIUM',
            projectId: 'proj-1',
        });

        expect(mockCreate).toHaveBeenCalledWith({
            data: { title: 'Task A', description: null, status: 'PENDING', priority: 'MEDIUM', projectId: 'proj-1' },
        });
        expect(result).toEqual(expected);
    });

    it('passes description when provided to create', async () => {
        mockCreate.mockResolvedValue(makeRaw({ description: 'desc' }) as never);
        const repository = new PrismaTaskRepository();

        await repository.create({ title: 'T', description: 'desc', status: 'DONE', priority: 'HIGH', projectId: 'proj-1' });

        expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ description: 'desc' }) });
    });

    it('findById returns task when found', async () => {
        const expected = makeRaw();
        mockFindUnique.mockResolvedValue(expected as never);
        const repository = new PrismaTaskRepository();

        const result = await repository.findById('task-1');

        expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'task-1' } });
        expect(result).toEqual(expected);
    });

    it('findById returns null when not found', async () => {
        mockFindUnique.mockResolvedValue(null as never);
        const repository = new PrismaTaskRepository();

        const result = await repository.findById('no-such-id');

        expect(result).toBeNull();
    });

    it('update calls prisma.task.update and returns result', async () => {
        const expected = makeRaw({ title: 'Updated', status: 'DONE' });
        mockUpdate.mockResolvedValue(expected as never);
        const repository = new PrismaTaskRepository();

        const result = await repository.update('task-1', { title: 'Updated', status: 'DONE' });

        expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'task-1' }, data: { title: 'Updated', status: 'DONE' } });
        expect(result).toEqual(expected);
    });

    it('delete calls prisma.task.delete with the given id', async () => {
        mockDelete.mockResolvedValue({} as never);
        const repository = new PrismaTaskRepository();

        await repository.delete('task-1');

        expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('findByProject returns tasks with no filters, ordered by createdAt desc', async () => {
        const tasks = [makeRaw()];
        mockFindMany.mockResolvedValue(tasks as never);
        const repository = new PrismaTaskRepository();

        const result = await repository.findByProject('proj-1', {});

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { projectId: 'proj-1' },
            orderBy: { createdAt: 'desc' },
        });
        expect(result).toEqual(tasks);
    });

    it('findByProject applies status and priority filters', async () => {
        mockFindMany.mockResolvedValue([] as never);
        const repository = new PrismaTaskRepository();

        await repository.findByProject('proj-1', { status: 'DONE', priority: 'HIGH' });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { projectId: 'proj-1', status: 'DONE', priority: 'HIGH' },
            orderBy: { createdAt: 'desc' },
        });
    });

    it('findByProject applies sortBy priority with asc order', async () => {
        mockFindMany.mockResolvedValue([] as never);
        const repository = new PrismaTaskRepository();

        await repository.findByProject('proj-1', { sortBy: 'priority', order: 'asc' });

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { projectId: 'proj-1' },
            orderBy: { priority: 'asc' },
        });
    });
});
