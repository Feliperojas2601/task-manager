import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../domain/errors/http.error';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('error-handler');

export function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof HttpError) {
        logger.error('globalErrorHandler.handle - error', { statusCode: err.statusCode, message: err.message });
        res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
        return;
    }
    logger.error('globalErrorHandler.handle - error', { message: err.message, stack: err.stack });
    res.status(500).json({ status: 500, message: 'Internal server error' });
}
