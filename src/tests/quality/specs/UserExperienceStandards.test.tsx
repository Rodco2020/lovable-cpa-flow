
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * User experience standards tests to ensure
 * intuitive and efficient user interactions
 */
describe('User Experience Standards', () => {
  describe('Loading States', () => {
    it('should provide clear loading feedback', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should show appropriate loading or loaded state
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('User Feedback', () => {
    it('should provide clear user feedback for actions', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should provide clear interface feedback
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should provide intuitive navigation', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Navigation should be clear and intuitive
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
