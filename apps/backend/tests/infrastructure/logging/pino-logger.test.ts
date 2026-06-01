import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockPinoInstance = { info: jest.fn(), error: jest.fn() };

jest.mock('pino', () => jest.fn(() => mockPinoInstance));
jest.mock('correlation-id', () => ({ getId: jest.fn().mockReturnValue('corr-123') }));

import { createLogger } from '../../../src/infrastructure/logging/pino-logger';

describe('createLogger', () => {
    beforeEach(() => {
        mockPinoInstance.info.mockReset();
        mockPinoInstance.error.mockReset();
    });

    it('info calls pinoLogger.info with correlationId, layer, and context', () => {
        const logger = createLogger('controller');
        logger.info('test message', { foo: 'bar' });
        expect(mockPinoInstance.info).toHaveBeenCalledWith(
            { correlationId: 'corr-123', layer: 'controller', foo: 'bar' },
            'test message',
        );
    });

    it('error calls pinoLogger.error with correlationId and layer', () => {
        const logger = createLogger('error-handler');
        logger.error('boom', { stack: 'Error...' });
        expect(mockPinoInstance.error).toHaveBeenCalledWith(
            { correlationId: 'corr-123', layer: 'error-handler', stack: 'Error...' },
            'boom',
        );
    });

    it('omits context fields when not provided', () => {
        const logger = createLogger('repository');
        logger.info('no context');
        expect(mockPinoInstance.info).toHaveBeenCalledWith(
            { correlationId: 'corr-123', layer: 'repository' },
            'no context',
        );
    });
});
