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
});
