import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logging/pino-logger';

const logger = createLogger('http');

export function httpLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    logger.info('Request received', { method: req.method, url: req.url });
    res.on('finish', () => {
        logger.info('Response sent', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
        });
    });
    next();
}
