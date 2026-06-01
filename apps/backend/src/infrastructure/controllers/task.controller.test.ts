import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../application/use-cases/create-task.use-case');
jest.mock('../../application/use-cases/update-task.use-case');
jest.mock('../../application/use-cases/delete-task.use-case');
jest.mock('../repositories/prisma-project.repository');
jest.mock('../repositories/prisma-task.repository');

import { TaskController } from './task.controller';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { globalErrorHandler } from '../middleware/error-handler';
import { Task } from '../../domain/entities/task.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const MockCreateUseCase = jest.mocked(CreateTaskUseCase);
const MockUpdateUseCase = jest.mocked(UpdateTaskUseCase);
const MockDeleteUseCase = jest.mocked(DeleteTaskUseCase);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const TASK_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const makeTask = (overrides?: Partial<Task>): Task => ({
    id: TASK_UUID,
    title: 'My Task',
    description: null,
    status: 'PENDING',
    priority: 'MEDIUM',
    projectId: VALID_UUID,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
});

const buildApp = () => {
    const controller = new TaskController();
    const app = express();
    app.use(express.json());
    app.post('/projects/:projectId/tasks', (req, res, next) => controller.create(req, res, next));
    app.patch('/tasks/:id', (req, res, next) => controller.update(req, res, next));
    app.delete('/tasks/:id', (req, res, next) => controller.remove(req, res, next));
    app.use(globalErrorHandler);
    return app;
};

describe('POST /projects/:projectId/tasks', () => {
    beforeEach(() => {
        MockCreateUseCase.mockClear();
    });

    it('returns 201 with the created task', async () => {
        MockCreateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockResolvedValue(makeTask());
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: 'My Task' });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe(TASK_UUID);
        expect(response.body.status).toBe('PENDING');
        expect(response.body.priority).toBe('MEDIUM');
    });

    it('returns 400 when projectId is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app).post('/projects/not-a-uuid/tasks').send({ title: 'Task' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'projectId must be a valid UUID' });
    });

    it('returns 400 when title is missing', async () => {
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'title is required' });
    });

    it('returns 400 when title is empty', async () => {
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: '   ' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'title is required' });
    });

    it('returns 400 when status is invalid', async () => {
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: 'Task', status: 'INVALID' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('status must be one of');
    });

    it('returns 400 when priority is invalid', async () => {
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: 'Task', priority: 'CRITICAL' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('priority must be one of');
    });

    it('returns 404 when project does not exist', async () => {
        MockCreateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(
            new NotFoundError(`Project with id ${VALID_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: 'Task' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Project with id ${VALID_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockCreateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).post(`/projects/${VALID_UUID}/tasks`).send({ title: 'Task' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});

describe('PATCH /tasks/:id', () => {
    beforeEach(() => {
        MockUpdateUseCase.mockClear();
    });

    it('returns 200 with the updated task', async () => {
        const updated = makeTask({ title: 'Updated', status: 'IN_PROGRESS' });
        MockUpdateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockResolvedValue(updated);
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ title: 'Updated', status: 'IN_PROGRESS' });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated');
        expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('returns 400 when id is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app).patch('/tasks/not-a-uuid').send({ title: 'X' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'id must be a valid UUID' });
    });

    it('returns 400 when body is empty', async () => {
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({});

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'at least one field must be provided' });
    });

    it('returns 400 when title is empty string', async () => {
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ title: '   ' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'title must not be empty' });
    });

    it('returns 400 when status is invalid', async () => {
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ status: 'INVALID' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('status must be one of');
    });

    it('returns 400 when priority is invalid', async () => {
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ priority: 'URGENT' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch('priority must be one of');
    });

    it('returns 404 when task is not found', async () => {
        MockUpdateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(
            new NotFoundError(`Task with id ${TASK_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ status: 'DONE' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Task with id ${TASK_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockUpdateUseCase.prototype.execute = jest.fn<() => Promise<Task>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).patch(`/tasks/${TASK_UUID}`).send({ status: 'DONE' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});

describe('DELETE /tasks/:id', () => {
    beforeEach(() => {
        MockDeleteUseCase.mockClear();
    });

    it('returns 204 when task is deleted', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
        const app = buildApp();

        const response = await request(app).delete(`/tasks/${TASK_UUID}`);

        expect(response.status).toBe(204);
    });

    it('returns 400 when id is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app).delete('/tasks/not-a-uuid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'id must be a valid UUID' });
    });

    it('returns 404 when task is not found', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockRejectedValue(
            new NotFoundError(`Task with id ${TASK_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app).delete(`/tasks/${TASK_UUID}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Task with id ${TASK_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).delete(`/tasks/${TASK_UUID}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});
