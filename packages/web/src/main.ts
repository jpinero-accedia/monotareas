// vim: ft=typescript: ts=3: sw=3: noet:

import '@ungap/custom-elements';
import { api, type Tarea } from './api.js';
import './components/task-item.js';
import type { TaskItem, TaskToggleEvent, TaskRemoveEvent } from './components/task-item.js';

const taskList  = document.querySelector<HTMLUListElement>('#task-list')!;
const emptyMsg  = document.querySelector<HTMLParagraphElement>('#empty-msg')!;
const errorMsg  = document.querySelector<HTMLParagraphElement>('#error-msg')!;
const form      = document.querySelector<HTMLFormElement>('#new-task-form')!;
const input     = document.querySelector<HTMLInputElement>('#new-task-input')!;
const resetBtn  = document.querySelector<HTMLButtonElement>('#reset-btn')!;


function showError (err: unknown): void {
	console.error(err);
	errorMsg.textContent = err instanceof Error ? err.message : 'Ha ocurrido un error inesperado';
	errorMsg.hidden = false;
}

function clearError (): void {
	errorMsg.hidden = true;
}


function renderTask (tarea: Tarea): TaskItem {
	const item = document.createElement('li', { is: 'task-item' }) as TaskItem;
	item.setTarea(tarea);

	item.addEventListener('task-toggle', async (ev: Event): Promise<void> => {
		const { id, completada } = (ev as TaskToggleEvent).detail;
		try {
			await api.setCompletada(id, completada);
			await refresh();
		}
		catch (err) {
			showError(err);
		}
	});

	item.addEventListener('task-remove', async (ev: Event): Promise<void> => {
		const { id } = (ev as TaskRemoveEvent).detail;
		try {
			await api.remove(id);
			await refresh();
		}
		catch (err) {
			showError(err);
		}
	});

	return item;
}


async function refresh (): Promise<void> {
	clearError();

	const tareas = await api.getAll();

	taskList.replaceChildren( ...tareas.map(renderTask) );
	emptyMsg.hidden = tareas.length !== 0;
}


form.addEventListener('submit', async (ev): Promise<void> => {
	ev.preventDefault();

	const titulo: string = input.value.trim();
	if ( ! titulo ) {
		return;
	}

	try {
		await api.create(titulo);
		input.value = '';
		await refresh();
	}
	catch (err) {
		showError(err);
	}
});


resetBtn.addEventListener('click', async (): Promise<void> => {
	try {
		await api.reset();
		await refresh();
	}
	catch (err) {
		showError(err);
	}
});


refresh().catch(showError);
