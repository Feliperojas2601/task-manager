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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '9px 13px',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-mid)',
        borderRadius: '10px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        fontFamily: 'Outfit, sans-serif',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        fontFamily: 'Outfit, sans-serif',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 anim-fade-in"
            style={{ background: 'rgba(7, 10, 18, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-[460px] max-w-[92vw] rounded-2xl p-8 anim-scale-in"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-mid)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <h2
                        style={{
                            fontFamily: 'Instrument Serif, Georgia, serif',
                            fontSize: '22px',
                            color: 'var(--text-primary)',
                        }}
                    >
                        New Project
                    </h2>
                    <button
                        className="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all duration-200"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        onClick={onClose}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label style={labelStyle}>Name *</label>
                        <input
                            style={inputStyle}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Project name"
                            autoFocus
                            onFocus={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--accent)')}
                            onBlur={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--border-mid)')}
                        />
                    </div>

                    <div className="mb-5">
                        <label style={labelStyle}>Description</label>
                        <textarea
                            style={{ ...inputStyle, height: '88px', resize: 'vertical' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                            onFocus={e => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--accent)')}
                            onBlur={e => ((e.target as HTMLTextAreaElement).style.borderColor = 'var(--border-mid)')}
                        />
                    </div>

                    {error && (
                        <p
                            className="text-sm mb-4 px-3 py-2 rounded-lg"
                            style={{ color: 'var(--danger)', background: 'var(--danger-dim)', border: '1px solid rgba(240,88,106,0.2)' }}
                        >
                            {error}
                        </p>
                    )}

                    <div
                        className="flex justify-end gap-2 pt-2 mt-2 border-t"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-mid)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'Outfit, sans-serif',
                            }}
                            onClick={onClose}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 disabled:opacity-40"
                            style={{
                                background: 'var(--accent)',
                                color: 'var(--bg-base)',
                                fontFamily: 'Outfit, sans-serif',
                                boxShadow: loading ? 'none' : '0 0 18px var(--accent-glow)',
                            }}
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
