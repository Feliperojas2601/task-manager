import { describe, it, expect } from '@jest/globals';
import { TaskValidator } from './task.validator';

describe('TaskValidator', () => {
    const validator = new TaskValidator();

    describe('validateProjectId', () => {
        it('returns the id when it is a valid UUID', () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            expect(validator.validateProjectId(id)).toBe(id);
        });

        it('throws ValidationError when id is not a UUID', () => {
            expect(() => validator.validateProjectId('not-a-uuid')).toThrow('projectId must be a valid UUID');
        });

        it('throws ValidationError when id is empty', () => {
            expect(() => validator.validateProjectId('')).toThrow('projectId must be a valid UUID');
        });
    });

    describe('validateTaskId', () => {
        it('returns the id when it is a valid UUID', () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            expect(validator.validateTaskId(id)).toBe(id);
        });

        it('throws ValidationError when id is not a UUID', () => {
            expect(() => validator.validateTaskId('not-a-uuid')).toThrow('id must be a valid UUID');
        });

        it('throws ValidationError when id is empty', () => {
            expect(() => validator.validateTaskId('')).toThrow('id must be a valid UUID');
        });
    });

    describe('validateCreate', () => {
        const projectId = '550e8400-e29b-41d4-a716-446655440000';

        it('returns valid input with defaults when status and priority are omitted', () => {
            const result = validator.validateCreate(projectId, { title: '  My Task  ' });
            expect(result).toEqual({
                projectId,
                title: 'My Task',
                description: undefined,
                status: 'PENDING',
                priority: 'MEDIUM',
            });
        });

        it('returns valid input with explicit status and priority', () => {
            const result = validator.validateCreate(projectId, {
                title: 'Task',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
            });
            expect(result.status).toBe('IN_PROGRESS');
            expect(result.priority).toBe('HIGH');
        });

        it('returns description when provided', () => {
            const result = validator.validateCreate(projectId, { title: 'Task', description: 'Some desc' });
            expect(result.description).toBe('Some desc');
        });

        it('returns undefined description when not a string', () => {
            const result = validator.validateCreate(projectId, { title: 'Task', description: 99 });
            expect(result.description).toBeUndefined();
        });

        it('throws ValidationError when title is missing', () => {
            expect(() => validator.validateCreate(projectId, {})).toThrow('title is required');
        });

        it('throws ValidationError when title is empty string', () => {
            expect(() => validator.validateCreate(projectId, { title: '   ' })).toThrow('title is required');
        });

        it('throws ValidationError when title is not a string', () => {
            expect(() => validator.validateCreate(projectId, { title: 42 })).toThrow('title is required');
        });

        it('throws ValidationError when status is an invalid value', () => {
            expect(() => validator.validateCreate(projectId, { title: 'Task', status: 'INVALID' })).toThrow(
                'status must be one of PENDING, IN_PROGRESS, DONE',
            );
        });

        it('throws ValidationError when priority is an invalid value', () => {
            expect(() => validator.validateCreate(projectId, { title: 'Task', priority: 'CRITICAL' })).toThrow(
                'priority must be one of LOW, MEDIUM, HIGH',
            );
        });
    });

    describe('validateUpdate', () => {
        it('throws ValidationError when body is empty', () => {
            expect(() => validator.validateUpdate({})).toThrow('at least one field must be provided');
        });

        it('returns title when provided and valid', () => {
            const result = validator.validateUpdate({ title: '  Updated  ' });
            expect(result).toEqual({ title: 'Updated' });
        });

        it('throws ValidationError when title is empty string', () => {
            expect(() => validator.validateUpdate({ title: '   ' })).toThrow('title must not be empty');
        });

        it('returns description as string when provided', () => {
            const result = validator.validateUpdate({ description: 'A description' });
            expect(result).toEqual({ description: 'A description' });
        });

        it('returns description as null when explicitly set to null', () => {
            const result = validator.validateUpdate({ description: null });
            expect(result).toEqual({ description: null });
        });

        it('returns status when provided and valid', () => {
            const result = validator.validateUpdate({ status: 'DONE' });
            expect(result).toEqual({ status: 'DONE' });
        });

        it('throws ValidationError when status is invalid', () => {
            expect(() => validator.validateUpdate({ status: 'INVALID' })).toThrow('status must be one of PENDING, IN_PROGRESS, DONE');
        });

        it('returns priority when provided and valid', () => {
            const result = validator.validateUpdate({ priority: 'HIGH' });
            expect(result).toEqual({ priority: 'HIGH' });
        });

        it('throws ValidationError when priority is invalid', () => {
            expect(() => validator.validateUpdate({ priority: 'URGENT' })).toThrow('priority must be one of LOW, MEDIUM, HIGH');
        });

        it('returns multiple fields when all are valid', () => {
            const result = validator.validateUpdate({ title: 'T', status: 'IN_PROGRESS', priority: 'LOW' });
            expect(result).toEqual({ title: 'T', status: 'IN_PROGRESS', priority: 'LOW' });
        });
    });

    describe('validateListQuery', () => {
        it('returns empty filters when query is empty', () => {
            expect(validator.validateListQuery({})).toEqual({});
        });

        it('returns status filter when valid', () => {
            expect(validator.validateListQuery({ status: 'IN_PROGRESS' })).toEqual({ status: 'IN_PROGRESS' });
        });

        it('throws ValidationError when status is invalid', () => {
            expect(() => validator.validateListQuery({ status: 'INVALID' })).toThrow('status must be one of PENDING, IN_PROGRESS, DONE');
        });

        it('returns priority filter when valid', () => {
            expect(validator.validateListQuery({ priority: 'HIGH' })).toEqual({ priority: 'HIGH' });
        });

        it('throws ValidationError when priority is invalid', () => {
            expect(() => validator.validateListQuery({ priority: 'URGENT' })).toThrow('priority must be one of LOW, MEDIUM, HIGH');
        });

        it('returns sortBy createdAt when valid', () => {
            expect(validator.validateListQuery({ sortBy: 'createdAt' })).toEqual({ sortBy: 'createdAt' });
        });

        it('returns sortBy priority when valid', () => {
            expect(validator.validateListQuery({ sortBy: 'priority' })).toEqual({ sortBy: 'priority' });
        });

        it('throws ValidationError when sortBy is invalid', () => {
            expect(() => validator.validateListQuery({ sortBy: 'name' })).toThrow('sortBy must be one of createdAt, priority');
        });

        it('returns order asc when valid', () => {
            expect(validator.validateListQuery({ order: 'asc' })).toEqual({ order: 'asc' });
        });

        it('returns order desc when valid', () => {
            expect(validator.validateListQuery({ order: 'desc' })).toEqual({ order: 'desc' });
        });

        it('throws ValidationError when order is invalid', () => {
            expect(() => validator.validateListQuery({ order: 'sideways' })).toThrow('order must be one of asc, desc');
        });

        it('returns all filters combined', () => {
            const result = validator.validateListQuery({ status: 'DONE', priority: 'LOW', sortBy: 'priority', order: 'asc' });
            expect(result).toEqual({ status: 'DONE', priority: 'LOW', sortBy: 'priority', order: 'asc' });
        });
    });
});
