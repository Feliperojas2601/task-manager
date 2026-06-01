import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TaskStatus, Priority, TaskFormData } from '../types';

interface Props {
    mode: 'create' | 'edit';
    initialValues?: Partial<TaskFormData>;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
}

export function TaskFormModal({ mode, initialValues, onClose, onSubmit }: Props) {
    const [title, setTitle] = useState(initialValues?.title ?? '');
    const [description, setDescription] = useState(initialValues?.description ?? '');
    const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? 'PENDING');
    const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'MEDIUM');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onSubmit({ title: title.trim(), description, status, priority });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

    return (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[480px] max-w-[90vw] shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {mode === 'create' ? 'New Task' : 'Edit Task'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Title *
                        </label>
                        <input
                            className={inputClass}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Task title"
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            className={`${inputClass} resize-y h-18`}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                className={inputClass}
                                value={status}
                                onChange={e => setStatus(e.target.value as TaskStatus)}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Priority
                            </label>
                            <select
                                className={inputClass}
                                value={priority}
                                onChange={e => setPriority(e.target.value as Priority)}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
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
                            {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
