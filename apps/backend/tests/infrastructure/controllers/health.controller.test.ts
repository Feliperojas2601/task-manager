import request from 'supertest';
import { app } from '../../../src/infrastructure/app';
import { describe, it, expect } from '@jest/globals';

describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'ok' });
    });
});
