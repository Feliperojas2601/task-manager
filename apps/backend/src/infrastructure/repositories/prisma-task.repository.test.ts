import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../database/prisma', () => ({
    prisma: { task: { create: jest.fn() } },
}));

import { PrismaTaskRepository } from './prisma-task.repository';
import { prisma } from '../database/prisma';

const mockCreate = prisma.task.create as jest.MockedFunction<typeof prisma.task.create>;

describe('PrismaTaskRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
    });

    it('calls prisma.task.create with correct data and returns the result', async () => {
        const now = new Date();
        const expected = {
            id: 'task-1',
            title: 'Task A',
            description: null,
            status: 'PENDING',
            priority: 'MEDIUM',
            projectId: 'proj-1',
            createdAt: now,
            updatedAt: now,
        };
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
            data: {
                title: 'Task A',
                description: null,
                status: 'PENDING',
                priority: 'MEDIUM',
                projectId: 'proj-1',
            },
        });
        expect(result).toEqual(expected);
    });

    it('passes description when provided', async () => {
        const now = new Date();
        mockCreate.mockResolvedValue({
            id: 'task-2',
            title: 'T',
            description: 'desc',
            status: 'DONE',
            priority: 'HIGH',
            projectId: 'proj-1',
            createdAt: now,
            updatedAt: now,
        } as never);
        const repository = new PrismaTaskRepository();

        await repository.create({
            title: 'T',
            description: 'desc',
            status: 'DONE',
            priority: 'HIGH',
            projectId: 'proj-1',
        });

        expect(mockCreate).toHaveBeenCalledWith({ data: expect.objectContaining({ description: 'desc' }) });
    });
});
