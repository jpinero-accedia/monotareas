// vim: ft=typescript: ts=3: sw=3: noet:

export interface Tarea {
	id:         number;
	titulo:     string;
	completada: boolean;
}

export interface UpsertResult {
	affectedRows:  number;
	insertId:      number | bigint;
	warningStatus: number;
}

// El backend corre en su propio contenedor/puerto; en desarrollo con
// podman-compose se publica en localhost:3000. Se puede sobreescribir
// definiendo window.__API_BASE__ antes de cargar este script (útil para
// Capacitor/Tauri, donde la app no corre en "localhost").
const API_BASE =
	(globalThis as unknown as { __API_BASE__?: string }).__API_BASE__
	?? 'http://localhost:3000';


async function request<T> (path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init,
	});

	if ( ! res.ok ) {
		throw new Error(`Error ${res.status} al llamar a ${path}`);
	}

	return await res.json() as T;
}

export const api = {
	getAll: () =>
		request<Tarea[]>('/tareas'),

	create: (titulo: string) =>
		request<UpsertResult[]>('/tareas', {
			method: 'POST',
			body:   JSON.stringify({ titulo }),
		}),

	setCompletada: (id: number, completada: boolean) =>
		request<UpsertResult[]>(`/tareas/${id}`, {
			method: 'PATCH',
			body:   JSON.stringify({ completada }),
		}),

	remove: (id: number) =>
		request<UpsertResult[]>(`/tareas/${id}`, { method: 'DELETE' }),

	reset: () =>
		request<UpsertResult[]>('/reset', { method: 'POST' }),
};
