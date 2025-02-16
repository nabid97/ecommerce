module.exports = {
  setupFiles: [
    '<rootDir>/src/textEncoder.js', // Add this
    'jest-canvas-mock'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  transformIgnorePatterns: [
    'node_modules/(?!mongoose)/'
  ]
};