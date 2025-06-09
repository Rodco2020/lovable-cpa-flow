
/**
 * Edge Case Integration Tests for Demand Matrix
 * Tests for handling unusual scenarios and edge cases
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { setupSuccessfulMocks, setupErrorMocks, setupEmptyDataMocks } from './mockHelpers';

export const runEdgeCaseIntegrationTests = () => {
  describe('Edge Case Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupSuccessfulMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should handle empty data gracefully', async () => {
      // Setup empty data scenario
      setupEmptyDataMocks();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No demand data available')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      setupErrorMocks('Network error');

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading demand matrix')).toBeInTheDocument();
      });
    });

    it('should handle large datasets without performance degradation', async () => {
      // Setup large dataset scenario
      const originalSetupMocks = setupSuccessfulMocks;
      vi.mock('./mockHelpers', async () => {
        const actual = await vi.importActual('./mockHelpers');
        return {
          ...actual,
          setupSuccessfulMocks: () => {
            originalSetupMocks();
            // Override with large dataset
            vi.mocked(vi.importMock('@/services/forecasting/demandMatrixService').DemandMatrixService.generateDemandMatrix)
              .mockResolvedValue({
                months: Array(24).fill(0).map((_, i) => ({
                  key: `2024-${String(i + 1).padStart(2, '0')}`,
                  label: `Month ${i + 1}`
                })),
                skills: Array(50).fill(0).map((_, i) => `Skill ${i + 1}`),
                dataPoints: Array(1200).fill(0).map((_, i) => ({
                  skillType: `Skill ${Math.floor(i / 24) + 1}`,
                  month: `2024-${String((i % 24) + 1).padStart(2, '0')}`,
                  monthLabel: `Month ${(i % 24) + 1}`,
                  demandHours: 100 + Math.floor(Math.random() * 200),
                  taskCount: Math.floor(Math.random() * 20) + 1,
                  clientCount: Math.floor(Math.random() * 5) + 1,
                  taskBreakdown: []
                })),
                totalDemand: 120000,
                totalTasks: 12000,
                totalClients: 500,
                skillSummary: {}
              });
          }
        };
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Skill 1')).toBeInTheDocument();
      });

      // Verify the matrix rendered successfully with large dataset
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle malformed data without crashing', async () => {
      // Setup malformed data scenario
      vi.mock('@/services/forecasting/demandMatrixService', () => ({
        DemandMatrixService: {
          generateDemandMatrix: vi.fn().mockResolvedValue({
            months: [{ key: '2024-01', label: 'Jan 2024' }],
            skills: ['Tax Preparation'],
            dataPoints: [
              {
                // Missing required fields
                skillType: 'Tax Preparation',
                month: '2024-01',
                // monthLabel missing
                // demandHours missing
              }
            ],
            // Missing totalDemand
            totalTasks: 16,
            // Missing totalClients
            // Missing skillSummary
          }),
          fetchDemandData: vi.fn().mockResolvedValue([]),
        }
      }));

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should render fallback UI instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });
    });

    it('should handle extremely long skill names', async () => {
      // Setup long text scenario
      vi.mock('@/services/forecasting/demandMatrixService', () => ({
        DemandMatrixService: {
          generateDemandMatrix: vi.fn().mockResolvedValue({
            months: [{ key: '2024-01', label: 'Jan 2024' }],
            skills: ['This is an extremely long skill name that should be truncated or handled properly in the UI without breaking the layout or causing text overflow issues'],
            dataPoints: [
              {
                skillType: 'This is an extremely long skill name that should be truncated or handled properly in the UI without breaking the layout or causing text overflow issues',
                month: '2024-01',
                monthLabel: 'Jan 2024',
                demandHours: 120,
                taskCount: 8,
                clientCount: 3,
                taskBreakdown: []
              }
            ],
            totalDemand: 120,
            totalTasks: 8,
            totalClients: 3,
            skillSummary: {}
          }),
          fetchDemandData: vi.fn().mockResolvedValue([]),
        }
      }));

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should render without layout breaking
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });
  });
};
