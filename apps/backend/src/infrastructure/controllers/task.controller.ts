import { Request, Response, NextFunction } from 'express';
import { TaskValidator } from '../../application/validators/task.validator';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { ResponseHandler } from '../http/response-handler';

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
        this.createTaskUseCase = new CreateTaskUseCase(projectRepository, taskRepository);
        this.updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
        this.deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
        this.listTasksUseCase = new ListTasksUseCase(projectRepository, taskRepository);
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projectId = this.validator.validateProjectId(req.params.projectId);
            const input = this.validator.validateCreate(projectId, req.body);
            const task = await this.createTaskUseCase.execute(input);
            ResponseHandler.created(res, task);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = this.validator.validateTaskId(req.params.id);
            const data = this.validator.validateUpdate(req.body);
            const task = await this.updateTaskUseCase.execute(id, data);
            ResponseHandler.ok(res, task);
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const projectId = this.validator.validateProjectId(req.params.projectId);
            const filters = this.validator.validateListQuery(req.query as Record<string, unknown>);
            const tasks = await this.listTasksUseCase.execute({ projectId, filters });
            ResponseHandler.ok(res, tasks);
        } catch (error) {
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = this.validator.validateTaskId(req.params.id);
            await this.deleteTaskUseCase.execute(id);
            ResponseHandler.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}
