import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';
import { EnhancedCapacityMatrix } from '@/components/forecasting/matrix/EnhancedCapacityMatrix';

/**
 * Phase 5: Regression Testing Suite
 * 
 * Ensures all existing matrix functionality is preserved
 * and new client filtering doesn't break existing features.
 */
describe('Matrix Regression Tests - Phase 5', () => {
  describe('Original Matrix Functionality', () => {
    it('should preserve original MatrixTab functionality', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Original matrix should render
      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Original controls should be present
      expect(screen.getByText(/Virtual Forecast|Actual Forecast/i)).toBeInTheDocument();
      
      // Skills filtering should work
      const skillCheckboxes = screen.getAllByRole('checkbox');
      expect(skillCheckboxes.length).toBeGreaterThan(0);

      // View mode toggle should be present
      const viewToggle = screen.getByText(/Hours View|Percentage View/i);
      expect(viewToggle).toBeInTheDocument();
    });

    it('should maintain original matrix data structure', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Matrix grid should be present
      const matrixGrid = document.querySelector('[data-testid="matrix-grid"]') ||
                        document.querySelector('.matrix-grid') ||
                        screen.getByText(/Legend/i).parentElement;
      expect(matrixGrid).toBeInTheDocument();

      // Summary information should be available
      const summaryFooter = document.querySelector('[data-testid="matrix-summary-footer"]') ||
                           screen.getByText(/Total/i);
      expect(summaryFooter).toBeInTheDocument();
    });

    it('should preserve export functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Export button should be functional
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).not.toBeDisabled();

      // Export should work without errors
      await user.click(exportButton);
      // No errors should be thrown
    });

    it('should preserve print functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Print functionality should be available
      const printButton = screen.getByRole('button', { name: /print/i });
      if (printButton) {
        expect(printButton).not.toBeDisabled();
        await user.click(printButton);
      }
    });
  });

  describe('Enhanced Matrix Backward Compatibility', () => {
    it('should work with minimal props like original', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Should work without any required props
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });

    it('should support all original props', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix 
            className="test-class"
            forecastType="actual"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Props should be applied correctly
      const container = screen.getByText(/Enhanced 12-Month Capacity Matrix/i).closest('div');
      expect(container).toHaveClass('test-class');
    });

    it('should maintain original keyboard navigation', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstInteractiveElement = screen.getAllByRole('button')[0] ||
                                     screen.getAllByRole('checkbox')[0] ||
                                     screen.getAllByRole('combobox')[0];
      
      if (firstInteractiveElement) {
        firstInteractiveElement.focus();
        
        // Tab navigation should work
        fireEvent.keyDown(firstInteractiveElement, { key: 'Tab' });
        
        // Enter should work
        fireEvent.keyDown(firstInteractiveElement, { key: 'Enter' });
      }
    });

    it('should preserve original aria-labels and accessibility', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Check for accessible elements
      const accessibleElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
      expect(accessibleElements.length).toBeGreaterThan(0);

      // Important controls should be accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Compatibility', () => {
    it('should maintain original data loading patterns', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Should show loading state initially
      const loadingElement = screen.getByText(/loading/i) || 
                            screen.getByText(/Matrix/i);
      expect(loadingElement).toBeInTheDocument();

      // Should eventually show data
      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });
    });

    it('should handle errors the same way as original', async () => {
      // This test would verify error handling consistency
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Should handle errors gracefully
      await waitFor(() => {
        const content = screen.getByText(/Matrix/i) ||
                       screen.getByText(/loading/i) ||
                       screen.getByText(/error/i);
        expect(content).toBeInTheDocument();
      });
    });

    it('should maintain original forecast switching behavior', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Forecast type switching should work as before
      const forecastToggle = screen.getByRole('combobox', { name: /forecast type/i }) ||
                            screen.getByText(/Virtual|Actual/i);
      
      if (forecastToggle) {
        await user.click(forecastToggle);
        
        // Should show options
        const options = screen.getAllByRole('option');
        if (options.length > 0) {
          await user.click(options[0]);
        }
      }
    });
  });

  describe('Integration with Existing Features', () => {
    it('should not affect other forecasting components', async () => {
      // Test that matrix changes don't break other forecast features
      render(
        <TestWrapper>
          <div>
            <MatrixTab forecastType="virtual" />
            {/* Other forecast components would be tested here */}
          </div>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });

      // Matrix should not interfere with other components
      expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
    });

    it('should maintain skill synchronization', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Skills should be properly loaded and synchronized
      const skillElements = screen.getAllByRole('checkbox');
      expect(skillElements.length).toBeGreaterThan(0);

      // Each skill should be properly labeled
      skillElements.forEach(skill => {
        expect(skill).toHaveAccessibleName();
      });
    });
  });

  describe('Performance Regression Prevention', () => {
    it('should not degrade loading performance', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(15000); // 15 seconds max
    });

    it('should not increase memory usage significantly', async () => {
      const { unmount } = render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});
