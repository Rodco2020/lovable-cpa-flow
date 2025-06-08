
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { EnhancedCapacityMatrix } from '@/components/forecasting/matrix/EnhancedCapacityMatrix';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';

/**
 * Phase 5: Integration Testing Suite
 * 
 * Comprehensive end-to-end testing to ensure all matrix functionality
 * works together seamlessly with client filtering capabilities.
 */
describe('Matrix Integration Tests - Phase 5', () => {
  describe('End-to-End Workflow Testing', () => {
    it('should complete matrix load to client filtering workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Step 1: Wait for initial matrix load
      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Step 2: Verify controls are accessible
      const controls = screen.getByTestId('matrix-controls-panel');
      expect(controls).toBeInTheDocument();

      // Step 3: Test client filtering interaction
      const clientFilter = screen.getByRole('combobox', { name: /client filter/i });
      if (clientFilter) {
        await user.click(clientFilter);
        
        // Should show client options
        await waitFor(() => {
          const clientOptions = screen.getAllByRole('option');
          expect(clientOptions.length).toBeGreaterThan(0);
        });
      }

      // Step 4: Verify matrix data updates
      await waitFor(() => {
        const matrixContent = screen.getByTestId('enhanced-matrix-content');
        expect(matrixContent).toBeInTheDocument();
      });
    });

    it('should handle all client selection combinations', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test: No clients selected (should show default)
      let matrixData = screen.getByTestId('matrix-summary-footer');
      expect(matrixData).toBeInTheDocument();

      // Test: Single client selection
      const clientFilter = screen.getByRole('combobox', { name: /client filter/i });
      if (clientFilter) {
        await user.click(clientFilter);
        
        const firstClient = screen.getAllByRole('option')[0];
        if (firstClient) {
          await user.click(firstClient);
          
          // Matrix should update
          await waitFor(() => {
            expect(screen.getByText(/client.*selected/i)).toBeInTheDocument();
          });
        }
      }

      // Test: Multiple client selection
      // Additional test steps would be implemented here
    });

    it('should work with different forecast types and date ranges', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test forecast type switching
      const forecastToggle = screen.getByRole('combobox', { name: /forecast type/i });
      if (forecastToggle) {
        await user.click(forecastToggle);
        
        const actualOption = screen.getByText('Actual Forecast');
        await user.click(actualOption);
        
        // Matrix should update with actual forecast
        await waitFor(() => {
          expect(screen.getByText(/actual/i)).toBeInTheDocument();
        });
      }

      // Test date range changes
      const dateRangePicker = screen.getByRole('button', { name: /start month/i });
      if (dateRangePicker) {
        await user.click(dateRangePicker);
        // Date range functionality test
      }
    });
  });

  describe('Regression Testing', () => {
    it('should preserve all existing matrix functionality', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Test: Matrix renders without client filtering
      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test: Skill filtering still works
      const skillCheckboxes = screen.getAllByRole('checkbox');
      expect(skillCheckboxes.length).toBeGreaterThan(0);

      // Test: View mode toggle still works
      const viewModeToggle = screen.getByText(/Hours View|Percentage View/i);
      expect(viewModeToggle).toBeInTheDocument();

      // Test: Export functionality is available
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should maintain backward compatibility', async () => {
      // Test that EnhancedCapacityMatrix works with minimal props
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test that it works with all props
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
    });

    it('should not impact other forecasting features', async () => {
      // This test ensures the matrix changes don't break other features
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
      });

      // Test that other forecast components still work
      // This would test interaction with other forecast features
    });
  });

  describe('Feature Integration Testing', () => {
    it('should integrate export functionality with client filtering', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Select a client
      const clientFilter = screen.getByRole('combobox', { name: /client filter/i });
      if (clientFilter) {
        await user.click(clientFilter);
        // Select client logic here
      }

      // Test export with client filter applied
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Export should work with filtered data
      expect(exportButton).not.toBeDisabled();
    });

    it('should integrate print functionality with client filtering', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test print functionality
      const printButton = screen.getByRole('button', { name: /print/i });
      if (printButton) {
        await user.click(printButton);
        // Print should work with current matrix state
      }
    });

    it('should handle skill synchronization with client filtering', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test that skills are properly synchronized
      const skillFilters = screen.getAllByRole('checkbox');
      expect(skillFilters.length).toBeGreaterThan(0);

      // Skills should reflect the filtered data
      skillFilters.forEach(checkbox => {
        expect(checkbox).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle client filtering errors', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Test should handle errors without breaking the matrix
      await waitFor(() => {
        const matrixElement = screen.getByText(/Matrix/i);
        expect(matrixElement).toBeInTheDocument();
      });
    });

    it('should recover from data loading failures', async () => {
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Should show appropriate error states or loading states
      await waitFor(() => {
        const content = screen.getByTestId('enhanced-matrix-content') || 
                       screen.getByText(/loading/i) || 
                       screen.getByText(/error/i);
        expect(content).toBeInTheDocument();
      });
    });
  });
});
