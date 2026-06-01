import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

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
        <div style={s.overlay}>
            <div style={s.modal}>
                <h2 style={s.title}>New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div style={s.field}>
                        <label style={s.label}>Name *</label>
                        <input
                            style={s.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Project name"
                            autoFocus
                        />
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Description</label>
                        <textarea
                            style={{ ...s.input, height: 80, resize: 'vertical' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>
                    {error && <p style={s.error}>{error}</p>}
                    <div style={s.actions}>
                        <button type="button" style={s.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" style={s.submitBtn} disabled={loading}>
                            {loading ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const s: Record<string, CSSProperties> = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    },
    modal: {
        background: '#fff', borderRadius: 8, padding: 32, width: 440, maxWidth: '90vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    },
    title: { margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: '#111' },
    field: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#374151' },
    input: {
        width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
        borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
    },
    error: { color: '#dc2626', fontSize: 13, margin: '0 0 12px' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 },
    cancelBtn: {
        padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6,
        background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
    },
    submitBtn: {
        padding: '8px 16px', border: 'none', borderRadius: 6, background: '#2563eb',
        color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
    },
};
