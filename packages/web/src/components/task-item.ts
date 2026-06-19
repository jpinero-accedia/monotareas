// vim: ft=typescript: ts=3: sw=3: noet:

import { type Tarea } from '../api.js';


export class TaskToggleEvent extends CustomEvent<{ id: number; completada: boolean }> {
	constructor (id: number, completada: boolean) {
		super('task-toggle', {
			bubbles:  true,
			composed: true,
			detail:   { id, completada },
		});
	}
}

export class TaskRemoveEvent extends CustomEvent<{ id: number }> {
	constructor (id: number) {
		super('task-remove', {
			bubbles:  true,
			composed: true,
			detail:   { id },
		});
	}
}


export class TaskItem extends HTMLLIElement {

	private tarea!: Tarea;


	setTarea (tarea: Tarea): void {
		this.tarea = tarea;
		this.render();
	}


	private render (): void {
		this.className = `task${ this.tarea.completada ? ' task--done' : '' }`;

		const checkbox = document.createElement('input');
		checkbox.type    = 'checkbox';
		checkbox.checked = this.tarea.completada;
		checkbox.addEventListener('change', (): void => {
			this.dispatchEvent( new TaskToggleEvent(this.tarea.id, checkbox.checked) );
		});

		const title = document.createElement('span');
		title.className   = 'task__title';
		title.textContent = this.tarea.titulo;

		const removeBtn = document.createElement('button');
		removeBtn.type        = 'button';
		removeBtn.className   = 'btn btn--icon';
		removeBtn.textContent = '✕';
		removeBtn.title       = 'Borrar tarea';
		removeBtn.addEventListener('click', (): void => {
			this.dispatchEvent( new TaskRemoveEvent(this.tarea.id) );
		});

		this.replaceChildren(checkbox, title, removeBtn);
	}
}

customElements.define('task-item', TaskItem, { extends: 'li' });
