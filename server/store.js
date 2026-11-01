// Хранилище задач в памяти сервера (массив объектов)
let tasks = [];
let nextId = 1;

export function getAll(status = "all") {
    if (status === "active") return tasks.filter((t) => !t.completed);
    if (status === "completed") return tasks.filter((t) => t.completed);
    return tasks;
}

export function getById(id) {
    return tasks.find((t) => t.id === id);
}

export function create(title) {
    const task = { id: nextId++, title, completed: false, createdAt: new Date().toISOString() };
    tasks.push(task);
    return task;
}

export function update(id, changes) {
    const task = getById(id);
    if (!task) return null;
    Object.assign(task, changes);
    return task;
}

export function remove(id) {
    const before = tasks.length;
    tasks = tasks.filter((t) => t.id !== id);
    return tasks.length < before;
}

// Сброс хранилища (используется в тестах)
export function reset(initial = []) {
    tasks = initial.map((t) => ({ ...t }));
    nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}
