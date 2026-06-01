import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { projectsApi } from '../api/projects';
import { CreateProjectModal } from '../components/CreateProjectModal';
import type { ProjectSummary } from '../types';

export function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const data = await projectsApi.list();
            setProjects(data);
            setError(null);
        } catch {
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchProjects(); }, [fetchProjects]);

    const handleCreate = async (name: string, description: string) => {
        await projectsApi.create({ name, description: description || undefined });
        await fetchProjects();
    };

    if (loading) return <div style={s.center}>Loading…</div>;
    if (error) return <div style={s.center}>{error}</div>;

    return (
        <div style={s.page}>
            <div style={s.header}>
                <h1 style={s.title}>Projects</h1>
                <button style={s.createBtn} onClick={() => setShowModal(true)}>
                    + New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div style={s.emptyState}>
                    <p style={s.emptyText}>No projects yet.</p>
                    <p style={s.emptyHint}>Create your first project to get started.</p>
                </div>
            ) : (
                <div style={s.grid}>
                    {projects.map(project => (
                        <div
                            key={project.id}
                            style={s.card}
                            onClick={() => navigate(`/projects/${project.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
                        >
                            <h2 style={s.cardTitle}>{project.name}</h2>
                            {project.description && (
                                <p style={s.cardDesc}>{project.description}</p>
                            )}
                            <div style={s.cardMeta}>
                                <span style={s.taskCount}>{project.taskCount} tasks</span>
                                <span style={s.date}>
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleCreate}
                />
            )}
        </div>
    );
}

const s: Record<string, CSSProperties> = {
    page: { maxWidth: 960, margin: '0 auto', padding: '32px 24px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#111' },
    createBtn: {
        padding: '10px 20px', border: 'none', borderRadius: 6, background: '#2563eb',
        color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
    },
    center: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '60vh', fontSize: 16, color: '#6b7280',
    },
    emptyState: { textAlign: 'center', padding: '80px 0' },
    emptyText: { fontSize: 20, color: '#374151', margin: '0 0 8px' },
    emptyHint: { fontSize: 14, color: '#9ca3af', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
    card: {
        border: '1px solid #e5e7eb', borderRadius: 8, padding: 20,
        cursor: 'pointer', background: '#fff', outline: 'none',
    },
    cardTitle: { margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#111' },
    cardDesc: {
        margin: '0 0 12px', fontSize: 14, color: '#6b7280',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    taskCount: { fontSize: 12, color: '#2563eb', fontWeight: 500 },
    date: { fontSize: 12, color: '#9ca3af' },
};
