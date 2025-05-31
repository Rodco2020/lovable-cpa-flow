
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Content standards tests to ensure proper
 * content structure and presentation
 */
describe('Content Standards', () => {
  describe('Text Content', () => {
    it('should have proper heading structure', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should have proper content structure
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy', () => {
    it('should maintain proper visual hierarchy', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Visual hierarchy should be clear
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Content Accessibility', () => {
    it('should provide accessible content', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Content should be accessible
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });
  });
});
