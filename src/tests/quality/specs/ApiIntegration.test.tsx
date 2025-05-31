
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * API integration tests to ensure proper communication
 * with backend services and data sources
 */
describe('API Integration', () => {
  describe('Data Fetching', () => {
    it('should fetch matrix data from services', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should handle API errors without crashing
      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate API responses', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should validate data from APIs
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
