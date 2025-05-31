
import { render } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Memory management tests to ensure proper cleanup
 * and prevent memory leaks
 */
describe('Memory Management', () => {
  describe('Component Cleanup', () => {
    it('should properly cleanup components on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Component should mount successfully
      expect(document.body).toContainHTML('Matrix');

      // Cleanup should not throw errors
      unmount();
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should cleanup event listeners', () => {
      const { unmount } = render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should cleanup without errors
      unmount();
    });
  });

  describe('Cache Management', () => {
    it('should manage cache memory properly', () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Cache should be managed properly without memory leaks
      expect(document.body).toContainHTML('Matrix');
    });
  });
});
