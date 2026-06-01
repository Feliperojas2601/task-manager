import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const projectController = new ProjectController();

router.get('/projects', (req, res, next) => projectController.list(req, res, next));
router.get('/projects/:id', (req, res, next) => projectController.getById(req, res, next));
router.delete('/projects/:id', (req, res, next) => projectController.remove(req, res, next));
router.post('/projects', (req, res, next) => projectController.create(req, res, next));

export { router as projectRouter };
