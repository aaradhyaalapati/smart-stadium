/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/data/**/*.ts',
    'src/tools/**/*.ts',
    'src/offline/**/*.ts',
    'src/assistant/**/*.ts',
    'src/api/**/*.ts',
    'src/middleware/**/*.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
