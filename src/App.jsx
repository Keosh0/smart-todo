import { useCallback, useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Filters from "./components/Filters";
import StatusBar from "./components/StatusBar";
import { fetchTasks, createTask, toggleTask, deleteTask } from "./api";
import "./App.css";

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadFailed, setLoadFailed] = useState(false);
    const [notice, setNotice] = useState("");
    const [busyIds, setBusyIds] = useState([]);
    const [adding, setAdding] = useState(false);

    const showError = (err) => {
        setNotice("");
        setError(err?.message || "Неизвестная ошибка");
    };

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setTasks(await fetchTasks());
            setLoadFailed(false);
        } catch (err) {
            setLoadFailed(true);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Сообщение об успехе скрывается через 2,5 секунды
    useEffect(() => {
        if (!notice) return undefined;
        const timer = setTimeout(() => setNotice(""), 2500);
        return () => clearTimeout(timer);
    }, [notice]);

    const markBusy = (id, value) =>
        setBusyIds((prev) => (value ? [...prev, id] : prev.filter((x) => x !== id)));

    const handleAdd = async (title) => {
        setAdding(true);
        try {
            const task = await createTask(title);
            setTasks((prev) => [...prev, task]);
            setError("");
            setNotice("Задача добавлена");
            return true;
        } catch (err) {
            showError(err);
            return false;
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (id, completed) => {
        markBusy(id, true);
        try {
            const updated = await toggleTask(id, completed);
            setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
            setError("");
        } catch (err) {
            showError(err);
        } finally {
            markBusy(id, false);
        }
    };

    const handleDelete = async (id) => {
        markBusy(id, true);
        try {
            await deleteTask(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setError("");
            setNotice("Задача удалена");
        } catch (err) {
            showError(err);
        } finally {
            markBusy(id, false);
        }
    };

    const counts = useMemo(() => {
        const completed = tasks.filter((t) => t.completed).length;
        return { all: tasks.length, active: tasks.length - completed, completed };
    }, [tasks]);

    const visible = useMemo(() => {
        if (filter === "active") return tasks.filter((t) => !t.completed);
        if (filter === "completed") return tasks.filter((t) => t.completed);
        return tasks;
    }, [tasks, filter]);

    return (
        <div className="app">
            <header className="app-header">
                <h1>Умный список задач</h1>
                <p className="subtitle">Smart TodoList</p>
            </header>

            <main className="card">
                <TaskForm onAdd={handleAdd} disabled={adding || loading} />
                <StatusBar
                    loading={loading}
                    error={error}
                    notice={notice}
                    onRetry={loadFailed ? loadTasks : null}
                    onDismiss={() => setError("")}
                />
                {!loading && (
                    <>
                        <Filters value={filter} onChange={setFilter} counts={counts} />
                        <TaskList
                            tasks={visible}
                            filter={filter}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            busyIds={busyIds}
                        />
                    </>
                )}
            </main>

            <footer className="app-footer">
                Осталось выполнить: {counts.active} из {counts.all}
            </footer>
        </div>
    );
}
