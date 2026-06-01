import { Request, Response, NextFunction } from 'express';
import { ProjectValidator } from '../../application/validators/project.validator';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { ResponseHandler } from '../http/response-handler';

export class ProjectController {
    private readonly validator: ProjectValidator;
    private readonly createProjectUseCase: CreateProjectUseCase;

    constructor() {
        this.validator = new ProjectValidator();
        const repository = new PrismaProjectRepository();
        this.createProjectUseCase = new CreateProjectUseCase(repository);
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = this.validator.validateCreate(req.body);
            const project = await this.createProjectUseCase.execute(input);
            ResponseHandler.created(res, project);
        } catch (error) {
            next(error);
        }
    }
}
