import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

// Ответ fetch в формате Response
const reply = (status, body) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

const initial = [
    { id: 1, title: "Купить хлеб", completed: false },
    { id: 2, title: "Сдать проект", completed: true },
];

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    delete global.fetch;
});

describe("App (с подменённым fetch)", () => {
    test("загружает задачи с сервера и передаёт API-ключ в заголовке", async () => {
        fetch.mockReturnValueOnce(reply(200, initial));
        render(<App />);

        expect(screen.getByRole("status")).toHaveTextContent("Загрузка задач");
        expect(await screen.findByText("Купить хлеб")).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith("/api/tasks", expect.objectContaining({
            headers: expect.objectContaining({ "x-api-key": "test-key" }),
        }));
    });

    test("добавляет задачу через POST и показывает её в списке", async () => {
        fetch
            .mockReturnValueOnce(reply(200, []))
            .mockReturnValueOnce(reply(201, { id: 3, title: "Новая задача", completed: false }));
        render(<App />);
        await screen.findByText("Задач пока нет — добавьте первую");

        await userEvent.type(screen.getByPlaceholderText("Что нужно сделать?"), "Новая задача{enter}");

        expect(await within(await screen.findByRole("list")).findByText("Новая задача")).toBeInTheDocument();
        expect(fetch).toHaveBeenLastCalledWith("/api/tasks", expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ title: "Новая задача" }),
        }));
    });

    test("отмечает выполнение через PATCH и фильтрует задачи", async () => {
        fetch
            .mockReturnValueOnce(reply(200, initial))
            .mockReturnValueOnce(reply(200, { ...initial[0], completed: true }));
        render(<App />);
        await userEvent.click(await screen.findByLabelText("Купить хлеб"));

        expect(await screen.findByLabelText("Купить хлеб")).toBeChecked();
        expect(fetch).toHaveBeenLastCalledWith("/api/tasks/1", expect.objectContaining({ method: "PATCH" }));

        await userEvent.click(screen.getByRole("button", { name: /Активные/ }));
        expect(screen.getByText("Активных задач нет")).toBeInTheDocument();
    });

    test("удаляет задачу через DELETE", async () => {
        fetch
            .mockReturnValueOnce(reply(200, initial))
            .mockReturnValueOnce(Promise.resolve({ ok: true, status: 204 }));
        render(<App />);
        await userEvent.click(await screen.findByRole("button", { name: "Удалить задачу «Купить хлеб»" }));

        expect(await screen.findByText("Задача удалена")).toBeInTheDocument();
        expect(within(screen.getByRole("list")).queryByText("Купить хлеб")).not.toBeInTheDocument();
    });

    test("показывает ошибку сети и повторяет загрузку по кнопке", async () => {
        fetch
            .mockRejectedValueOnce(new TypeError("Failed to fetch"))
            .mockReturnValueOnce(reply(200, initial));
        render(<App />);

        expect(await screen.findByRole("alert")).toHaveTextContent("Нет связи с сервером");
        await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
        expect(await screen.findByText("Сдать проект")).toBeInTheDocument();
    });

    test("показывает сообщение сервера при ответе с ошибкой", async () => {
        fetch
            .mockReturnValueOnce(reply(200, []))
            .mockReturnValueOnce(reply(401, { error: "Неверный или отсутствующий API-ключ" }));
        render(<App />);
        await screen.findByText("Задач пока нет — добавьте первую");

        await userEvent.type(screen.getByPlaceholderText("Что нужно сделать?"), "Задача{enter}");

        expect(await screen.findByRole("alert")).toHaveTextContent("Неверный или отсутствующий API-ключ");
    });
});
