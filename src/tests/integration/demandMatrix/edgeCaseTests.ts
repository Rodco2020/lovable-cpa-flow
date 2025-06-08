
/**
 * Edge Case Integration Tests for Demand Matrix
 * Tests for error handling, empty states, and validation scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { 
  setupValidationErrorMocks, 
  setupNetworkRetryMocks 
} from './mockHelpers';
import { createEmptyMockData } from './testData';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

export const runEdgeCaseIntegrationTests = () => {
  describe('Edge Cases Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle empty data gracefully', async () => {
      const emptyMockData = createEmptyMockData();

      (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
        matrixData: emptyMockData
      });

      (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([]);

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No Demand Data Available')).toBeInTheDocument();
      });

      // Should provide helpful guidance
      expect(screen.getByText('Manage Client Tasks')).toBeInTheDocument();
    });

    it('should handle invalid data with validation', async () => {
      setupValidationErrorMocks([
        'Invalid data format detected',
        'Missing required fields'
      ]);

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Data Quality Issues Detected')).toBeInTheDocument();
      });

      // Should display validation issues
      expect(screen.getByText('Invalid data format detected')).toBeInTheDocument();
    });

    it('should handle network errors with retry capability', async () => {
      setupNetworkRetryMocks();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText('Error loading demand matrix')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });
    });
  });
};
