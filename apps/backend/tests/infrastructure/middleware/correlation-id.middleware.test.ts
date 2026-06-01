import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

const mockWithId = jest.fn((id: unknown, callback: () => void) => callback());
const mockGetId = jest.fn().mockReturnValue('generated-uuid');

jest.mock('correlation-id', () => ({
    withId: mockWithId,
    getId: mockGetId,
}));

import { correlationIdMiddleware } from '../../../src/infrastructure/middleware/correlation-id.middleware';

const makeReq = (headers: Record<string, string> = {}): Request =>
    ({ headers } as unknown as Request);

const makeRes = () => ({ setHeader: jest.fn() } as unknown as Response);

describe('correlationIdMiddleware', () => {
    const next = jest.fn() as unknown as NextFunction;

    beforeEach(() => {
        mockWithId.mockReset();
        mockWithId.mockImplementation((...args: unknown[]) => {
            const callback = typeof args[0] === 'function' ? args[0] as () => void : args[1] as () => void;
            callback();
        });
        mockGetId.mockReset();
        mockGetId.mockReturnValue('generated-uuid');
        (next as jest.Mock).mockReset();
    });

    it('calls withId with the x-request-id header value when present', () => {
        const req = makeReq({ 'x-request-id': 'my-trace-id' });
        const res = makeRes();

        correlationIdMiddleware(req, res, next);

        expect(mockWithId).toHaveBeenCalledWith('my-trace-id', expect.any(Function));
    });

    it('calls withId with only the callback when x-request-id header is absent', () => {
        const req = makeReq();
        const res = makeRes();

        correlationIdMiddleware(req, res, next);

        expect(mockWithId).toHaveBeenCalledWith(expect.any(Function));
    });

    it('sets X-Request-Id response header to the value from getId()', () => {
        const req = makeReq();
        const res = makeRes();

        correlationIdMiddleware(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', 'generated-uuid');
    });

    it('calls next()', () => {
        correlationIdMiddleware(makeReq(), makeRes(), next);
        expect(next).toHaveBeenCalled();
    });
});
