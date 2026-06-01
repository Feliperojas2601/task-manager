import { Request, Response, NextFunction } from 'express';
import { ProjectValidator } from '../../application/validators/project.validator';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { GetProjectDetailUseCase } from '../../application/use-cases/get-project-detail.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { ResponseHandler } from '../http/response-handler';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('controller');

export class ProjectController {
    private readonly validator: ProjectValidator;
    private readonly createProjectUseCase: CreateProjectUseCase;
    private readonly listProjectsUseCase: ListProjectsUseCase;
    private readonly getProjectDetailUseCase: GetProjectDetailUseCase;
    private readonly deleteProjectUseCase: DeleteProjectUseCase;

    constructor() {
        this.validator = new ProjectValidator();
        const repository = new PrismaProjectRepository();
        const useCaseLogger = createLogger('use-case');
        this.createProjectUseCase = new CreateProjectUseCase(repository, useCaseLogger);
        this.listProjectsUseCase = new ListProjectsUseCase(repository, useCaseLogger);
        this.getProjectDetailUseCase = new GetProjectDetailUseCase(repository, useCaseLogger);
        this.deleteProjectUseCase = new DeleteProjectUseCase(repository, useCaseLogger);
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('ProjectController.create - start');
        try {
            const input = this.validator.validateCreate(req.body);
            const project = await this.createProjectUseCase.execute(input);
            ResponseHandler.created(res, project);
            logger.info('ProjectController.create - end');
        } catch (error) {
            logger.error('ProjectController.create - error', { message: (error as Error).message });
            next(error);
        }
    }

    async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('ProjectController.list - start');
        try {
            const projects = await this.listProjectsUseCase.execute();
            ResponseHandler.ok(res, projects);
            logger.info('ProjectController.list - end');
        } catch (error) {
            logger.error('ProjectController.list - error', { message: (error as Error).message });
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('ProjectController.getById - start');
        try {
            const id = this.validator.validateId(req.params.id);
            const project = await this.getProjectDetailUseCase.execute(id);
            ResponseHandler.ok(res, project);
            logger.info('ProjectController.getById - end');
        } catch (error) {
            logger.error('ProjectController.getById - error', { message: (error as Error).message });
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('ProjectController.remove - start');
        try {
            const id = this.validator.validateId(req.params.id);
            await this.deleteProjectUseCase.execute(id);
            ResponseHandler.noContent(res);
            logger.info('ProjectController.remove - end');
        } catch (error) {
            logger.error('ProjectController.remove - error', { message: (error as Error).message });
            next(error);
        }
    }
}
