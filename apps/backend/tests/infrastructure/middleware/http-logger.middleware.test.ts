import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EventEmitter } from 'events';
import { Request, Response, NextFunction } from 'express';

const mockLogger = { info: jest.fn(), error: jest.fn() };

jest.mock('../../../src/infrastructure/logging/pino-logger', () => ({
    createLogger: jest.fn().mockReturnValue(mockLogger),
}));

import { httpLoggerMiddleware } from '../../../src/infrastructure/middleware/http-logger.middleware';

const makeReq = (method = 'GET', url = '/projects'): Request =>
    ({ method, url } as unknown as Request);

const makeRes = (statusCode = 200): Response => {
    const emitter = new EventEmitter();
    return Object.assign(emitter, { statusCode }) as unknown as Response;
};

describe('httpLoggerMiddleware', () => {
    const next = jest.fn() as unknown as NextFunction;

    beforeEach(() => {
        mockLogger.info.mockReset();
        (next as jest.Mock).mockReset();
    });

    it('logs Request received with method and url', () => {
        const req = makeReq('POST', '/projects');
        const res = makeRes();

        httpLoggerMiddleware(req, res, next);

        expect(mockLogger.info).toHaveBeenCalledWith('Request received', { method: 'POST', url: '/projects' });
    });

    it('calls next()', () => {
        httpLoggerMiddleware(makeReq(), makeRes(), next);
        expect(next).toHaveBeenCalled();
    });

    it('logs Response sent with statusCode and durationMs on finish event', () => {
        const req = makeReq('GET', '/health');
        const res = makeRes(200);

        httpLoggerMiddleware(req, res, next);
        res.emit('finish');

        expect(mockLogger.info).toHaveBeenCalledWith('Response sent', expect.objectContaining({
            method: 'GET',
            url: '/health',
            statusCode: 200,
            durationMs: expect.any(Number),
        }));
    });
});
