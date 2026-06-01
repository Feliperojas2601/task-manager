import { Request, Response } from 'express';
import { ResponseHandler } from '../http/response-handler';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('controller');

export class HealthController {
    health(_req: Request, res: Response): void {
        logger.info('HealthController.health - start');
        ResponseHandler.ok(res, { message: 'ok' });
        logger.info('HealthController.health - end');
    }
}
