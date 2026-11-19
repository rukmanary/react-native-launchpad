module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@testing-library|test-renderer)/)',
  ],
  clearMocks: true,
};
