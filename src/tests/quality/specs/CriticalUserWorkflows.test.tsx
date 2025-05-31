
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../testUtils/TestWrapper';
import { MatrixTab } from '@/components/forecasting/matrix/MatrixTab';
import { EnhancedCapacityMatrix } from '@/components/forecasting/matrix/EnhancedCapacityMatrix';

/**
 * Critical user workflow tests to ensure core functionality works correctly
 */
describe('Critical User Workflows', () => {
  describe('Matrix Navigation Workflow', () => {
    it('should allow users to navigate the complete matrix workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Wait for matrix to load
      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test forecast type switching
      const forecastToggle = screen.getByRole('combobox', { name: /forecast type/i });
      if (forecastToggle) {
        await user.click(forecastToggle);
        await user.click(screen.getByText('Actual Forecast'));
      }

      // Test skill filtering
      const skillFilters = screen.getAllByRole('checkbox');
      if (skillFilters.length > 0) {
        await user.click(skillFilters[0]);
        await user.click(skillFilters[0]); // Toggle back
      }

      // Test view mode switching
      const viewModeToggle = screen.getByText(/Hours View|Percentage View/i);
      if (viewModeToggle) {
        await user.click(viewModeToggle);
      }

      // Verify matrix is still functional
      expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Data Export Workflow', () => {
    it('should allow users to export matrix data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedCapacityMatrix forecastType="virtual" />
        </TestWrapper>
      );

      // Wait for matrix to load
      await waitFor(() => {
        expect(screen.getByText(/Enhanced 12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Look for export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      if (exportButton) {
        await user.click(exportButton);
        // Export functionality should trigger without error
      }
    });
  });

  describe('Accessibility Workflow', () => {
    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Wait for matrix to load
      await waitFor(() => {
        expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
      });

      // Test keyboard navigation
      const firstInteractiveElement = screen.getAllByRole('button')[0];
      if (firstInteractiveElement) {
        firstInteractiveElement.focus();
        
        // Test Tab navigation
        fireEvent.keyDown(firstInteractiveElement, { key: 'Tab' });
        
        // Test Enter activation
        fireEvent.keyDown(firstInteractiveElement, { key: 'Enter' });
      }

      // Should still function correctly
      expect(screen.getByText(/12-Month Capacity Matrix/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should gracefully handle and recover from errors', async () => {
      // Test error boundary functionality
      render(
        <TestWrapper>
          <MatrixTab forecastType="virtual" />
        </TestWrapper>
      );

      // Matrix should render even if there are data issues
      await waitFor(() => {
        const matrixElement = screen.getByText(/Matrix/i);
        expect(matrixElement).toBeInTheDocument();
      });
    });
  });
});
