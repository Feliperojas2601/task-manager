import express from 'express';
import { router } from './router';
import { globalErrorHandler } from './middleware/error-handler';
import { correlationIdMiddleware } from './middleware/correlation-id.middleware';
import { httpLoggerMiddleware } from './middleware/http-logger.middleware';

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);
app.use(httpLoggerMiddleware);
app.use(router);
app.use(globalErrorHandler);

export { app };
