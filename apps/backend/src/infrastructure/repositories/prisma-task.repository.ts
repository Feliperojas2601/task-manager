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

    async findById(id: string): Promise<Task | null> {
        return prisma.task.findUnique({ where: { id } });
    }

    async update(id: string, data: {
        title?: string;
        description?: string | null;
        status?: TaskStatus;
        priority?: Priority;
    }): Promise<Task> {
        return prisma.task.update({ where: { id }, data });
    }

    async delete(id: string): Promise<void> {
        await prisma.task.delete({ where: { id } });
    }
}
