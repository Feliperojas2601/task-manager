import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { globalErrorHandler } from './error-handler';
import { HttpError } from '../../domain/errors/http.error';
import { ValidationError } from '../../domain/errors/validation.error';

const makeMockRes = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    } as unknown as Response;
    (res.status as jest.Mock).mockReturnValue(res);
    return res;
};

describe('globalErrorHandler', () => {
    it('returns status and message from HttpError', () => {
        const err = new ValidationError('name is required');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ status: 400, message: 'name is required' });
    });

    it('handles any HttpError subclass with its status code', () => {
        const err = new HttpError(422, 'unprocessable');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({ status: 422, message: 'unprocessable' });
    });

    it('returns 500 for unexpected errors', () => {
        const err = new Error('boom');
        const res = makeMockRes();

        globalErrorHandler(err, {} as Request, res, jest.fn() as unknown as NextFunction);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ status: 500, message: 'Internal server error' });
    });
});
