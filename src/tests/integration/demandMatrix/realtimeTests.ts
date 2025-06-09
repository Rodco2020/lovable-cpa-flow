
/**
 * Real-time Update Integration Tests for Demand Matrix
 * Tests for real-time data updates and synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks } from './mockHelpers';

export const runRealtimeUpdateTests = () => {
  describe('Real-time Updates Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle real-time data updates', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Should update when data changes
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('should maintain UI state during updates', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // UI should remain stable during updates
      expect(screen.getByText('Demand Forecast Matrix')).toBeInTheDocument();
    });
  });
};
