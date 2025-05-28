// Vitest setup file - runs before all tests
// Set up mock window.env that matches the development environment
// @ts-ignore - Add window object for test environment
global.window = global.window || {};
// @ts-ignore - Add env object to window
global.window.env = {
  // set the needed env variables for the tests
};

console.log("Test environment initialized with mock window.env");
