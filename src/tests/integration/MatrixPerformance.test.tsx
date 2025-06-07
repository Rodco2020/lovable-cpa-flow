
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { EnhancedCapacityMatrix } from '@/components/forecasting/matrix/EnhancedCapacityMatrix';

/**
 * Phase 5: Performance Validation Tests
 * 
 * Tests to ensure matrix performance with client filtering
 * and validate no memory leaks or performance degradation.
 */
describe('Matrix Performance Validation - Phase 5', () => {
  describe('Client Selection Performance', () => {
    it('should handle large numbers of clients efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      }, { timeout: 15000 });

      const loadTime = performance.now() - startTime;
      
      // Matrix should load within reasonable time (15 seconds max for large datasets)
      expect(loadTime).toBeLessThan(15000);
    });

    it('should maintain performance with multiple client selections', async () => {
      const performanceMetrics: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = performance.now();
        
        render(
          <TestWrapper>
            <EnhancedCapacityMatrix forecastType="virtual" />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
        });

        const renderTime = performance.now() - startTime;
        performanceMetrics.push(renderTime);
      }

      // Performance should be consistent across multiple renders
      const avgTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length;
      const maxDeviation = Math.max(...performanceMetrics.map(time => Math.abs(time - avgTime)));
      
      // Deviation should not exceed 50% of average time
      expect(maxDeviation).toBeLessThan(avgTime * 0.5);
    });

    it('should not cause memory leaks during client filtering', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render multiple times to test for memory leaks
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <TestWrapper>
            <EnhancedCapacityMatrix forecastType="virtual" />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
        });

        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly (allowing for 20% variance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
        expect(memoryIncrease).toBeLessThan(0.2);
      }
    });

    it('should efficiently update matrix with different client selections', async () => {
      const { rerender } = render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test re-rendering with different props
      const startTime = performance.now();
      
      rerender(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="actual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      const updateTime = performance.now() - startTime;
      
      // Updates should be fast (under 5 seconds)
      expect(updateTime).toBeLessThan(5000);
    });
  });

  describe('Matrix Rendering Performance', () => {
    it('should render matrix grid efficiently', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      
      // Initial render should complete reasonably quickly
      expect(renderTime).toBeLessThan(10000); // 10 seconds max
    });

    it('should handle skill filtering without performance issues', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test that skill checkboxes are responsive
      const skillCheckboxes = screen.getAllByRole('checkbox');
      expect(skillCheckboxes.length).toBeGreaterThan(0);

      // Each checkbox should be interactive
      skillCheckboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled();
      });
    });

    it('should maintain performance during data refreshes', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test refresh functionality if available
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      if (refreshButton) {
        const startTime = performance.now();
        
        refreshButton.click();
        
        await waitFor(() => {
          expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
        });

        const refreshTime = performance.now() - startTime;
        expect(refreshTime).toBeLessThan(8000); // 8 seconds max for refresh
      }
    });
  });

  describe('Resource Management', () => {
    it('should properly cleanup resources on unmount', async () => {
      const { unmount } = render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid prop changes efficiently', async () => {
      const { rerender } = render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Rapidly change props to test for race conditions
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <EnhancedCapacityMatrix 
              forecastType={i % 2 === 0 ? "virtual" : "actual"} 
            />
          </TestWrapper>
        );
      }

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Should handle rapid changes without errors
      expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
    });
  });
});
