
/**
 * Export Integration Tests for Demand Matrix
 * Tests for export functionality and dialog integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks } from './mockHelpers';

export const runExportIntegrationTests = () => {
  describe('Export Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should integrate export functionality with matrix data', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Find and click export button
      const exportButton = screen.getByText(/Export/i);
      await user.click(exportButton);

      // Should open export dialog
      await waitFor(() => {
        expect(screen.getByText(/Export Demand Matrix/i)).toBeInTheDocument();
      });
    });
  });
};
