export const TaskStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const Priority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
} as const;

export type Priority = typeof Priority[keyof typeof Priority];
