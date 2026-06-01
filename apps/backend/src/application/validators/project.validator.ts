import { ValidationError } from '../../domain/errors/validation.error';

export interface CreateProjectInput {
    name: string;
    description?: string;
}

export class ProjectValidator {
    validateCreate(body: Record<string, unknown>): CreateProjectInput {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (!name) {
            throw new ValidationError('name is required');
        }
        const description = typeof body.description === 'string' ? body.description : undefined;
        return { name, description };
    }
}
