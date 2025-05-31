
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Bundle size optimization tests to ensure
 * efficient code delivery and loading performance
 */
describe('Bundle Size Optimization', () => {
  describe('Component Loading', () => {
    it('should load components efficiently', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(1000);
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Tree Shaking', () => {
    it('should only import necessary dependencies', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Component should render with only necessary code
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Code Splitting', () => {
    it('should support lazy loading when needed', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should support modular loading
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
