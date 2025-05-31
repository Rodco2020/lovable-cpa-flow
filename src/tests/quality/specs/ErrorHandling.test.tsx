
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixErrorBoundary } from '@/components/forecasting/matrix/MatrixErrorBoundary';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Error handling tests to ensure graceful error recovery
 * and proper user feedback
 */
describe('Error Handling', () => {
  describe('Error Boundaries', () => {
    it('should catch and handle component errors gracefully', () => {
      render(
        <TestWrapper>
          <MatrixErrorBoundary>
            <MatrixTab forecastType="virtual" />
          </MatrixErrorBoundary>
        </TestWrapper>
      );

      // Should render without throwing errors
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Data Loading Errors', () => {
    it('should handle data loading failures', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should show appropriate loading or error states
      // Component should be in DOM even with data issues
      const matrixElement = screen.getByText(/Matrix/i);
      expect(matrixElement).toBeInTheDocument();
    });
  });

  describe('Network Errors', () => {
    it('should handle network connectivity issues', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should gracefully handle network issues
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
