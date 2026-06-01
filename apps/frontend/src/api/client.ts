const BASE_URL = '/api';

export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json() as { message?: string };
    if (!response.ok) throw new ApiError(response.status, data.message ?? 'Request failed');
    return data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
