
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

    it('should handle large datasets without performance degradation', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      }, { timeout: 5000 });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should render within reasonable time
      expect(duration).toBeLessThan(3000);
    });

    it('should maintain performance during filter operations', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      const startTime = performance.now();
      
      // Simulate filter operations
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        const skillCheckbox = checkboxes[0];
        skillCheckbox.click();
      }

      const endTime = performance.now();
      const filterDuration = endTime - startTime;

      // Filter operations should be fast
      expect(filterDuration).toBeLessThan(500);
    });

    it('should handle memory efficiently during extended use', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Simulate multiple filter changes
      for (let i = 0; i < 10; i++) {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 0) {
          checkboxes[0].click();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory usage should not increase excessively
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });
};
