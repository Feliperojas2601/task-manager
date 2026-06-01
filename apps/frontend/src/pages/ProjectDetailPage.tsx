import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { projectsApi } from '../api/projects';
import type { ProjectDetail, Task } from '../types';

export function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Invalid project ID');
            setLoading(false);
            return;
        }
        projectsApi.getById(id)
            .then(setProject)
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Project not found');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!id || !window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await projectsApi.delete(id);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project');
            setDeleting(false);
        }
    };

    if (loading) return <div style={s.center}>Loading…</div>;

    if (error || !project) {
        return (
            <div style={s.center}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#dc2626', marginBottom: 16 }}>{error ?? 'Project not found'}</p>
                    <button style={s.backBtn} onClick={() => navigate('/')}>← Back to projects</button>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <button style={s.backLink} onClick={() => navigate('/')}>← Projects</button>

            <div style={s.header}>
                <div>
                    <h1 style={s.title}>{project.name}</h1>
                    {project.description && <p style={s.description}>{project.description}</p>}
                    <p style={s.meta}>Created {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <button style={s.deleteBtn} onClick={() => void handleDelete()} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete Project'}
                </button>
            </div>

            <section>
                <h2 style={s.sectionTitle}>
                    Tasks{' '}
                    <span style={s.taskCountBadge}>{project.tasks.length}</span>
                </h2>
                {project.tasks.length === 0 ? (
                    <p style={s.noTasks}>No tasks in this project yet.</p>
                ) : (
                    <div style={s.taskList}>
                        {project.tasks.map(task => (
                            <TaskRow key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function TaskRow({ task }: { task: Task }) {
    return (
        <div style={s.taskRow}>
            <div style={s.taskInfo}>
                <span style={s.taskTitle}>{task.title}</span>
                {task.description && (
                    <span style={s.taskDesc}>{task.description}</span>
                )}
            </div>
            <div style={s.taskBadges}>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Task['status'] }) {
    const map: Record<Task['status'], { label: string; bg: string; color: string }> = {
        PENDING:     { label: 'Pending',     bg: '#f3f4f6', color: '#374151' },
        IN_PROGRESS: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8' },
        DONE:        { label: 'Done',        bg: '#d1fae5', color: '#065f46' },
    };
    const { label, bg, color } = map[status];
    return <span style={{ ...s.badge, background: bg, color }}>{label}</span>;
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
    const map: Record<Task['priority'], { label: string; bg: string; color: string }> = {
        LOW:    { label: 'Low',    bg: '#f9fafb', color: '#6b7280' },
        MEDIUM: { label: 'Medium', bg: '#fef3c7', color: '#92400e' },
        HIGH:   { label: 'High',   bg: '#fee2e2', color: '#991b1b' },
    };
    const { label, bg, color } = map[priority];
    return <span style={{ ...s.badge, background: bg, color }}>{label}</span>;
}

const s: Record<string, CSSProperties> = {
    page: { maxWidth: 800, margin: '0 auto', padding: '32px 24px' },
    center: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '60vh', fontSize: 16, color: '#6b7280',
    },
    backLink: {
        background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
        fontSize: 14, padding: 0, marginBottom: 24, display: 'block', fontFamily: 'inherit',
    },
    backBtn: {
        padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6,
        cursor: 'pointer', background: '#fff', fontFamily: 'inherit',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 40, gap: 16,
    },
    title: { margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#111' },
    description: { margin: '0 0 8px', fontSize: 15, color: '#6b7280' },
    meta: { margin: 0, fontSize: 13, color: '#9ca3af' },
    deleteBtn: {
        padding: '8px 16px', border: '1px solid #fca5a5', borderRadius: 6,
        background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 14,
        flexShrink: 0, fontFamily: 'inherit',
    },
    sectionTitle: {
        fontSize: 18, fontWeight: 600, color: '#111',
        margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
    },
    taskCountBadge: {
        background: '#f3f4f6', color: '#374151', fontSize: 13,
        padding: '2px 8px', borderRadius: 999, fontWeight: 500,
    },
    noTasks: { color: '#9ca3af', fontSize: 14, margin: 0 },
    taskList: { display: 'flex', flexDirection: 'column', gap: 8 },
    taskRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff',
    },
    taskInfo: {
        display: 'flex', flexDirection: 'column', gap: 2,
        flex: 1, marginRight: 16, overflow: 'hidden',
    },
    taskTitle: { fontSize: 14, fontWeight: 500, color: '#111' },
    taskDesc: {
        fontSize: 13, color: '#9ca3af',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    taskBadges: { display: 'flex', gap: 6, flexShrink: 0 },
    badge: { fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 500 },
};
