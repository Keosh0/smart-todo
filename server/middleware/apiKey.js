// Базовая защита: каждый запрос к /api/tasks должен содержать заголовок x-api-key
export function checkApiKey(req, res, next) {
    const expected = process.env.API_KEY;
    if (!expected) {
        return res.status(500).json({ error: "На сервере не задана переменная окружения API_KEY" });
    }
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== expected) {
        return res.status(401).json({ error: "Неверный или отсутствующий API-ключ" });
    }
    next();
}
