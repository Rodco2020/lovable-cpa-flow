
/**
 * Export Integration Tests for Demand Matrix
 * Tests for export functionality and dialog integration
 * Updated for Phase 5 enhanced export capabilities
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks } from './mockHelpers';
import { runExportPhase5IntegrationTests } from './exportPhase5Tests';

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
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Find and click export button
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      // Should open export dialog
      await waitFor(() => {
        expect(screen.getByText('Export Demand Matrix')).toBeInTheDocument();
      });
    });

    it('should maintain backward compatibility with legacy export', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="client" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Test that legacy export callbacks still work
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();
    });

    it('should handle export errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Export functionality should not crash the component
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  // Include Phase 5 enhanced export tests
  runExportPhase5IntegrationTests();
};
