module.exports = {
  setupFiles: [
    '<rootDir>/textEncoder.js',
    'jest-canvas-mock'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ],
  moduleDirectories: ['node_modules'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  extensionsToTreatAsEsm: ['.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  resolver: undefined
};