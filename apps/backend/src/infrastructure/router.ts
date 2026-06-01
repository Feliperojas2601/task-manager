import { Router } from 'express';
import { healthRouter } from './routes/health.route';
import { projectRouter } from './routes/project.route';
import { taskRouter } from './routes/task.route';

const router = Router();

router.use(healthRouter);
router.use(projectRouter);
router.use(taskRouter);

export { router };
