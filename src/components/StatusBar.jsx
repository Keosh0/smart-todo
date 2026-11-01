// Отображение статуса: загрузка, ошибка с повтором, сообщение об успехе
export default function StatusBar({ loading, error, notice, onRetry, onDismiss }) {
    if (loading) {
        return (
            <p className="status status-loading" role="status">
                <span className="spinner" aria-hidden="true" /> Загрузка задач…
            </p>
        );
    }
    if (error) {
        return (
            <div className="status status-error" role="alert">
                <span>{error}</span>
                <div className="status-actions">
                    {onRetry && (
                        <button type="button" onClick={onRetry}>
                            Повторить
                        </button>
                    )}
                    <button type="button" onClick={onDismiss} aria-label="Скрыть сообщение">
                        ✕
                    </button>
                </div>
            </div>
        );
    }
    if (notice) {
        return (
            <p className="status status-ok" role="status">
                {notice}
            </p>
        );
    }
    return null;
}
