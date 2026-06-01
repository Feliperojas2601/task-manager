import { prisma } from '../database/prisma';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../application/repositories/task.repository';
import { TaskStatus, Priority } from '../../domain/entities/enums';

export class PrismaTaskRepository implements ITaskRepository {
    async create(data: {
        title: string;
        description: string | null;
        status: TaskStatus;
        priority: Priority;
        projectId: string;
    }): Promise<Task> {
        return prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                projectId: data.projectId,
            },
        });
    }
}
