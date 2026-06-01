import { TaskStatus, Priority } from '../../domain/entities/enums';
import { ValidationError } from '../../domain/errors/validation.error';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CreateTaskInput {
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
}

export class TaskValidator {
    validateProjectId(id: string): string {
        if (!UUID_REGEX.test(id)) {
            throw new ValidationError('projectId must be a valid UUID');
        }
        return id;
    }

    validateCreate(projectId: string, body: Record<string, unknown>): CreateTaskInput {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        if (!title) {
            throw new ValidationError('title is required');
        }
        const description = typeof body.description === 'string' ? body.description : undefined;
        const status = this.parseStatus(body.status);
        const priority = this.parsePriority(body.priority);
        return { projectId, title, description, status, priority };
    }

    private parseStatus(value: unknown): TaskStatus {
        if (value === undefined) return TaskStatus.PENDING;
        const valid = Object.values(TaskStatus);
        if (valid.includes(value as TaskStatus)) return value as TaskStatus;
        throw new ValidationError(`status must be one of ${valid.join(', ')}`);
    }

    private parsePriority(value: unknown): Priority {
        if (value === undefined) return Priority.MEDIUM;
        const valid = Object.values(Priority);
        if (valid.includes(value as Priority)) return value as Priority;
        throw new ValidationError(`priority must be one of ${valid.join(', ')}`);
    }
}
