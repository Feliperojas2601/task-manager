import { Router } from 'express';
import { HealthController } from './controllers/health.controller';

const router = Router();
const healthControllerInstance = new HealthController();

router.get('/health', (req, res) => healthControllerInstance.health(req, res));

export { router };
