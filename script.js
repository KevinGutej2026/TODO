/**
 * A small, encapsulated Todo application using modern JS and object-oriented patterns.
 * - Encapsulates state and DOM in a class
 * - Uses stable numeric ids for tasks
 * - Uses event delegation for performance and simpler wiring
 * - Handles corrupt localStorage safely
 */

class TodoApp {
    static STORAGE_KEY = 'tasks';

    /**
     * @param {HTMLFormElement} formEl
     * @param {HTMLInputElement} inputEl
     * @param {HTMLElement} listEl
     */
    constructor({ formEl, inputEl, listEl }) {
        if (!formEl || !inputEl || !listEl) {
            throw new Error('Missing required DOM elements for TodoApp');
        }

        this.form = formEl;
        this.input = inputEl;
        this.list = listEl;

        /** @type {{id:number,text:string,done:boolean}[]} */
        this.tasks = [];

        // simple counter for stable ids across a session (persisted with tasks)
        this._nextId = 1;

        this._bindEvents();
        this.load();
        this.render();
    }

    _bindEvents() {
        // handle add
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = this.input.value.trim();
            if (!value) return;
            this.addTask(value);
            this.input.value = '';
        });

        // delegated listener for checkbox changes and future actions (delete/edit)
        this.list.addEventListener('change', (e) => {
            const target = /** @type {HTMLElement} */ (e.target);
            if (target && target.matches('input[type="checkbox"][data-id]')) {
                const id = Number(target.dataset.id);
                const done = /** @type {HTMLInputElement} */ (target).checked;
                this.toggleTask(id, done);
            }
        });

        // delegated click listener for actions like delete
        this.list.addEventListener('click', (e) => {
            const target = /** @type {HTMLElement} */ (e.target);
            if (!target) return;
            // delete action
            if (target.matches('button[data-action="delete"][data-id]')) {
                const id = Number(target.dataset.id);
                this.deleteTask(id);
            }
        });
    }

    load() {
        const raw = localStorage.getItem(TodoApp.STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) throw new Error('Invalid tasks data');
            this.tasks = parsed.map(t => ({ id: Number(t.id) || this._generateId(), text: String(t.text), done: Boolean(t.done) }));
            // keep _nextId greater than the highest id we loaded
            const maxId = this.tasks.reduce((m, t) => Math.max(m, t.id), 0);
            this._nextId = maxId + 1;
        } catch (err) {
            // If localStorage is corrupt, don't break the app — clear it and continue with empty list
            console.warn('Failed to parse tasks from localStorage, resetting:', err);
            this.tasks = [];
            localStorage.removeItem(TodoApp.STORAGE_KEY);
        }
    }

    save() {
        try {
            localStorage.setItem(TodoApp.STORAGE_KEY, JSON.stringify(this.tasks));
        } catch (err) {
            console.error('Failed to save tasks:', err);
        }
    }

    _generateId() {
        return this._nextId++;
    }

    addTask(text) {
        const task = { id: this._generateId(), text: String(text), done: false };
        this.tasks.push(task);
        this.save();
        this._appendTaskElement(task);
    }

    toggleTask(id, done) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        task.done = Boolean(done);
        this.save();
        // update DOM node for visual state
        const checkbox = this.list.querySelector(`input[data-id="${id}"]`);
        const span = checkbox ? checkbox.nextElementSibling : null;
        if (span instanceof HTMLElement) {
            span.classList.toggle('completed', task.done);
        }
    }

    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return;
        // remove from state
        this.tasks.splice(index, 1);
        this.save();
        // remove DOM node
        const btn = this.list.querySelector(`button[data-action="delete"][data-id="${id}"]`);
        const li = btn ? btn.closest('li') : null;
        if (li && li.parentElement) li.parentElement.removeChild(li);
    }

    render() {
        // clear list and render all tasks
        this.list.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (const task of this.tasks) {
            fragment.appendChild(this._createTaskElement(task));
        }
        this.list.appendChild(fragment);
    }

    _appendTaskElement(task) {
        this.list.appendChild(this._createTaskElement(task));
    }

    _createTaskElement(task) {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.id = String(task.id);
        checkbox.checked = !!task.done;

        const span = document.createElement('span');
        span.textContent = task.text;
        if (task.done) span.classList.add('completed');

        const del = document.createElement('button');
        del.type = 'button';
        del.dataset.action = 'delete';
        del.dataset.id = String(task.id);
        del.textContent = 'Usuń';
        del.setAttribute('aria-label', `Usuń zadanie ${task.text}`);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(del);
        return li;
    }
}

// Initialize the app when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new TodoApp({
            formEl: document.getElementById('task-form'),
            inputEl: document.getElementById('task-input'),
            listEl: document.getElementById('task-list')
        });
        // expose app for debugging in devtools (optional)
        window.todoApp = app;
    } catch (err) {
        console.error('Failed to initialize TodoApp:', err);
    }
});