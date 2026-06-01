import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();
const taskController = new TaskController();

router.post('/projects/:projectId/tasks', (req, res, next) => taskController.create(req, res, next));

export { router as taskRouter };
