/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/infrastructure/server.ts',
        '!src/infrastructure/database/prisma.ts',
    ],
    coverageThreshold: {
        global: {
            lines: 100,
        },
    },
};

module.exports = config;
