import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../database/prisma', () => ({
    prisma: { project: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() } },
}));

import { PrismaProjectRepository } from './prisma-project.repository';
import { prisma } from '../database/prisma';

const mockCreate = prisma.project.create as jest.MockedFunction<typeof prisma.project.create>;
const mockFindMany = prisma.project.findMany as jest.MockedFunction<typeof prisma.project.findMany>;
const mockFindUnique = prisma.project.findUnique as jest.MockedFunction<typeof prisma.project.findUnique>;

describe('PrismaProjectRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
        mockFindMany.mockReset();
        mockFindUnique.mockReset();
    });

    it('calls prisma.project.create and returns the result', async () => {
        const now = new Date();
        const expected = { id: 'abc', name: 'Test', description: null, createdAt: now, updatedAt: now };
        mockCreate.mockResolvedValue(expected as never);
        const repository = new PrismaProjectRepository();

        const result = await repository.create({ name: 'Test', description: null });

        expect(mockCreate).toHaveBeenCalledWith({ data: { name: 'Test', description: null } });
        expect(result).toEqual(expected);
    });

    it('passes description when provided', async () => {
        const now = new Date();
        const expected = { id: 'x', name: 'T', description: 'A desc', createdAt: now, updatedAt: now };
        mockCreate.mockResolvedValue(expected as never);
        const repository = new PrismaProjectRepository();

        await repository.create({ name: 'T', description: 'A desc' });

        expect(mockCreate).toHaveBeenCalledWith({ data: { name: 'T', description: 'A desc' } });
    });

    it('findAll returns mapped summaries ordered by createdAt desc', async () => {
        const now = new Date();
        const raw = [
            { id: '1', name: 'A', description: null, createdAt: now, updatedAt: now, _count: { tasks: 2 } },
            { id: '2', name: 'B', description: 'desc', createdAt: now, updatedAt: now, _count: { tasks: 0 } },
        ];
        mockFindMany.mockResolvedValue(raw as never);
        const repository = new PrismaProjectRepository();

        const result = await repository.findAll();

        expect(mockFindMany).toHaveBeenCalledWith({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { tasks: true } } },
        });
        expect(result).toEqual([
            { id: '1', name: 'A', description: null, taskCount: 2, createdAt: now, updatedAt: now },
            { id: '2', name: 'B', description: 'desc', taskCount: 0, createdAt: now, updatedAt: now },
        ]);
    });

    it('findAll returns empty array when no projects exist', async () => {
        mockFindMany.mockResolvedValue([] as never);
        const repository = new PrismaProjectRepository();

        const result = await repository.findAll();

        expect(result).toEqual([]);
    });

    it('findById returns mapped ProjectDetail with tasks when found', async () => {
        const now = new Date();
        const raw = {
            id: 'proj-1',
            name: 'My Project',
            description: null,
            createdAt: now,
            updatedAt: now,
            tasks: [
                {
                    id: 'task-1',
                    title: 'Task A',
                    description: null,
                    status: 'PENDING',
                    priority: 'MEDIUM',
                    projectId: 'proj-1',
                    createdAt: now,
                    updatedAt: now,
                },
            ],
        };
        mockFindUnique.mockResolvedValue(raw as never);
        const repository = new PrismaProjectRepository();

        const result = await repository.findById('proj-1');

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { id: 'proj-1' },
            include: { tasks: true },
        });
        expect(result).toEqual({
            id: 'proj-1',
            name: 'My Project',
            description: null,
            createdAt: now,
            updatedAt: now,
            tasks: [
                {
                    id: 'task-1',
                    title: 'Task A',
                    description: null,
                    status: 'PENDING',
                    priority: 'MEDIUM',
                    projectId: 'proj-1',
                    createdAt: now,
                    updatedAt: now,
                },
            ],
        });
    });

    it('findById returns null when project does not exist', async () => {
        mockFindUnique.mockResolvedValue(null as never);
        const repository = new PrismaProjectRepository();

        const result = await repository.findById('no-such-id');

        expect(result).toBeNull();
    });
});
