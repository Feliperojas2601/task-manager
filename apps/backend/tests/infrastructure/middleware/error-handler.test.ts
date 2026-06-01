import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockLogger = { info: jest.fn(), error: jest.fn() };
jest.mock('../../../src/infrastructure/logging/pino-logger', () => ({
    createLogger: jest.fn().mockReturnValue(mockLogger),
}));

import { Request, Response, NextFunction } from 'express';
import { globalErrorHandler } from '../../../src/infrastructure/middleware/error-handler';
import { HttpError } from '../../../src/domain/errors/http.error';
import { ValidationError } from '../../../src/domain/errors/validation.error';

const makeMockRes = () => {
    const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (res.status as jest.Mock).mockReturnValue(res);
    return res;
};

describe('globalErrorHandler', () => {
    beforeEach(() => {
        mockLogger.error.mockReset();
    });

    it('logs error and returns status and message for HttpError', () => {
        const err = new ValidationError('name is required');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(mockLogger.error).toHaveBeenCalledWith(
            'globalErrorHandler.handle - error',
            expect.objectContaining({ statusCode: 400, message: 'name is required' }),
        );
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ status: 400, message: 'name is required' });
    });

    it('logs error with correct status for any HttpError subclass', () => {
        const err = new HttpError(422, 'unprocessable');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(mockLogger.error).toHaveBeenCalledWith(
            'globalErrorHandler.handle - error',
            expect.objectContaining({ statusCode: 422, message: 'unprocessable' }),
        );
        expect(res.status).toHaveBeenCalledWith(422);
    });

    it('logs error with message and stack and returns 500 for unexpected errors', () => {
        const err = new Error('boom');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(mockLogger.error).toHaveBeenCalledWith(
            'globalErrorHandler.handle - error',
            expect.objectContaining({ message: 'boom' }),
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ status: 500, message: 'Internal server error' });
    });
});
