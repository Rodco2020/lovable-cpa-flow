
/**
 * Accessibility Integration Tests for Demand Matrix
 * Tests for ARIA compliance, keyboard navigation, and screen reader support
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks } from './mockHelpers';

export const runAccessibilityIntegrationTests = () => {
  describe('Accessibility Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should maintain accessibility standards', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Should have proper ARIA labels
      const matrixElement = screen.getByRole('grid');
      expect(matrixElement).toBeInTheDocument();

      // Should support keyboard navigation
      const firstCell = screen.getByText(/120/);
      firstCell.focus();
      expect(document.activeElement).toBe(firstCell);
    });
  });
};
