import express from "express";
import cors from "cors";
import * as store from "./store.js";
import { checkApiKey } from "./middleware/apiKey.js";
import { validateId, validateCreate, validateReplace, validatePatch } from "./middleware/validate.js";

const app = express();

app.use(cors());
app.use(express.json());

// Проверка работоспособности сервера (без ключа)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const router = express.Router();
router.use(checkApiKey);

// Получение задач, фильтр ?status=all|active|completed
router.get("/", (req, res) => {
    const status = req.query.status ?? "all";
    if (!["all", "active", "completed"].includes(status)) {
        return res.status(400).json({ error: "status должен быть all, active или completed" });
    }
    res.json(store.getAll(status));
});

// Получение одной задачи
router.get("/:id", validateId, (req, res) => {
    const task = store.getById(req.taskId);
    if (!task) return res.status(404).json({ error: "Задача не найдена" });
    res.json(task);
});

// Создание задачи
router.post("/", validateCreate, (req, res) => {
    res.status(201).json(store.create(req.body.title));
});

// Полное обновление задачи
router.put("/:id", validateId, validateReplace, (req, res) => {
    const task = store.update(req.taskId, { title: req.body.title, completed: req.body.completed });
    if (!task) return res.status(404).json({ error: "Задача не найдена" });
    res.json(task);
});

// Частичное обновление (например, отметка выполнения)
router.patch("/:id", validateId, validatePatch, (req, res) => {
    const task = store.update(req.taskId, req.changes);
    if (!task) return res.status(404).json({ error: "Задача не найдена" });
    res.json(task);
});

// Удаление задачи
router.delete("/:id", validateId, (req, res) => {
    if (!store.remove(req.taskId)) return res.status(404).json({ error: "Задача не найдена" });
    res.sendStatus(204);
});

app.use("/api/tasks", router);

// Неизвестный маршрут API
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

// Обработка ошибок: некорректный JSON и непредвиденные исключения
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Тело запроса должно быть корректным JSON" });
    }
    console.error("Ошибка сервера:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

export default app;
