const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
    // Mock uuid to avoid ES module issues
    '^uuid$': require.resolve('uuid'),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/tests/e2e/',
  ],
  // Coverage threshold (per TEST_REQUIREMENTS.md)
  coverageThreshold: {
    global: {
      branches: 70,    // 70% branch coverage
      functions: 75,   // 75% function coverage
      lines: 80,       // 80% line coverage
      statements: 80   // 80% statement coverage
    },
    // Critical files need higher coverage
    './lib/stripe/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './lib/auth/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
