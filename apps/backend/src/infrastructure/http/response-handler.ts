import { Response } from 'express';

export class ResponseHandler {
    static ok<T>(res: Response, data: T): void {
        res.status(200).json(data);
    }

    static created<T>(res: Response, data: T): void {
        res.status(201).json(data);
    }
}
