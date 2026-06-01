import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();
const taskController = new TaskController();

router.post('/projects/:projectId/tasks', (req, res, next) => taskController.create(req, res, next));
router.patch('/tasks/:id', (req, res, next) => taskController.update(req, res, next));
router.delete('/tasks/:id', (req, res, next) => taskController.remove(req, res, next));

export { router as taskRouter };
