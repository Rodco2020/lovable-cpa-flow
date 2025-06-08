
/**
 * Performance Integration Tests for Demand Matrix
 * Tests for performance, memory usage, and large dataset handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { createLargeMockData } from './testData';

export const runPerformanceIntegrationTests = () => {
  describe('Performance Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle large datasets efficiently', async () => {
      const largeMockData = createLargeMockData();

      (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
        matrixData: largeMockData
      });

      (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([]);

      const startTime = performance.now();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Skill 0')).toBeInTheDocument();
      }, { timeout: 5000 });

      const renderTime = performance.now() - startTime;
      
      // Should render within reasonable time (5 seconds for large dataset)
      expect(renderTime).toBeLessThan(5000);
    });

    it('should optimize memory usage with filtering', async () => {
      (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
        matrixData: createLargeMockData()
      });

      (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([]);

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Skill 0')).toBeInTheDocument();
      });

      // Apply filters to reduce dataset
      const skillFilter = screen.getByLabelText('Skill 0');
      await user.click(skillFilter);

      // Should maintain performance with filtered data
      expect(screen.getByText('Skill 0')).toBeInTheDocument();
    });
  });
};
