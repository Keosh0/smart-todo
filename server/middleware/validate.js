// Middleware валидации входных данных
const MAX_TITLE = 200;

function checkTitle(title) {
    if (typeof title !== "string") return "Поле title должно быть строкой";
    const trimmed = title.trim();
    if (!trimmed) return "Текст задачи не может быть пустым";
    if (trimmed.length > MAX_TITLE) return `Текст задачи не длиннее ${MAX_TITLE} символов`;
    return null;
}

// id в адресе — положительное целое число
export function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Некорректный идентификатор задачи" });
    }
    req.taskId = id;
    next();
}

// POST: обязательное поле title
export function validateCreate(req, res, next) {
    const error = checkTitle(req.body?.title);
    if (error) return res.status(400).json({ error });
    req.body.title = req.body.title.trim();
    next();
}

// PUT: полная замена — обязательны title и completed
export function validateReplace(req, res, next) {
    const error = checkTitle(req.body?.title);
    if (error) return res.status(400).json({ error });
    if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({ error: "Поле completed должно быть true или false" });
    }
    req.body.title = req.body.title.trim();
    next();
}

// PATCH: частичное обновление — хотя бы одно из полей title / completed
export function validatePatch(req, res, next) {
    const body = req.body ?? {};
    const changes = {};
    if ("title" in body) {
        const error = checkTitle(body.title);
        if (error) return res.status(400).json({ error });
        changes.title = body.title.trim();
    }
    if ("completed" in body) {
        if (typeof body.completed !== "boolean") {
            return res.status(400).json({ error: "Поле completed должно быть true или false" });
        }
        changes.completed = body.completed;
    }
    if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: "Передайте title и/или completed" });
    }
    req.changes = changes;
    next();
}
