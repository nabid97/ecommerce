// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { configure } from '@testing-library/react';
import { server } from './server';

// Extend expect with custom matchers
expect.extend({
  toHaveBeenCalledOnce(received) {
    const pass = received.mock.calls.length === 1;
    return {
      pass,
      message: () => 
        `expected ${received.mock.calls.length} to be called once`,
    };
  },
});

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(callback => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  };
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock LocalStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.fetch
global.fetch = jest.fn();

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Setup default timeout
jest.setTimeout(10000);

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    originalError.call(console, ...args);
  };
  console.warn = (...args) => {
    if (args[0]?.includes('Warning: React.createFactory()')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Add custom test environment properties
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset fetch mock
  fetch.mockClear();
});

// Mock AWS S3
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      upload: jest.fn().mockReturnThis(),
      promise: jest.fn().mockResolvedValue({ Location: 'https://example.com/image.jpg' }),
    })),
  };
});

// Mock DeepSeek API
jest.mock('./api/deepseekApi', () => ({
  generateImage: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [
        {
          url: 'https://example.com/generated.jpg'
        }
      ]
    }
  }),
  enhanceImage: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [
        {
          url: 'https://example.com/enhanced.jpg'
        }
      ]
    }
  }),
  generateLogo: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [
        {
          url: 'https://example.com/logo.jpg'
        }
      ]
    }
  }),
  generateVariations: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [
        {
          url: 'https://example.com/variation1.jpg'
        },
        {
          url: 'https://example.com/variation2.jpg'
        }
      ]
    }
  }),
  formatLogoPrompt: jest.fn().mockImplementation((config) => 
    `Create a professional ${config.style} logo design with the following specifications...`
  )
}));

// Setup event listener mock
beforeEach(() => {
  window.addEventListener = jest.fn();
  window.removeEventListener = jest.fn();
});

// Mock file reader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  onload: null,
  result: 'data:image/jpeg;base64,mock',
}));