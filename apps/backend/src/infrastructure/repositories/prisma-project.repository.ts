import { prisma } from '../database/prisma';
import { Project, ProjectSummary, ProjectDetail } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../application/repositories/project.repository';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('repository');

export class PrismaProjectRepository implements IProjectRepository {
    async create(data: { name: string; description: string | null }): Promise<Project> {
        logger.info('PrismaProjectRepository.create - start');
        try {
            const result = await prisma.project.create({ data: { name: data.name, description: data.description } });
            logger.info('PrismaProjectRepository.create - end');
            return result;
        } catch (error) {
            logger.error('PrismaProjectRepository.create - error', { message: (error as Error).message });
            throw error;
        }
    }

    async findAll(): Promise<ProjectSummary[]> {
        logger.info('PrismaProjectRepository.findAll - start');
        try {
            const projects = await prisma.project.findMany({
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { tasks: true } } },
            });
            const result = projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                taskCount: p._count.tasks,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            }));
            logger.info('PrismaProjectRepository.findAll - end');
            return result;
        } catch (error) {
            logger.error('PrismaProjectRepository.findAll - error', { message: (error as Error).message });
            throw error;
        }
    }

    async findById(id: string): Promise<ProjectDetail | null> {
        logger.info('PrismaProjectRepository.findById - start');
        try {
            const project = await prisma.project.findUnique({ where: { id }, include: { tasks: true } });
            if (!project) {
                logger.info('PrismaProjectRepository.findById - end');
                return null;
            }
            logger.info('PrismaProjectRepository.findById - end');
            return {
                id: project.id,
                name: project.name,
                description: project.description,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                tasks: project.tasks.map(t => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    priority: t.priority,
                    projectId: t.projectId,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                })),
            };
        } catch (error) {
            logger.error('PrismaProjectRepository.findById - error', { message: (error as Error).message });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        logger.info('PrismaProjectRepository.delete - start');
        try {
            await prisma.project.delete({ where: { id } });
            logger.info('PrismaProjectRepository.delete - end');
        } catch (error) {
            logger.error('PrismaProjectRepository.delete - error', { message: (error as Error).message });
            throw error;
        }
    }
}
