import { prisma } from '../database/prisma';
import { Project, ProjectSummary } from '../../domain/entities/project.entity';
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
}
