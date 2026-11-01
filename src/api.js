// Клиент REST API. Все запросы идут на относительный адрес /api:
// локально Vite проксирует его на Express (vite.config.js), на Vercel — серверная функция.
const BASE_URL = "/api/tasks";
const API_KEY = import.meta.env.VITE_API_KEY;

// Ошибка запроса: отличает сетевые сбои от ответов сервера с кодом ошибки
export class ApiError extends Error {
    constructor(message, { status = null, network = false } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.network = network;
    }
}

async function request(path = "", options = {}) {
    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                ...options.headers,
            },
        });
    } catch {
        throw new ApiError("Нет связи с сервером. Проверьте подключение к интернету.", { network: true });
    }

    if (!response.ok) {
        let message = `Ошибка сервера (${response.status})`;
        try {
            const data = await response.json();
            if (data?.error) message = data.error;
        } catch {
            // тело ответа не JSON — оставляем общее сообщение
        }
        throw new ApiError(message, { status: response.status });
    }

    return response.status === 204 ? null : response.json();
}

export const fetchTasks = () => request();

export const createTask = (title) =>
    request("", { method: "POST", body: JSON.stringify({ title }) });

export const toggleTask = (id, completed) =>
    request(`/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) });

export const renameTask = (id, title) =>
    request(`/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });

export const deleteTask = (id) => request(`/${id}`, { method: "DELETE" });
