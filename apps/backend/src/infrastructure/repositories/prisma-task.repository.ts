import { prisma } from '../database/prisma';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../application/repositories/task.repository';
import { TaskStatus, Priority } from '../../domain/entities/enums';
import { TaskFilter } from '../../domain/entities/task.entity';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('repository');

export class PrismaTaskRepository implements ITaskRepository {
    async create(data: {
        title: string;
        description: string | null;
        status: TaskStatus;
        priority: Priority;
        projectId: string;
    }): Promise<Task> {
        logger.info('PrismaTaskRepository.create - start');
        try {
            const result = await prisma.task.create({
                data: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    projectId: data.projectId,
                },
            });
            logger.info('PrismaTaskRepository.create - end');
            return result;
        } catch (error) {
            logger.error('PrismaTaskRepository.create - error', { message: (error as Error).message });
            throw error;
        }
    }

    async findById(id: string): Promise<Task | null> {
        logger.info('PrismaTaskRepository.findById - start');
        try {
            const result = await prisma.task.findUnique({ where: { id } });
            logger.info('PrismaTaskRepository.findById - end');
            return result;
        } catch (error) {
            logger.error('PrismaTaskRepository.findById - error', { message: (error as Error).message });
            throw error;
        }
    }

    async update(id: string, data: {
        title?: string;
        description?: string | null;
        status?: TaskStatus;
        priority?: Priority;
    }): Promise<Task> {
        logger.info('PrismaTaskRepository.update - start');
        try {
            const result = await prisma.task.update({ where: { id }, data });
            logger.info('PrismaTaskRepository.update - end');
            return result;
        } catch (error) {
            logger.error('PrismaTaskRepository.update - error', { message: (error as Error).message });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        logger.info('PrismaTaskRepository.delete - start');
        try {
            await prisma.task.delete({ where: { id } });
            logger.info('PrismaTaskRepository.delete - end');
        } catch (error) {
            logger.error('PrismaTaskRepository.delete - error', { message: (error as Error).message });
            throw error;
        }
    }

    async findByProject(projectId: string, filters: TaskFilter): Promise<Task[]> {
        logger.info('PrismaTaskRepository.findByProject - start');
        try {
            const sortBy = filters.sortBy ?? 'createdAt';
            const order = filters.order ?? 'desc';
            const result = await prisma.task.findMany({
                where: {
                    projectId,
                    ...(filters.status !== undefined ? { status: filters.status } : {}),
                    ...(filters.priority !== undefined ? { priority: filters.priority } : {}),
                },
                orderBy: sortBy === 'priority' ? { priority: order } : { createdAt: order },
            }) as unknown as Task[];
            logger.info('PrismaTaskRepository.findByProject - end');
            return result;
        } catch (error) {
            logger.error('PrismaTaskRepository.findByProject - error', { message: (error as Error).message });
            throw error;
        }
    }
}
