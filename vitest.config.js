// Vitest configuration for mixed Node (main) and jsdom (renderer) tests
// Default environment is node; use "@vitest-environment jsdom" pragma per test file when needed.

/** @type {import('vitest').UserConfig} */
module.exports = {
  test: {
    environment: 'node',
    include: [
      'tests/**/*.test.js',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
    },
  },
};


