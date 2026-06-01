import { Request, Response, NextFunction } from 'express';
import { TaskValidator } from '../../application/validators/task.validator';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { ResponseHandler } from '../http/response-handler';

export class TaskController {
    private readonly validator: TaskValidator;
    private readonly createTaskUseCase: CreateTaskUseCase;

    constructor() {
        this.validator = new TaskValidator();
        const projectRepository = new PrismaProjectRepository();
        const taskRepository = new PrismaTaskRepository();
        this.createTaskUseCase = new CreateTaskUseCase(projectRepository, taskRepository);
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
}
