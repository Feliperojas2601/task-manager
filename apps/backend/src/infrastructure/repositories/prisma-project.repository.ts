import { prisma } from '../database/prisma';
import { Project, ProjectSummary, ProjectDetail } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../application/repositories/project.repository';

export class PrismaProjectRepository implements IProjectRepository {
    async create(data: { name: string; description: string | null }): Promise<Project> {
        return prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
            },
        });
    }

    async findAll(): Promise<ProjectSummary[]> {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { tasks: true } } },
        });
        return projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            taskCount: p._count.tasks,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
    }

    async delete(id: string): Promise<void> {
        await prisma.project.delete({ where: { id } });
    }

    async findById(id: string): Promise<ProjectDetail | null> {
        const project = await prisma.project.findUnique({
            where: { id },
            include: { tasks: true },
        });
        if (!project) return null;
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
    }
}
