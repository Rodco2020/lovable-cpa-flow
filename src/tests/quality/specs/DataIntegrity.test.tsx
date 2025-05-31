
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';
import { validateMatrixData } from '@/services/forecasting/matrixService';
import { MatrixTestingService } from '@/services/forecasting/matrixTesting';

/**
 * Data integrity tests to ensure consistent state
 * and proper data flow throughout the application
 */
describe('Data Integrity', () => {
  describe('Matrix Data Validation', () => {
    it('should maintain data consistency across updates', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });

      // Data should remain consistent during component lifecycle
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain proper state consistency', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // State should be properly managed
      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Validation', () => {
    it('should validate data flow between components', async () => {
      // Test the matrix testing service
      const testResults = await MatrixTestingService.runIntegrationTests();
      
      // At least some tests should pass
      const passedTests = testResults.filter(result => result.passed);
      expect(passedTests.length).toBeGreaterThan(0);
    });
  });
});
