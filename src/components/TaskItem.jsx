// Одна задача: чекбокс выполнения, текст и кнопка удаления
export default function TaskItem({ task, onToggle, onDelete, busy = false }) {
    const checkboxId = `task-${task.id}`;

    return (
        <li className={`task-item${task.completed ? " completed" : ""}${busy ? " busy" : ""}`}>
            <input
                id={checkboxId}
                type="checkbox"
                checked={task.completed}
                disabled={busy}
                onChange={() => onToggle(task.id, !task.completed)}
            />
            <label htmlFor={checkboxId} className="task-title">
                {task.title}
            </label>
            <button
                type="button"
                className="delete-btn"
                disabled={busy}
                onClick={() => onDelete(task.id)}
                aria-label={`Удалить задачу «${task.title}»`}
            >
                ✕
            </button>
        </li>
    );
}
