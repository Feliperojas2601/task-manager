import { TaskStatus, Priority } from '../entities/enums';

export interface TaskFilter {
    status?: TaskStatus;
    priority?: Priority;
    sortBy?: 'createdAt' | 'priority';
    order?: 'asc' | 'desc';
}
