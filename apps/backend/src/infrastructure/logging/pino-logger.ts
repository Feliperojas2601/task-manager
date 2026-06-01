import pino from 'pino';
import { getId } from 'correlation-id';
import { ILogger } from '../../application/logger/logger.interface';

export function createLogger(layer: string): ILogger {
    const pinoLogger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
    return {
        info: (message, context = {}) =>
            pinoLogger.info({ correlationId: getId(), layer, ...context }, message),
        error: (message, context = {}) =>
            pinoLogger.error({ correlationId: getId(), layer, ...context }, message),
    };
}
