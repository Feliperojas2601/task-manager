import { Router } from 'express';
import { healthRouter } from './routes/health.route';
import { projectRouter } from './routes/project.route';

const router = Router();

router.use(healthRouter);
router.use(projectRouter);

export { router };
