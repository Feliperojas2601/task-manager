import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../application/use-cases/create-task.use-case');
jest.mock('../repositories/prisma-project.repository');
jest.mock('../repositories/prisma-task.repository');

import { TaskController } from './task.controller';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { globalErrorHandler } from '../middleware/error-handler';
import { Task } from '../../domain/entities/task.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const MockUseCase = jest.mocked(CreateTaskUseCase);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeTask = (): Task => ({
    id: 'task-1',
    title: 'My Task',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: VALID_UUID,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
});

const buildApp = () => {
    const controller = new TaskController();
    const app = express();
    app.use(express.json());
    app.post('/projects/:projectId/tasks', (req, res, next) => controller.create(req, res, next));
    app.use(globalErrorHandler);
    return app;
};

describe('POST /projects/:projectId/tasks', () => {
    beforeEach(() => {
        MockUseCase.mockClear();
    });

    it('returns 201 with the created task', async () => {
        const task = makeTask();
        MockUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockResolvedValue(task);
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: 'My Task' });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe('task-1');
        expect(response.body.status).toBe('PENDING');
        expect(response.body.priority).toBe('MEDIUM');
    });

    it('returns 400 when projectId is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app)
            .post('/projects/not-a-uuid/tasks')
            .send({ title: 'Task' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'projectId must be a valid UUID' });
    });

    it('returns 400 when title is missing', async () => {
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'title is required' });
    });

    it('returns 400 when title is empty', async () => {
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: '   ' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'title is required' });
    });

    it('returns 400 when status is invalid', async () => {
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: 'Task', status: 'INVALID' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('status must be one of');
    });

    it('returns 400 when priority is invalid', async () => {
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: 'Task', priority: 'CRITICAL' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('priority must be one of');
    });

    it('returns 404 when project does not exist', async () => {
        MockUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(
            new NotFoundError(`Project with id ${VALID_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: 'Task' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Project with id ${VALID_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app)
            .post(`/projects/${VALID_UUID}/tasks`)
            .send({ title: 'Task' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});
