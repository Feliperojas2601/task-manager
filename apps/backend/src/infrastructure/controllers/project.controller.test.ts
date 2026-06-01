import request from 'supertest';
import express from 'express';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../application/use-cases/create-project.use-case');
jest.mock('../../application/use-cases/list-projects.use-case');
jest.mock('../../application/use-cases/get-project-detail.use-case');
jest.mock('../../application/use-cases/delete-project.use-case');
jest.mock('../repositories/prisma-project.repository');

import { ProjectController } from './project.controller';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { GetProjectDetailUseCase } from '../../application/use-cases/get-project-detail.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.use-case';
import { globalErrorHandler } from '../middleware/error-handler';
import { Project, ProjectSummary, ProjectDetail } from '../../domain/entities/project.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';

const MockCreateUseCase = jest.mocked(CreateProjectUseCase);
const MockListUseCase = jest.mocked(ListProjectsUseCase);
const MockGetDetailUseCase = jest.mocked(GetProjectDetailUseCase);
const MockDeleteUseCase = jest.mocked(DeleteProjectUseCase);

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const makeProject = (): Project => ({
    id: VALID_UUID,
    name: 'Test Project',
    description: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
});

const makeSummary = (overrides?: Partial<ProjectSummary>): ProjectSummary => ({
    id: VALID_UUID,
    name: 'Test Project',
    description: null,
    taskCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
});

const makeDetail = (overrides?: Partial<ProjectDetail>): ProjectDetail => ({
    id: VALID_UUID,
    name: 'Test Project',
    description: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    tasks: [],
    ...overrides,
});

const buildApp = () => {
    const controller = new ProjectController();
    const app = express();
    app.use(express.json());
    app.post('/projects', (req, res, next) => controller.create(req, res, next));
    app.get('/projects', (req, res, next) => controller.list(req, res, next));
    app.get('/projects/:id', (req, res, next) => controller.getById(req, res, next));
    app.delete('/projects/:id', (req, res, next) => controller.remove(req, res, next));
    app.use(globalErrorHandler);
    return app;
};

describe('POST /projects', () => {
    beforeEach(() => {
        MockCreateUseCase.mockClear();
    });

    it('returns 201 with the created project', async () => {
        const project = makeProject();
        MockCreateUseCase.prototype.execute = jest.fn<() => Promise<Project>>().mockResolvedValue(project);
        const app = buildApp();

        const response = await request(app).post('/projects').send({ name: 'Test Project' });

        expect(response.status).toBe(201);
        expect(response.body.id).toBe(VALID_UUID);
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
        MockCreateUseCase.prototype.execute = jest.fn<() => Promise<Project>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).post('/projects').send({ name: 'Test' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});

describe('GET /projects', () => {
    beforeEach(() => {
        MockListUseCase.mockClear();
    });

    it('returns 200 with list of projects', async () => {
        const projects = [makeSummary({ id: '1', taskCount: 2 }), makeSummary({ id: '2' })];
        MockListUseCase.prototype.execute = jest.fn<() => Promise<ProjectSummary[]>>().mockResolvedValue(projects);
        const app = buildApp();

        const response = await request(app).get('/projects');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].taskCount).toBe(2);
    });

    it('returns 200 with empty array when no projects exist', async () => {
        MockListUseCase.prototype.execute = jest.fn<() => Promise<ProjectSummary[]>>().mockResolvedValue([]);
        const app = buildApp();

        const response = await request(app).get('/projects');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockListUseCase.prototype.execute = jest.fn<() => Promise<ProjectSummary[]>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).get('/projects');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});

describe('GET /projects/:id', () => {
    beforeEach(() => {
        MockGetDetailUseCase.mockClear();
    });

    it('returns 200 with project detail when found', async () => {
        const detail = makeDetail({ tasks: [] });
        MockGetDetailUseCase.prototype.execute = jest.fn<() => Promise<ProjectDetail>>().mockResolvedValue(detail);
        const app = buildApp();

        const response = await request(app).get(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(VALID_UUID);
        expect(response.body.tasks).toEqual([]);
    });

    it('returns 400 when id is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app).get('/projects/not-a-uuid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'id must be a valid UUID' });
    });

    it('returns 404 when project is not found', async () => {
        MockGetDetailUseCase.prototype.execute = jest.fn<() => Promise<ProjectDetail>>().mockRejectedValue(
            new NotFoundError(`Project with id ${VALID_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app).get(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Project with id ${VALID_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockGetDetailUseCase.prototype.execute = jest.fn<() => Promise<ProjectDetail>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).get(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});

describe('DELETE /projects/:id', () => {
    beforeEach(() => {
        MockDeleteUseCase.mockClear();
    });

    it('returns 204 when project is deleted', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
        const app = buildApp();

        const response = await request(app).delete(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(204);
    });

    it('returns 400 when id is not a valid UUID', async () => {
        const app = buildApp();

        const response = await request(app).delete('/projects/not-a-uuid');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ status: 400, message: 'id must be a valid UUID' });
    });

    it('returns 404 when project is not found', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockRejectedValue(
            new NotFoundError(`Project with id ${VALID_UUID} not found`),
        );
        const app = buildApp();

        const response = await request(app).delete(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ status: 404, message: `Project with id ${VALID_UUID} not found` });
    });

    it('returns 500 on unexpected use-case error', async () => {
        MockDeleteUseCase.prototype.execute = jest.fn<() => Promise<void>>().mockRejectedValue(new Error('DB down'));
        const app = buildApp();

        const response = await request(app).delete(`/projects/${VALID_UUID}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Internal server error' });
    });
});
