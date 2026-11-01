// Конфигурация Babel для Jest (формат CommonJS: babel-jest загружает его синхронно)
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
