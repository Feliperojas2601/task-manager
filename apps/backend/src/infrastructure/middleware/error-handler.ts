import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../domain/errors/http.error';

export function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error' });
}
