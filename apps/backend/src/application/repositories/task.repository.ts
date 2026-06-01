import { Task } from '../../domain/entities/task.entity';
import { TaskStatus, Priority } from '../../domain/entities/enums';
import { TaskFilter } from '../../domain/entities/task.entity';

export interface ITaskRepository {
    create(data: {
        title: string;
        description: string | null;
        status: TaskStatus;
        priority: Priority;
        projectId: string;
    }): Promise<Task>;
    findById(id: string): Promise<Task | null>;
    update(id: string, data: {
        title?: string;
        description?: string | null;
        status?: TaskStatus;
        priority?: Priority;
    }): Promise<Task>;
    delete(id: string): Promise<void>;
    findByProject(projectId: string, filters: TaskFilter): Promise<Task[]>;
}
