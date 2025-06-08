
/**
 * Real-time Updates Integration Tests for Demand Matrix
 * Tests for event-driven updates and real-time functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { setupSuccessfulMocks, triggerTaskEvent, getEventHandler } from './mockHelpers';

export const runRealtimeUpdateTests = () => {
  describe('Real-time Updates Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should respond to task modification events', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      triggerTaskEvent('task.scheduled', { taskId: 'task-1', clientId: 'client-1' });

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle client-assigned task changes', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      triggerTaskEvent('availability.updated', { staffId: 'staff-1' });

      // Should maintain demand data (not affected by availability changes)
      expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
    });
  });
};
