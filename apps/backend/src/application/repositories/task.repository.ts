import { Task } from '../../domain/entities/task.entity';
import { TaskStatus, Priority } from '../../domain/entities/enums';

export interface ITaskRepository {
    create(data: {
        title: string;
        description: string | null;
        status: TaskStatus;
        priority: Priority;
        projectId: string;
    }): Promise<Task>;
}
