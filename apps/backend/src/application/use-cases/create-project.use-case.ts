import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../repositories/project.repository';
import { CreateProjectInput } from '../validators/project.validator';

export class CreateProjectUseCase {
    constructor(private readonly projectRepository: IProjectRepository) {}

    async execute(input: CreateProjectInput): Promise<Project> {
        return this.projectRepository.create({
            name: input.name,
            description: input.description ?? null,
        });
    }
}
