import TaskItem from "./TaskItem";

const EMPTY_TEXT = {
    all: "Задач пока нет — добавьте первую",
    active: "Активных задач нет",
    completed: "Завершённых задач нет",
};

// Список задач с учётом выбранного фильтра
export default function TaskList({ tasks, filter = "all", onToggle, onDelete, busyIds = [] }) {
    if (tasks.length === 0) {
        return <p className="empty">{EMPTY_TEXT[filter]}</p>;
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    busy={busyIds.includes(task.id)}
                />
            ))}
        </ul>
    );
}
