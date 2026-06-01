import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

router.post('/projects', (req, res, next) => projectController.create(req, res, next));

export { router as projectRouter };
