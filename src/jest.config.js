module.exports = { 
  testEnvironment: 'jsdom', // Added missing comma here
  roots: ['<rootDir>/src'], 
  moduleNameMapper: { 
    '^@/(.*)$': '<rootDir>/src/$1',
  // Handle static file imports
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
}, 
  transformIgnorePatterns: [ 
    '/node_modules/(?!(axios)/)', 
  ], 
  transform: { 
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }], 
  }, 
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], 
  testMatch: [ 
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}', 
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}' 
  ], 
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'], 
  collectCoverageFrom: [ 
    'src/**/*.{js,jsx,ts,tsx}', 
    '!src/**/*.d.ts', 
    '!src/mocks/**' 
  ], 
  coverageDirectory: 'coverage', 
};