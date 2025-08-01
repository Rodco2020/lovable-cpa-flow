
/**
 * Component Integration Tests for Demand Matrix
 * Tests for basic component functionality and integration
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks, setupErrorMocks } from './mockHelpers';

export const runComponentIntegrationTests = () => {
  describe('Component Integration', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should integrate with forecasting dashboard navigation', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      expect(screen.getByText('Demand Forecast Matrix')).toBeInTheDocument();
    });

    it('should handle grouping mode changes seamlessly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      rerender(
        <TestWrapper>
          <DemandMatrix groupingMode="client" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Client 1')).toBeInTheDocument();
      });
    });

    it('should integrate with existing error boundaries', async () => {
      setupErrorMocks('Service unavailable');

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading demand matrix')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });
  });
};
