import { useState } from "react";

// Форма добавления задачи
export default function TaskForm({ onAdd, disabled = false }) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) {
            setError("Введите текст задачи");
            return;
        }
        const ok = await onAdd(trimmed);
        if (ok !== false) setTitle("");
    };

    return (
        <form className="task-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-task" className="visually-hidden">
                Новая задача
            </label>
            <input
                id="new-task"
                type="text"
                value={title}
                maxLength={200}
                placeholder="Что нужно сделать?"
                onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "new-task-error" : undefined}
            />
            <button type="submit" disabled={disabled}>
                Добавить
            </button>
            {error && (
                <p id="new-task-error" className="form-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}
