import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { TaskFormModal } from '../components/TaskFormModal';
import type { ProjectDetail, Task, TaskStatus, Priority, TaskFilter, TaskFormData } from '../types';

const statusClasses: Record<TaskStatus, string> = {
    PENDING:     'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE:        'bg-green-100 text-green-700',
};

const statusLabels: Record<TaskStatus, string> = {
    PENDING:     'Pending',
    IN_PROGRESS: 'In Progress',
    DONE:        'Done',
};

const priorityClasses: Record<Priority, string> = {
    LOW:    'bg-gray-100 text-gray-500',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH:   'bg-red-100 text-red-700',
};

const priorityLabels: Record<Priority, string> = {
    LOW:    'Low',
    MEDIUM: 'Medium',
    HIGH:   'High',
};

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectLoading, setProjectLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tasksKey, setTasksKey] = useState(0);

    const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'priority'>('createdAt');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingProject, setDeletingProject] = useState(false);

    const refetchTasks = () => setTasksKey(k => k + 1);

    useEffect(() => {
        if (!id) { setError('Invalid project ID'); setProjectLoading(false); return; }
        const projectId = id;
        projectsApi.getById(projectId)
            .then(setProject)
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Project not found'))
            .finally(() => setProjectLoading(false));
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const projectId = id;
        setTasksLoading(true);
        const filters: TaskFilter = {
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(priorityFilter ? { priority: priorityFilter } : {}),
            sortBy,
            order,
        };
        tasksApi.list(projectId, filters)
            .then(setTasks)
            .catch(() => {})
            .finally(() => setTasksLoading(false));
    }, [id, statusFilter, priorityFilter, sortBy, order, tasksKey]);

    const handleCreateTask = async (data: TaskFormData) => {
        if (!id) return;
        await tasksApi.create(id, {
            title: data.title,
            description: data.description.trim() || undefined,
            status: data.status,
            priority: data.priority,
        });
        refetchTasks();
    };

    const handleUpdateTask = async (data: TaskFormData) => {
        if (!editingTask) return;
        await tasksApi.update(editingTask.id, {
            title: data.title,
            description: data.description.trim() || null,
            status: data.status,
            priority: data.priority,
        });
        refetchTasks();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Delete this task?')) return;
        await tasksApi.delete(taskId);
        refetchTasks();
    };

    const handleDeleteProject = async () => {
        if (!id || !window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
        setDeletingProject(true);
        try {
            await projectsApi.delete(id);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
            setDeletingProject(false);
        }
    };

    if (projectLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Loading…
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error ?? 'Project not found'}</p>
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        onClick={() => navigate('/')}
                    >
                        ← Back to projects
                    </button>
                </div>
            </div>
        );
    }

    const selectClass = 'px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <button
                className="text-blue-600 text-sm mb-6 hover:underline bg-transparent border-none cursor-pointer p-0"
                onClick={() => navigate('/')}
            >
                ← Projects
            </button>

            <div className="flex justify-between items-start mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-500 mb-1">{project.description}</p>
                    )}
                    <p className="text-sm text-gray-400">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button
                    className="shrink-0 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => void handleDeleteProject()}
                    disabled={deletingProject}
                >
                    {deletingProject ? 'Deleting…' : 'Delete Project'}
                </button>
            </div>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Tasks
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                            {tasks.length}
                        </span>
                    </h2>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Add Task
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                    <select
                        className={selectClass}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as TaskStatus | '')}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                    <select
                        className={selectClass}
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value as Priority | '')}
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                    <select
                        className={selectClass}
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as 'createdAt' | 'priority')}
                    >
                        <option value="createdAt">Sort: Created</option>
                        <option value="priority">Sort: Priority</option>
                    </select>
                    <select
                        className={selectClass}
                        value={order}
                        onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
                    >
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                    </select>
                </div>

                {tasksLoading ? (
                    <p className="text-sm text-gray-400">Loading tasks…</p>
                ) : tasks.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        {statusFilter || priorityFilter
                            ? 'No tasks match the current filters.'
                            : 'No tasks yet. Add one to get started.'}
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {tasks.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                onEdit={() => setEditingTask(task)}
                                onDelete={() => void handleDeleteTask(task.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {showCreateModal && (
                <TaskFormModal
                    mode="create"
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateTask}
                />
            )}

            {editingTask && (
                <TaskFormModal
                    mode="edit"
                    initialValues={{
                        title: editingTask.title,
                        description: editingTask.description ?? '',
                        status: editingTask.status,
                        priority: editingTask.priority,
                    }}
                    onClose={() => setEditingTask(null)}
                    onSubmit={handleUpdateTask}
                />
            )}
        </div>
    );
}

interface TaskRowProps {
    task: Task;
    onEdit: () => void;
    onDelete: () => void;
}

function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
    return (
        <div className="flex justify-between items-center px-4 py-3 border border-gray-200 rounded-xl bg-white gap-3">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                {task.description && (
                    <span className="text-xs text-gray-400 truncate">{task.description}</span>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClasses[task.status]}`}>
                    {statusLabels[task.status]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityClasses[task.priority]}`}>
                    {priorityLabels[task.priority]}
                </span>
                <button
                    className="text-gray-400 hover:text-gray-700 border border-gray-200 rounded px-2 py-0.5 text-sm hover:border-gray-400"
                    onClick={onEdit}
                    title="Edit"
                >
                    ✎
                </button>
                <button
                    className="text-red-400 hover:text-red-600 border border-red-100 rounded px-2 py-0.5 text-sm hover:border-red-300"
                    onClick={onDelete}
                    title="Delete"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
