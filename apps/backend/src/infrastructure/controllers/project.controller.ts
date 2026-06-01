import { Request, Response, NextFunction } from 'express';
import { ProjectValidator } from '../../application/validators/project.validator';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { GetProjectDetailUseCase } from '../../application/use-cases/get-project-detail.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { ResponseHandler } from '../http/response-handler';

export class ProjectController {
    private readonly validator: ProjectValidator;
    private readonly createProjectUseCase: CreateProjectUseCase;
    private readonly listProjectsUseCase: ListProjectsUseCase;
    private readonly getProjectDetailUseCase: GetProjectDetailUseCase;

    constructor() {
        this.validator = new ProjectValidator();
        const repository = new PrismaProjectRepository();
        this.createProjectUseCase = new CreateProjectUseCase(repository);
        this.listProjectsUseCase = new ListProjectsUseCase(repository);
        this.getProjectDetailUseCase = new GetProjectDetailUseCase(repository);
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

    async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projects = await this.listProjectsUseCase.execute();
            ResponseHandler.ok(res, projects);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = this.validator.validateId(req.params.id);
            const project = await this.getProjectDetailUseCase.execute(id);
            ResponseHandler.ok(res, project);
        } catch (error) {
            next(error);
        }
    }
}
