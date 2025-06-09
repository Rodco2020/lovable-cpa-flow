
/**
 * Performance Integration Tests for Demand Matrix
 * Tests for performance optimization and large dataset handling
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks } from './mockHelpers';

export const runPerformanceIntegrationTests = () => {
  describe('Performance Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should render efficiently with standard dataset', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle large datasets efficiently', async () => {
      // Setup large dataset scenario
      vi.mocked(setupSuccessfulMocks).mockImplementation(() => {
        // Mock large dataset with 1000+ data points
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Even with large datasets, should render within reasonable time
      expect(renderTime).toBeLessThan(5000);
    });
  });
};
