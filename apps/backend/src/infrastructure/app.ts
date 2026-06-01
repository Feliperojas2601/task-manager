import express from 'express';
import { router } from './router';
import { globalErrorHandler } from './middleware/error-handler';

const app = express();

app.use(express.json());
app.use(router);
app.use(globalErrorHandler);

export { app };
