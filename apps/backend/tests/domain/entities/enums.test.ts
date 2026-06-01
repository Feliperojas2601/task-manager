import { TaskStatus, Priority } from '../../../src/domain/entities/enums';
import { describe, it, expect } from '@jest/globals';

describe('TaskStatus', () => {
    it('has all expected values', () => {
        expect(TaskStatus.PENDING).toBe('PENDING');
        expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
        expect(TaskStatus.DONE).toBe('DONE');
    });
});

describe('Priority', () => {
    it('has all expected values', () => {
        expect(Priority.LOW).toBe('LOW');
        expect(Priority.MEDIUM).toBe('MEDIUM');
        expect(Priority.HIGH).toBe('HIGH');
    });
});
