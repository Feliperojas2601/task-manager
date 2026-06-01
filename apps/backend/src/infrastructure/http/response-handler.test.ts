import { describe, it, expect, jest } from '@jest/globals';
import { Response } from 'express';
import { ResponseHandler } from './response-handler';

const makeMockRes = () => {
    const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (res.status as jest.Mock).mockReturnValue(res);
    return res;
};

describe('ResponseHandler', () => {
    it('ok sends 200 with data', () => {
        const res = makeMockRes();
        ResponseHandler.ok(res, { message: 'ok' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'ok' });
    });

    it('created sends 201 with data', () => {
        const res = makeMockRes();
        ResponseHandler.created(res, { id: '1', name: 'Project' });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: '1', name: 'Project' });
    });
});
