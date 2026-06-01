import { prisma } from '../database/prisma';
import { Project } from '../../domain/entities/project.entity';
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
}
