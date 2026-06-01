import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { TaskFormModal } from '../components/TaskFormModal';
import type { ProjectDetail, Task, TaskStatus, Priority, TaskFilter, TaskFormData } from '../types';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
    PENDING: {
        label: 'Pending',
        color: 'var(--pending)',
        bg: 'var(--pending-dim)',
        border: 'var(--pending)',
    },
    IN_PROGRESS: {
        label: 'In Progress',
        color: 'var(--info)',
        bg: 'var(--info-dim)',
        border: 'var(--info)',
    },
    DONE: {
        label: 'Done',
        color: 'var(--success)',
        bg: 'var(--success-dim)',
        border: 'var(--success)',
    },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
    LOW: {
        label: 'Low',
        color: 'var(--text-secondary)',
        bg: 'var(--bg-elevated)',
    },
    MEDIUM: {
        label: 'Medium',
        color: 'var(--accent)',
        bg: 'var(--accent-dim)',
    },
    HIGH: {
        label: 'High',
        color: 'var(--danger)',
        bg: 'var(--danger-dim)',
    },
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
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-7 h-7 rounded-full border-2 anim-spin"
                        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
                    />
                    <span
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                        loading…
                    </span>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="mb-5" style={{ color: 'var(--danger)' }}>{error ?? 'Project not found'}</p>
                    <button
                        className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:brightness-125"
                        style={{
                            border: '1px solid var(--border-strong)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-secondary)',
                        }}
                        onClick={() => navigate('/')}
                    >
                        ← Back to projects
                    </button>
                </div>
            </div>
        );
    }

    const selectStyle: React.CSSProperties = {
        padding: '6px 28px 6px 12px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-mid)',
        borderRadius: '10px',
        color: 'var(--text-secondary)',
        fontSize: '13px',
        fontFamily: 'Outfit, sans-serif',
        cursor: 'pointer',
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-3xl mx-auto px-8 py-10">

                {/* Back link */}
                <button
                    className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer transition-colors duration-200 bg-transparent border-none p-0"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}
                    onClick={() => navigate('/')}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    All Projects
                </button>

                {/* Project header */}
                <div className="flex justify-between items-start mb-10 gap-6 anim-fade-up">
                    <div className="flex-1 min-w-0">
                        <h1
                            className="leading-tight mb-2"
                            style={{
                                fontFamily: 'Instrument Serif, Georgia, serif',
                                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {project.name}
                        </h1>
                        {project.description && (
                            <p className="mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {project.description}
                            </p>
                        )}
                        <p
                            className="text-xs"
                            style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
                        >
                            Created {new Date(project.createdAt).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric',
                            })}
                        </p>
                    </div>
                    <button
                        className="shrink-0 px-4 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200 disabled:opacity-40"
                        style={{
                            border: '1px solid var(--danger-dim)',
                            background: 'transparent',
                            color: 'var(--danger)',
                            fontFamily: 'Outfit, sans-serif',
                        }}
                        onClick={() => void handleDeleteProject()}
                        disabled={deletingProject}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-dim)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                        {deletingProject ? 'Deleting…' : 'Delete Project'}
                    </button>
                </div>

                {/* Tasks section */}
                <section className="anim-fade-up" style={{ animationDelay: '80ms' }}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <h2
                                className="font-semibold"
                                style={{ color: 'var(--text-primary)', fontSize: '16px' }}
                            >
                                Tasks
                            </h2>
                            <span
                                className="text-xs px-2.5 py-0.5 rounded-lg font-medium"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                {tasks.length}
                            </span>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95"
                            style={{
                                background: 'var(--accent)',
                                color: 'var(--bg-base)',
                                boxShadow: '0 0 20px var(--accent-glow)',
                                fontFamily: 'Outfit, sans-serif',
                            }}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Task
                        </button>
                    </div>

                    {/* Filter toolbar */}
                    <div
                        className="flex flex-wrap gap-2 px-4 py-3 rounded-2xl border mb-5"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                    >
                        <select
                            style={selectStyle}
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as TaskStatus | '')}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                        <select
                            style={selectStyle}
                            value={priorityFilter}
                            onChange={e => setPriorityFilter(e.target.value as Priority | '')}
                        >
                            <option value="">All Priorities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        <select
                            style={selectStyle}
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'createdAt' | 'priority')}
                        >
                            <option value="createdAt">Sort: Created</option>
                            <option value="priority">Sort: Priority</option>
                        </select>
                        <select
                            style={selectStyle}
                            value={order}
                            onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="desc">Desc</option>
                            <option value="asc">Asc</option>
                        </select>
                    </div>

                    {/* Task list */}
                    {tasksLoading ? (
                        <p
                            className="text-sm py-4"
                            style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                        >
                            loading tasks…
                        </p>
                    ) : tasks.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center py-16 rounded-2xl border"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                        >
                            <svg
                                width="32" height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--text-muted)"
                                strokeWidth="1.5"
                                className="mb-3"
                            >
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {statusFilter || priorityFilter
                                    ? 'No tasks match the current filters'
                                    : 'No tasks yet — add one to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 stagger">
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
            </div>

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
    const sc = statusConfig[task.status];
    const pc = priorityConfig[task.priority];

    return (
        <div
            className="anim-slide-up group flex justify-between items-center px-4 py-3.5 rounded-xl border gap-4 transition-all duration-200"
            style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                borderLeft: `3px solid ${sc.border}`,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-mid)')}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--border)';
                el.style.borderLeftColor = sc.border;
            }}
        >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span
                    className="font-medium text-sm leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {task.title}
                </span>
                {task.description && (
                    <span
                        className="text-xs truncate"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {task.description}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* Status badge */}
                <span
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: sc.bg, color: sc.color }}
                >
                    {sc.label}
                </span>

                {/* Priority badge */}
                <span
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: pc.bg, color: pc.color }}
                >
                    {pc.label}
                </span>

                {/* Edit button */}
                <button
                    className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)' }}
                    onClick={onEdit}
                    title="Edit task"
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)')}
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>

                {/* Delete button */}
                <button
                    className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                    style={{ background: 'var(--danger-dim)', border: '1px solid transparent' }}
                    onClick={onDelete}
                    title="Delete task"
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent')}
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
