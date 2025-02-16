import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import deepseekApi from './api/deepseekApi';
import App from './App';

// Mock the APIs
jest.mock('./api/deepseekApi');
jest.mock('./api/authApi');
jest.mock('./api/fabricApi');

// Mock response for deepseekApi
deepseekApi.generateLogo.mockResolvedValue({
  data: [{
    url: 'https://example.com/generated-logo.png'
  }]
});

// Wrapper component for providers
const AllTheProviders = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Navigation and Basic Rendering', () => {
    test('renders welcome page by default', () => {
      customRender(<App />);
      expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
    });

    test('renders navigation menu', () => {
      customRender(<App />);
      expect(screen.getByText(/Fabrics/i)).toBeInTheDocument();
      expect(screen.getByText(/Cart/i)).toBeInTheDocument();
    });

    test('navigates to logo generator page', async () => {
      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);
      
      await waitFor(() => {
        expect(screen.getByText(/Create your logo/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logo Generation', () => {
    test('generates logo with provided parameters', async () => {
      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        // Fill in logo generation form
        const textInput = screen.getByLabelText(/Logo Text/i);
        const colorInput = screen.getByLabelText(/Color/i);
        const sizeSelect = screen.getByLabelText(/Size/i);
        const styleSelect = screen.getByLabelText(/Style/i);
        const generateButton = screen.getByText(/Generate Logo/i);

        fireEvent.change(textInput, { target: { value: 'Test Company' } });
        fireEvent.change(colorInput, { target: { value: '#000000' } });
        fireEvent.change(sizeSelect, { target: { value: 'medium' } });
        fireEvent.change(styleSelect, { target: { value: 'modern' } });
        fireEvent.click(generateButton);
      });

      // Check if API was called with correct parameters
      expect(deepseekApi.generateLogo).toHaveBeenCalledWith({
        text: 'Test Company',
        color: '#000000',
        size: 'medium',
        style: 'modern'
      });

      // Check if generated logo is displayed
      await waitFor(() => {
        const generatedImage = screen.getByAltText(/Generated Logo/i);
        expect(generatedImage).toBeInTheDocument();
        expect(generatedImage.src).toBe('https://example.com/generated-logo.png');
      });
    });

    test('handles logo generation error', async () => {
      // Mock API error
      deepseekApi.generateLogo.mockRejectedValueOnce(new Error('Generation failed'));

      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const generateButton = screen.getByText(/Generate Logo/i);
        fireEvent.click(generateButton);
      });

      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate logo/i)).toBeInTheDocument();
      });
    });

    test('saves generated logo', async () => {
      const mockSaveLogo = jest.fn();
      deepseekApi.generateLogo.mockResolvedValueOnce({
        data: [{
          url: 'https://example.com/generated-logo.png'
        }]
      });

      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const generateButton = screen.getByText(/Generate Logo/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        const saveButton = screen.getByText(/Save Logo/i);
        fireEvent.click(saveButton);
      });

      expect(mockSaveLogo).toHaveBeenCalledWith({
        url: 'https://example.com/generated-logo.png',
        text: 'Test Company'
      });
    });
  });

  describe('Logo Customization', () => {
    test('updates logo preview on parameter change', async () => {
      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const textInput = screen.getByLabelText(/Logo Text/i);
        fireEvent.change(textInput, { target: { value: 'New Text' } });
      });

      expect(deepseekApi.generateLogo).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'New Text'
        })
      );
    });

    test('handles color picker changes', async () => {
      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const colorPicker = screen.getByLabelText(/Color/i);
        fireEvent.change(colorPicker, { target: { value: '#FF0000' } });
      });

      expect(deepseekApi.generateLogo).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#FF0000'
        })
      );
    });
  });

  describe('Logo History', () => {
    test('displays generated logo history', async () => {
      const mockHistory = [
        { id: 1, url: 'https://example.com/logo1.png', text: 'Logo 1' },
        { id: 2, url: 'https://example.com/logo2.png', text: 'Logo 2' }
      ];

      // Mock API to return history
      jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockHistory)
        })
      );

      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        mockHistory.forEach(logo => {
          expect(screen.getByAltText(logo.text)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API fails', async () => {
      deepseekApi.generateLogo.mockRejectedValueOnce(new Error('API Error'));

      customRender(<App />);
      const logoGenLink = screen.getByText(/Logo Generator/i);
      fireEvent.click(logoGenLink);

      await waitFor(() => {
        const generateButton = screen.getByText(/Generate Logo/i);
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Error generating logo/i)).toBeInTheDocument();
      });
    });
  });
});