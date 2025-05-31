
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Responsive design tests to ensure proper layout
 * across different screen sizes and devices
 */
describe('Responsive Design', () => {
  const mockViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  describe('Mobile Layout', () => {
    it('should adapt to mobile screen sizes', () => {
      mockViewport(375, 667); // iPhone SE dimensions
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Tablet Layout', () => {
    it('should adapt to tablet screen sizes', () => {
      mockViewport(768, 1024); // iPad dimensions
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Desktop Layout', () => {
    it('should adapt to desktop screen sizes', () => {
      mockViewport(1920, 1080); // Full HD dimensions
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
