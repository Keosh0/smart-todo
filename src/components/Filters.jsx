const FILTERS = [
    { value: "all", label: "Все" },
    { value: "active", label: "Активные" },
    { value: "completed", label: "Завершённые" },
];

// Переключатель фильтра: все / активные / завершённые
export default function Filters({ value, onChange, counts }) {
    return (
        <div className="filters" role="group" aria-label="Фильтр задач">
            {FILTERS.map((f) => (
                <button
                    key={f.value}
                    type="button"
                    className={value === f.value ? "active" : ""}
                    aria-pressed={value === f.value}
                    onClick={() => onChange(f.value)}
                >
                    {f.label} <span className="count">{counts[f.value]}</span>
                </button>
            ))}
        </div>
    );
}
