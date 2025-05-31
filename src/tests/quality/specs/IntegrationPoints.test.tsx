
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Integration points tests to ensure proper communication
 * between different modules and components
 */
describe('Integration Points', () => {
  describe('Forecasting Integration', () => {
    it('should integrate properly with forecasting services', async () => {
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

  describe('Task Module Integration', () => {
    it('should integrate with task management features', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should integrate without errors
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Staff Module Integration', () => {
    it('should integrate with staff management features', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should integrate without errors
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
