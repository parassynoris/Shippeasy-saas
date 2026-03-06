module.exports = {
  testTimeout: 10000,
  detectOpenHandles: true,
  forceExit: true,
  collectCoverageFrom: [
    'middleware/**/*.js',
    'controller/**/*.js',
    'service/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    'schema/helpers.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'cobertura'],
  coverageThreshold: {
    './middleware/': {
      branches: 30,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
};
