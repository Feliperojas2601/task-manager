import { describe, it, expect } from '@jest/globals';
import { ProjectValidator } from './project.validator';

describe('ProjectValidator', () => {
    const validator = new ProjectValidator();

    describe('validateCreate', () => {
        it('returns trimmed name and description when valid', () => {
            const result = validator.validateCreate({ name: '  My Project  ', description: 'desc' });
            expect(result).toEqual({ name: 'My Project', description: 'desc' });
        });

        it('returns undefined description when not provided', () => {
            const result = validator.validateCreate({ name: 'Project' });
            expect(result.description).toBeUndefined();
        });

        it('returns undefined description when not a string', () => {
            const result = validator.validateCreate({ name: 'Project', description: 42 });
            expect(result.description).toBeUndefined();
        });

        it('throws ValidationError when name is missing', () => {
            expect(() => validator.validateCreate({})).toThrow('name is required');
        });

        it('throws ValidationError when name is empty string', () => {
            expect(() => validator.validateCreate({ name: '' })).toThrow('name is required');
        });

        it('throws ValidationError when name is whitespace only', () => {
            expect(() => validator.validateCreate({ name: '   ' })).toThrow('name is required');
        });

        it('throws ValidationError when name is not a string', () => {
            expect(() => validator.validateCreate({ name: 123 })).toThrow('name is required');
        });
    });
});
