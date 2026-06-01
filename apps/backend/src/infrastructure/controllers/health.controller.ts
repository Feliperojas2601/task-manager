import { Request, Response } from 'express';
import { ResponseHandler } from '../http/response-handler';

export class HealthController {
    health(_req: Request, res: Response): void {
        ResponseHandler.ok(res, { message: 'ok' });
    }
}
