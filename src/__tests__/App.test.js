import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import deepseekApi from '../api/deepseekApi';
import { authApi } from '../api/authApi';
import { fabricApi } from '../api/fabricApi';
import App from '../App';

// Mock the APIs
jest.mock('../api/deepseekApi');
jest.mock('../api/authApi');
jest.mock('../api/fabricApi');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Mock response for APIs
deepseekApi.generateLogo.mockResolvedValue({
  data: {
    created: Date.now(),
    data: [{ url: 'https://example.com/generated-logo.png' }]
  }
});

authApi.login.mockResolvedValue({
  token: 'mock-token',
  user: { id: '1', email: 'test@example.com' }
});

fabricApi.getFabrics.mockResolvedValue([
  { id: '1', name: 'Cotton', price: 10 },
  { id: '2', name: 'Silk', price: 20 }
]);

// Wrapper component for providers
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Basic Navigation and Rendering', () => {
    test('renders welcome page by default', () => {
      customRender(<App />);
      expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
    });

    test('renders navigation menu', () => {
      customRender(<App />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('fabrics-link')).toBeInTheDocument();
    });

    test('navigates to fabric page', async () => {
      customRender(<App />);
      const fabricLink = screen.getByTestId('fabrics-link');
      fireEvent.click(fabricLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('fabrics-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    const mockNavigate = jest.fn();
  
    beforeEach(() => {
      const { useNavigate } = require('react-router-dom');
      useNavigate.mockImplementation(() => mockNavigate);
    });
  
    test('shows login button when not authenticated', () => {
      customRender(<App />);
      expect(screen.getByTestId('login-link')).toBeInTheDocument();
    });
  
    test('handles successful login', async () => {
      customRender(<App />);
      
      const loginLink = screen.getByTestId('login-link');
      fireEvent.click(loginLink);
  
      await waitFor(() => {
        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      });
  
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const rememberMeCheckbox = screen.getByLabelText(/Remember me/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(rememberMeCheckbox);
  
      const submitButton = screen.getByRole('button', { name: /Sign in$/i });
      fireEvent.click(submitButton);
  
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  
    test('handles login error', async () => {
      authApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));
  
      customRender(<App />);
      
      const loginLink = screen.getByTestId('login-link');
      fireEvent.click(loginLink);
  
      await waitFor(() => {
        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      });
  
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
  
      const submitButton = screen.getByRole('button', { name: /Sign in$/i });
      fireEvent.click(submitButton);
  
      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });
  
    test('navigates to registration page', async () => {
      customRender(<App />);
      
      const loginLink = screen.getByTestId('login-link');
      fireEvent.click(loginLink);
  
      const registerLink = screen.getByText(/create a new account/i);
      fireEvent.click(registerLink);
  
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/register');
      });
    });
  });

  describe('Cart Functionality', () => {
    test('shows empty cart message initially', async () => {
      customRender(<App />);
      const cartLink = screen.getByTestId('cart-link');
      fireEvent.click(cartLink);

      await waitFor(() => {
        expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image Generation', () => {
    test('generates logo successfully', async () => {
      customRender(<App />);
      const logoGenLink = screen.getByTestId('logo-generator-link');
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const textInput = screen.getByLabelText(/Logo Text/i);
        const generateButton = screen.getByText(/Generate Logo/i);

        fireEvent.change(textInput, { target: { value: 'Test Company' } });
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('img', { name: /Generated Logo/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message on API failure', async () => {
      fabricApi.getFabrics.mockRejectedValueOnce(new Error('API Error'));

      customRender(<App />);
      const fabricLink = screen.getByTestId('fabrics-link');
      fireEvent.click(fabricLink);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });
});