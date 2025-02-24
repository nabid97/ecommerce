import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { configure } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocks
fetchMock.enableMocks();

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  })),
  defaults: {
    baseURL: '',
    headers: {
      common: {}
    }
  }
}));

// Mock APIs
jest.mock('./api/authApi', () => ({
  login: jest.fn().mockResolvedValue({
    user: { id: '1', email: 'test@example.com' },
    token: 'mock-token'
  }),
  logout: jest.fn().mockResolvedValue({}),
  register: jest.fn().mockResolvedValue({
    user: { id: '1', email: 'test@example.com' },
    token: 'mock-token'
  }),
  getUser: jest.fn().mockResolvedValue({
    user: { id: '1', email: 'test@example.com' }
  })
}));

jest.mock('./api/deepseekApi', () => ({
  generateLogo: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [{ url: 'https://example.com/logo.jpg' }]
    }
  }),
  generateImage: jest.fn().mockResolvedValue({
    data: {
      created: Date.now(),
      data: [{ url: 'https://example.com/generated.jpg' }]
    }
  })
}));

jest.mock('./api/fabricApi', () => ({
  getFabrics: jest.fn().mockResolvedValue([
    { id: '1', name: 'Cotton', price: 10 },
    { id: '2', name: 'Silk', price: 20 }
  ])
}));

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock browser APIs
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

global.URL.createObjectURL = jest.fn();

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

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
  }))
});

// Setup fetch mock
beforeEach(() => {
  fetchMock.resetMocks();
  fetchMock.mockResponse(JSON.stringify({ success: true }));
});

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

// Set longer timeout for tests
jest.setTimeout(10000);