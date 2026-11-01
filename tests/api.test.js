/**
 * @jest-environment node
 */
import request from "supertest";
import app from "../server/app.js";
import * as store from "../server/store.js";

const KEY = "test-key";

beforeAll(() => {
    process.env.API_KEY = KEY;
});

beforeEach(() => {
    store.reset([
        { id: 1, title: "Купить хлеб", completed: false },
        { id: 2, title: "Сдать проект", completed: true },
    ]);
});

describe("REST API /api/tasks", () => {
    test("без API-ключа возвращает 401", async () => {
        const res = await request(app).get("/api/tasks");
        expect(res.status).toBe(401);
    });

    test("GET возвращает задачи и фильтрует по статусу", async () => {
        const all = await request(app).get("/api/tasks").set("x-api-key", KEY);
        expect(all.body).toHaveLength(2);

        const active = await request(app).get("/api/tasks?status=active").set("x-api-key", KEY);
        expect(active.body.map((t) => t.title)).toEqual(["Купить хлеб"]);
    });

    test("POST создаёт задачу, а пустой текст отклоняет с кодом 400", async () => {
        const created = await request(app).post("/api/tasks").set("x-api-key", KEY).send({ title: "  Новая  " });
        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ id: 3, title: "Новая", completed: false });

        const invalid = await request(app).post("/api/tasks").set("x-api-key", KEY).send({ title: "   " });
        expect(invalid.status).toBe(400);
    });

    test("PATCH меняет статус, PUT заменяет задачу целиком", async () => {
        const patched = await request(app).patch("/api/tasks/1").set("x-api-key", KEY).send({ completed: true });
        expect(patched.body.completed).toBe(true);

        const put = await request(app).put("/api/tasks/1").set("x-api-key", KEY)
            .send({ title: "Хлеб и молоко", completed: false });
        expect(put.body).toMatchObject({ title: "Хлеб и молоко", completed: false });

        const bad = await request(app).patch("/api/tasks/1").set("x-api-key", KEY).send({ completed: "yes" });
        expect(bad.status).toBe(400);
    });

    test("DELETE удаляет задачу, повторное удаление возвращает 404", async () => {
        expect((await request(app).delete("/api/tasks/2").set("x-api-key", KEY)).status).toBe(204);
        expect((await request(app).delete("/api/tasks/2").set("x-api-key", KEY)).status).toBe(404);
        expect((await request(app).delete("/api/tasks/abc").set("x-api-key", KEY)).status).toBe(400);
    });
});
