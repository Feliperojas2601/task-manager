import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../application/use-cases/create-project.use-case');
jest.mock('../repositories/prisma-project.repository');

import { ProjectController } from './project.controller';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { globalErrorHandler } from '../middleware/error-handler';
import { Project } from '../../domain/entities/project.entity';

const MockUseCase = jest.mocked(CreateProjectUseCase);

const makeProject = (): Project => ({
    id: 'abc-123',
    name: 'Test Project',
    description: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
});

const buildApp = () => {
    const controller = new ProjectController();
    const app = express();
    app.use(express.json());
    app.post('/projects', (req, res, next) => controller.create(req, res, next));
    app.use(globalErrorHandler);
    return app;
};

describe('POST /projects', () => {
    beforeEach(() => {
        MockUseCase.mockClear();
    });

    it('returns 201 with the created project', async () => {
        const project = makeProject();
        MockUseCase.prototype.execute = jest.fn<() => Promise<Project>>().mockResolvedValue(project);
        const app = buildApp();

        const response = await request(app).post('/projects').send({ name: 'Test Project' });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe('abc-123');
        expect(response.body.name).toBe('Test Project');
    });

    it('returns 400 with status and message when name is missing', async () => {
        const app = buildApp();

        const response = await request(app).post('/projects').send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'name is required' });
    });

    it('returns 400 with status and message when name is empty', async () => {
        const app = buildApp();

        const response = await request(app).post('/projects').send({ name: '   ' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'name is required' });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockUseCase.prototype.execute = jest.fn<() => Promise<Project>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).post('/projects').send({ name: 'Test' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});
