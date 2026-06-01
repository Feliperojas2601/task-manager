import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../database/prisma', () => ({
    prisma: { project: { create: jest.fn() } },
}));

import { PrismaProjectRepository } from './prisma-project.repository';
import { prisma } from '../database/prisma';

const mockCreate = prisma.project.create as jest.MockedFunction<typeof prisma.project.create>;

describe('PrismaProjectRepository', () => {
    beforeEach(() => {
        mockCreate.mockReset();
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
});
