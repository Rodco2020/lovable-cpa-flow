
import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

// Mock the service
vi.mock('@/services/forecasting/demandMatrixService');

const mockMatrixData = {
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
            roleTitle: 'Senior CPA',
            assignmentType: 'preferred' as const
          }
        },
        {
          clientId: 'client-2',
          clientName: 'Client B',
          recurringTaskId: 'task-2',
          taskName: 'Tax Advisory',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          monthlyHours: 15,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
          // No preferred staff
        }
      ]
    }
  ],
  totalDemand: 100,
  totalTasks: 5,
  totalClients: 3,
  skillSummary: {}
};

describe('Filter Combinations Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
      matrixData: mockMatrixData
    });
  });

  describe('Single Filter Operations', () => {
    test('applies skill filter only', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply skill filter
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Tax Preparation']
          })
        );
      });
    });

    test('applies client filter only', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply client filter
      const clientFilter = screen.getByLabelText('Filter by clients');
      await user.click(clientFilter);
      await user.click(screen.getByText('Client A'));

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            clients: ['client-1']
          })
        );
      });
    });

    test('applies preferred staff filter only', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply preferred staff filter
      const staffFilter = screen.getByText('Alice Johnson');
      await user.click(staffFilter);

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            preferredStaff: {
              staffIds: ['staff-1'],
              includeUnassigned: false,
              showOnlyPreferred: false
            }
          })
        );
      });
    });
  });

  describe('Multiple Filter Combinations', () => {
    test('combines skill and client filters', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply skill filter
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      // Apply client filter
      const clientFilter = screen.getByLabelText('Filter by clients');
      await user.click(clientFilter);
      await user.click(screen.getByText('Client A'));

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Tax Preparation'],
            clients: ['client-1']
          })
        );
      });
    });

    test('combines skill and preferred staff filters', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply skill filter
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Advisory'));

      // Apply preferred staff filter
      const staffFilter = screen.getByText('Alice Johnson');
      await user.click(staffFilter);

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Advisory'],
            preferredStaff: {
              staffIds: ['staff-1'],
              includeUnassigned: false,
              showOnlyPreferred: false
            }
          })
        );
      });
    });

    test('combines all three filter types', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply skill filter
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      // Apply client filter
      const clientFilter = screen.getByLabelText('Filter by clients');
      await user.click(clientFilter);
      await user.click(screen.getByText('Client A'));

      // Apply preferred staff filter
      const staffFilter = screen.getByText('Alice Johnson');
      await user.click(staffFilter);

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenLastCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Tax Preparation'],
            clients: ['client-1'],
            preferredStaff: {
              staffIds: ['staff-1'],
              includeUnassigned: false,
              showOnlyPreferred: false
            }
          })
        );
      });
    });
  });

  describe('Filter State Management', () => {
    test('maintains filter state across re-renders', async () => {
      const { rerender } = render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply filters
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      // Re-render component
      rerender(
        <TestWrapper>
          <DemandMatrix groupingMode="client" />
        </TestWrapper>
      );

      // Filters should be maintained
      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Tax Preparation']
          })
        );
      });
    });

    test('clears filters correctly', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply filters
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      // Clear filters
      const clearButton = screen.getByText('Clear Filters');
      await user.click(clearButton);

      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: [],
            clients: [],
            preferredStaff: {
              staffIds: [],
              includeUnassigned: false,
              showOnlyPreferred: false
            }
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty filter results', async () => {
      // Mock empty results
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: {
          ...mockMatrixData,
          dataPoints: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0
        }
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

    test('handles service errors gracefully', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockRejectedValue(
        new Error('Service unavailable')
      );

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading matrix data')).toBeInTheDocument();
      });
    });

    test('handles invalid filter combinations', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Apply conflicting filters (show only preferred + include unassigned)
      const showOnlyCheckbox = screen.getByLabelText('Show only tasks with preferred staff');
      await user.click(showOnlyCheckbox);

      const includeUnassignedCheckbox = screen.getByLabelText('Include unassigned tasks');
      await user.click(includeUnassignedCheckbox);

      // Should handle the conflict gracefully
      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalled();
      });
    });
  });
});
