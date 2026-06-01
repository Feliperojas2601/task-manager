import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../../src/infrastructure/logging/pino-logger', () => ({
    createLogger: jest.fn().mockReturnValue({ info: jest.fn(), error: jest.fn() }),
}));

import request from 'supertest';
import { app } from '../../../src/infrastructure/app';

describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'ok' });
    });
});
