import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../src/components/TaskForm";

describe("TaskForm", () => {
    test("передаёт текст новой задачи без пробелов по краям и очищает поле", async () => {
        const onAdd = jest.fn().mockResolvedValue(true);
        render(<TaskForm onAdd={onAdd} />);
        const input = screen.getByPlaceholderText("Что нужно сделать?");

        await userEvent.type(input, "  Купить хлеб  ");
        await userEvent.click(screen.getByRole("button", { name: "Добавить" }));

        expect(onAdd).toHaveBeenCalledWith("Купить хлеб");
        expect(input).toHaveValue("");
    });

    test("не отправляет пустую задачу и показывает подсказку", async () => {
        const onAdd = jest.fn();
        render(<TaskForm onAdd={onAdd} />);

        await userEvent.click(screen.getByRole("button", { name: "Добавить" }));

        expect(onAdd).not.toHaveBeenCalled();
        expect(screen.getByRole("alert")).toHaveTextContent("Введите текст задачи");
    });

    test("сохраняет текст в поле, если добавить задачу не удалось", async () => {
        const onAdd = jest.fn().mockResolvedValue(false);
        render(<TaskForm onAdd={onAdd} />);
        const input = screen.getByPlaceholderText("Что нужно сделать?");

        await userEvent.type(input, "Позвонить{enter}");

        expect(onAdd).toHaveBeenCalledWith("Позвонить");
        expect(input).toHaveValue("Позвонить");
    });
});
