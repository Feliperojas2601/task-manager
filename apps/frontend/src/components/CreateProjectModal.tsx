import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
    onClose: () => void;
    onSubmit: (name: string, description: string) => Promise<void>;
}

export function CreateProjectModal({ onClose, onSubmit }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onSubmit(name.trim(), description.trim());
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[440px] max-w-[90vw] shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Name *
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Project name"
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y h-20"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
