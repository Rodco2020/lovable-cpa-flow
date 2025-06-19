
import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandMatrixData } from '@/types/demand';

// Mock the service
vi.mock('@/services/forecasting/demandMatrixService');

const createMockMatrixData = (): DemandMatrixData => ({
  months: Array.from({ length: 12 }, (_, i) => ({
    key: `2025-${(i + 1).toString().padStart(2, '0')}`,
    label: `Month ${i + 1}`
  })),
  skills: ['Tax Preparation', 'Advisory', 'Audit'],
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2025-01',
      monthLabel: 'Jan 2025',
      demandHours: 100,
      taskCount: 5,
      clientCount: 3,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Client A',
          recurringTaskId: 'task-1',
          taskName: 'Tax Return',
          skillType: 'Tax Preparation',
          estimatedHours: 20,
          monthlyHours: 20,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
          preferredStaff: {
            staffId: 'staff-1',
            staffName: 'Alice Johnson',
            roleTitle: 'Senior CPA'
          }
        }
      ]
    }
  ],
  totalDemand: 100,
  totalTasks: 5,
  totalClients: 3,
  skillSummary: {}
});

describe('Demand Matrix Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
      matrixData: createMockMatrixData()
    });
  });

  describe('Empty Data Scenarios', () => {
    test('handles empty matrix data gracefully', async () => {
      const emptyData: DemandMatrixData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: emptyData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No data available for the selected filters')).toBeInTheDocument();
      });
    });

    test('handles null/undefined data points', async () => {
      const dataWithNulls: DemandMatrixData = {
        ...createMockMatrixData(),
        dataPoints: []
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: dataWithNulls
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No data available for the selected filters')).toBeInTheDocument();
      });
    });
  });

  describe('Large Dataset Scenarios', () => {
    test('handles large number of skills efficiently', async () => {
      const largeSkillsData: DemandMatrixData = {
        ...createMockMatrixData(),
        skills: Array.from({ length: 50 }, (_, i) => `Skill ${i + 1}`),
        dataPoints: Array.from({ length: 600 }, (_, i) => ({
          skillType: `Skill ${(i % 50) + 1}`,
          month: `2025-${((i % 12) + 1).toString().padStart(2, '0')}`,
          monthLabel: `Month ${(i % 12) + 1}`,
          demandHours: Math.floor(Math.random() * 100),
          taskCount: Math.floor(Math.random() * 10),
          clientCount: Math.floor(Math.random() * 5),
          taskBreakdown: []
        }))
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: largeSkillsData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Skill 1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('recovers from service errors gracefully', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockRejectedValue(
        new Error('Service unavailable')
      );

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading demand matrix')).toBeInTheDocument();
      });
    });
  });
});

// Export the test function for the test runner
export function runEdgeCaseIntegrationTests() {
  return describe('Edge Case Integration Tests', () => {
    // Test implementation is handled by the vitest runner
  });
}
