export default {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  transform: { "^.+[.][jt]sx?$": "babel-jest" },
  moduleNameMapper: {
    "[.](css|less|scss)$": "identity-obj-proxy",
    // import.meta.env недоступен в Jest — подменяем модуль настроек
    "/apiConfig$": "<rootDir>/tests/apiConfigMock.js",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
