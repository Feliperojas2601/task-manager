import { Request, Response, NextFunction } from 'express';
import { TaskValidator } from '../../application/validators/task.validator';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { ResponseHandler } from '../http/response-handler';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('controller');

export class TaskController {
    private readonly validator: TaskValidator;
    private readonly createTaskUseCase: CreateTaskUseCase;
    private readonly updateTaskUseCase: UpdateTaskUseCase;
    private readonly deleteTaskUseCase: DeleteTaskUseCase;
    private readonly listTasksUseCase: ListTasksUseCase;

    constructor() {
        this.validator = new TaskValidator();
        const projectRepository = new PrismaProjectRepository();
        const taskRepository = new PrismaTaskRepository();
        const useCaseLogger = createLogger('use-case');
        this.createTaskUseCase = new CreateTaskUseCase(projectRepository, taskRepository, useCaseLogger);
        this.updateTaskUseCase = new UpdateTaskUseCase(taskRepository, useCaseLogger);
        this.deleteTaskUseCase = new DeleteTaskUseCase(taskRepository, useCaseLogger);
        this.listTasksUseCase = new ListTasksUseCase(projectRepository, taskRepository, useCaseLogger);
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('TaskController.create - start');
        try {
            const projectId = this.validator.validateProjectId(req.params.projectId);
            const input = this.validator.validateCreate(projectId, req.body);
            const task = await this.createTaskUseCase.execute(input);
            ResponseHandler.created(res, task);
            logger.info('TaskController.create - end');
        } catch (error) {
            logger.error('TaskController.create - error', { message: (error as Error).message });
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('TaskController.update - start');
        try {
            const id = this.validator.validateTaskId(req.params.id);
            const data = this.validator.validateUpdate(req.body);
            const task = await this.updateTaskUseCase.execute(id, data);
            ResponseHandler.ok(res, task);
            logger.info('TaskController.update - end');
        } catch (error) {
            logger.error('TaskController.update - error', { message: (error as Error).message });
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('TaskController.list - start');
        try {
            const projectId = this.validator.validateProjectId(req.params.projectId);
            const filters = this.validator.validateListQuery(req.query as Record<string, unknown>);
            const tasks = await this.listTasksUseCase.execute({ projectId, filters });
            ResponseHandler.ok(res, tasks);
            logger.info('TaskController.list - end');
        } catch (error) {
            logger.error('TaskController.list - error', { message: (error as Error).message });
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        logger.info('TaskController.remove - start');
        try {
            const id = this.validator.validateTaskId(req.params.id);
            await this.deleteTaskUseCase.execute(id);
            ResponseHandler.noContent(res);
            logger.info('TaskController.remove - end');
        } catch (error) {
            logger.error('TaskController.remove - error', { message: (error as Error).message });
            next(error);
        }
    }
}
