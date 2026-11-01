// Локальный запуск сервера: npm run server
import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Сервер API запущен на http://localhost:${PORT}`);
});
