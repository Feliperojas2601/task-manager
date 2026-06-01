import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-7 h-7 rounded-full border-2 anim-spin"
                        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        loading…
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
        );
    }

    const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);

    return (
        <div className="min-h-screen">
            {/* Hero header */}
            <header
                className="relative border-b overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: [
                            'radial-gradient(ellipse 70% 90% at 15% -20%, rgba(240,180,41,0.09) 0%, transparent 65%)',
                            'radial-gradient(ellipse 50% 70% at 85% 120%, rgba(96,165,250,0.07) 0%, transparent 65%)',
                        ].join(', '),
                    }}
                />
                <div className="max-w-5xl mx-auto px-8 py-12 relative">
                    <div className="flex items-end justify-between gap-6">
                        <div className="anim-fade-up">
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}
                                />
                                <span
                                    className="text-xs uppercase tracking-widest"
                                    style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}
                                >
                                    Workspace
                                </span>
                            </div>
                            <h1
                                className="leading-none"
                                style={{
                                    fontFamily: 'Instrument Serif, Georgia, serif',
                                    fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                                    color: 'var(--text-primary)',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Task Manager
                            </h1>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {projects.length === 0
                                    ? 'Start building your first project'
                                    : `${projects.length} project${projects.length !== 1 ? 's' : ''} · ${totalTasks} task${totalTasks !== 1 ? 's' : ''} total`}
                            </p>
                        </div>

                        <button
                            className="anim-fade-up shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95"
                            style={{
                                animationDelay: '80ms',
                                background: 'var(--accent)',
                                color: 'var(--bg-base)',
                                boxShadow: '0 0 24px var(--accent-glow)',
                                fontFamily: 'Outfit, sans-serif',
                            }}
                            onClick={() => setShowModal(true)}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Project
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-10">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 anim-fade-up">
                        <div
                            className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-6"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}
                        >
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                        </div>
                        <p className="font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>No projects yet</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create your first project to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 stagger">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => navigate(`/projects/${project.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <CreateProjectModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleCreate}
                />
            )}
        </div>
    );
}

interface ProjectCardProps {
    project: ProjectSummary;
    onClick: () => void;
}

function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <div
            className="anim-fade-up group relative cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
            style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
            }}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick()}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-mid)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
            }}
        >
            {/* Hover glow overlay */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(240,180,41,0.05) 0%, transparent 70%)',
                }}
            />

            <div className="p-6 relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h2
                        className="leading-snug font-semibold"
                        style={{ color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'Outfit, sans-serif' }}
                    >
                        {project.name}
                    </h2>
                    <svg
                        width="15" height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="2"
                        className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                    >
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                </div>

                {project.description && (
                    <p
                        className="text-sm leading-relaxed mb-4"
                        style={{
                            color: 'var(--text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {project.description}
                    </p>
                )}

                <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <span
                        className="text-xs font-medium px-2.5 py-1 rounded-lg"
                        style={{
                            background: project.taskCount > 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                            color: project.taskCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                            fontFamily: 'JetBrains Mono, monospace',
                        }}
                    >
                        {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
