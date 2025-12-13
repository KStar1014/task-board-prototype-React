/** @type {import('jest').Config} */
module.exports = {
  // Run tests once (no watch)
  watch: false,
  watchAll: false,

  // Hide console.log / warn / error output
  silent: true,

  // Automatically clear mocks between tests
  clearMocks: true,

  // Allow Babel, JSX, or TS
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  // Where tests are located
  testMatch: [
    "<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)"
  ],

  // Setup file (optional but recommended)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Ignore build files
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
  ],

  // Environment (default for React)
  testEnvironment: "jsdom",
};
