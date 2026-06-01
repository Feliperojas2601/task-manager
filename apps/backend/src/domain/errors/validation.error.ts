import { HttpError } from './http.error';

export class ValidationError extends HttpError {
    constructor(message: string) {
        super(400, message);
        this.name = 'ValidationError';
    }
}
