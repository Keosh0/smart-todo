import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList from "../src/components/TaskList";
import TaskItem from "../src/components/TaskItem";
import Filters from "../src/components/Filters";

const tasks = [
    { id: 1, title: "Купить хлеб", completed: false },
    { id: 2, title: "Сдать проект", completed: true },
];

describe("TaskList и TaskItem", () => {
    test("отображает все задачи и отмечает выполненные чекбоксом", () => {
        render(<TaskList tasks={tasks} onToggle={() => {}} onDelete={() => {}} />);

        expect(screen.getAllByRole("listitem")).toHaveLength(2);
        expect(screen.getByLabelText("Купить хлеб")).not.toBeChecked();
        expect(screen.getByLabelText("Сдать проект")).toBeChecked();
    });

    test("показывает сообщение, если задач нет", () => {
        render(<TaskList tasks={[]} filter="completed" onToggle={() => {}} onDelete={() => {}} />);
        expect(screen.getByText("Завершённых задач нет")).toBeInTheDocument();
    });

    test("клик по чекбоксу вызывает onToggle с новым статусом", async () => {
        const onToggle = jest.fn();
        render(<TaskItem task={tasks[0]} onToggle={onToggle} onDelete={() => {}} />);

        await userEvent.click(screen.getByRole("checkbox"));

        expect(onToggle).toHaveBeenCalledWith(1, true);
    });

    test("кнопка удаления вызывает onDelete с id задачи", async () => {
        const onDelete = jest.fn();
        render(<TaskItem task={tasks[1]} onToggle={() => {}} onDelete={onDelete} />);

        await userEvent.click(screen.getByRole("button", { name: "Удалить задачу «Сдать проект»" }));

        expect(onDelete).toHaveBeenCalledWith(2);
    });

    test("пока запрос выполняется, элементы задачи заблокированы", () => {
        render(<TaskItem task={tasks[0]} onToggle={() => {}} onDelete={() => {}} busy />);
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByRole("button")).toBeDisabled();
    });
});

describe("Filters", () => {
    test("выделяет текущий фильтр, показывает счётчики и сообщает о выборе", async () => {
        const onChange = jest.fn();
        render(<Filters value="all" onChange={onChange} counts={{ all: 3, active: 2, completed: 1 }} />);

        expect(screen.getByRole("button", { name: /Все/ })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: /Активные/ })).toHaveTextContent("2");

        await userEvent.click(screen.getByRole("button", { name: /Завершённые/ }));
        expect(onChange).toHaveBeenCalledWith("completed");
    });
});
