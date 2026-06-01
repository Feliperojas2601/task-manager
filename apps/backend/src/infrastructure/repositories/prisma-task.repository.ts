import { prisma } from '../database/prisma';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../application/repositories/task.repository';
import { TaskStatus, Priority } from '../../domain/entities/enums';
import { TaskFilter } from '../../domain/value-objects/task-filter';

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

    async findByProject(projectId: string, filters: TaskFilter): Promise<Task[]> {
        const sortBy = filters.sortBy ?? 'createdAt';
        const order = filters.order ?? 'desc';
        return prisma.task.findMany({
            where: {
                projectId,
                ...(filters.status !== undefined ? { status: filters.status } : {}),
                ...(filters.priority !== undefined ? { priority: filters.priority } : {}),
            },
            orderBy: sortBy === 'priority' ? { priority: order } : { createdAt: order },
        }) as Promise<Task[]>;
    }
}
