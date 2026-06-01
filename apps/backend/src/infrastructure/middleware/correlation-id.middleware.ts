import { Request, Response, NextFunction } from 'express';
import { withId, getId } from 'correlation-id';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const incomingId = req.headers['x-request-id'] as string | undefined;
    const run = (cb: () => void) => incomingId ? withId(incomingId, cb) : withId(cb);
    run(() => {
        res.setHeader('X-Request-Id', getId()!);
        next();
    });
}
