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
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Loading…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-500">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <button
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    onClick={() => setShowModal(true)}
                >
                    + New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-700 mb-2">No projects yet.</p>
                    <p className="text-sm text-gray-400">Create your first project to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="border border-gray-200 rounded-xl p-5 cursor-pointer bg-white hover:shadow-md transition-shadow outline-none"
                            onClick={() => navigate(`/projects/${project.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
                        >
                            <h2 className="text-base font-semibold text-gray-900 mb-2">
                                {project.name}
                            </h2>
                            {project.description && (
                                <p className="text-sm text-gray-500 mb-3 truncate">
                                    {project.description}
                                </p>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-600 font-medium">
                                    {project.taskCount} tasks
                                </span>
                                <span className="text-xs text-gray-400">
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
