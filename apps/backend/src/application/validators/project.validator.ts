import { ValidationError } from '../../domain/errors/validation.error';

export interface CreateProjectInput {
    name: string;
    description?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ProjectValidator {
    validateCreate(body: Record<string, unknown>): CreateProjectInput {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (!name) {
            throw new ValidationError('name is required');
        }
        const description = typeof body.description === 'string' ? body.description : undefined;
        return { name, description };
    }

    validateId(id: string): string {
        if (!UUID_REGEX.test(id)) {
            throw new ValidationError('id must be a valid UUID');
        }
        return id;
    }
}
