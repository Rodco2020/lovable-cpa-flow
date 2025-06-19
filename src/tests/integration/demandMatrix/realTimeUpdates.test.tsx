
/**
 * Real-time Updates Integration Tests for Demand Matrix
 * Tests for handling dynamic data changes and real-time scenarios
 */

import React from 'react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

vi.mock('@/services/forecasting/demandMatrixService');

describe('Real-time Updates Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Staff Assignment Changes', () => {
    test('updates matrix when staff is assigned to unassigned task', async () => {
      // Initial state: Task without preferred staff
      const initialData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Unassigned Task',
            skillType: 'Tax Preparation',
            estimatedHours: 50,
            monthlyHours: 50,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
            // No preferredStaff
          }]
        }],
        totalDemand: 50,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      // Updated state: Task with newly assigned staff
      const updatedData = {
        ...initialData,
        dataPoints: [{
          ...initialData.dataPoints[0],
          taskBreakdown: [{
            ...initialData.dataPoints[0].taskBreakdown[0],
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Alice Johnson',
              roleTitle: 'Senior CPA',
              assignmentType: 'preferred' as const
            }
          }]
        }]
      };

      // Initial render
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Unassigned Task')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });

      // Simulate real-time update
      act(() => {
        DemandMatrixService.clearCache();
      });

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: updatedData
      });

      // Trigger refresh (simulating real-time update)
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    test('updates matrix when staff assignment is removed', async () => {
      // Initial state: Task with preferred staff
      const initialData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Advisory'],
        dataPoints: [{
          skillType: 'Advisory',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 30,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Assigned Task',
            skillType: 'Advisory',
            estimatedHours: 30,
            monthlyHours: 30,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Bob Smith',
              roleTitle: 'Advisor',
              assignmentType: 'preferred' as const
            }
          }]
        }],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      // Updated state: Staff assignment removed
      const updatedData = {
        ...initialData,
        dataPoints: [{
          ...initialData.dataPoints[0],
          taskBreakdown: [{
            ...initialData.dataPoints[0].taskBreakdown[0],
            preferredStaff: undefined
          }]
        }]
      };

      // Initial render
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      // Simulate staff assignment removal
      act(() => {
        DemandMatrixService.clearCache();
      });

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: updatedData
      });

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });

    test('updates matrix when staff assignment changes', async () => {
      // Initial state: Task assigned to staff A
      const initialData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Audit'],
        dataPoints: [{
          skillType: 'Audit',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 40,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Audit Task',
            skillType: 'Audit',
            estimatedHours: 40,
            monthlyHours: 40,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Carol Davis',
              roleTitle: 'Senior Auditor',
              assignmentType: 'preferred' as const
            }
          }]
        }],
        totalDemand: 40,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      // Updated state: Task reassigned to staff B
      const updatedData = {
        ...initialData,
        dataPoints: [{
          ...initialData.dataPoints[0],
          taskBreakdown: [{
            ...initialData.dataPoints[0].taskBreakdown[0],
            preferredStaff: {
              staffId: 'staff-2',
              staffName: 'David Wilson',
              roleTitle: 'Junior Auditor',
              assignmentType: 'preferred' as const
            }
          }]
        }]
      };

      // Initial render
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Carol Davis')).toBeInTheDocument();
      });

      // Simulate staff reassignment
      act(() => {
        DemandMatrixService.clearCache();
      });

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: updatedData
      });

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.queryByText('Carol Davis')).not.toBeInTheDocument();
        expect(screen.getByText('David Wilson')).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency During Updates', () => {
    test('maintains filter state during real-time updates', async () => {
      const baseData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 50,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientId: 'client-1',
              clientName: 'Tax Client',
              recurringTaskId: 'task-1',
              taskName: 'Tax Task',
              skillType: 'Tax Preparation',
              estimatedHours: 50,
              monthlyHours: 50,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-1',
                staffName: 'Tax Specialist',
                roleTitle: 'CPA',
                assignmentType: 'preferred' as const
              }
            }]
          },
          {
            skillType: 'Advisory',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 30,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientId: 'client-2',
              clientName: 'Advisory Client',
              recurringTaskId: 'task-2',
              taskName: 'Advisory Task',
              skillType: 'Advisory',
              estimatedHours: 30,
              monthlyHours: 30,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-2',
                staffName: 'Advisory Specialist',
                roleTitle: 'Advisor',
                assignmentType: 'preferred' as const
              }
            }]
          }
        ],
        totalDemand: 80,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: baseData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
        expect(screen.getByText('Advisory')).toBeInTheDocument();
      });

      // Apply skill filter
      const skillFilter = screen.getByLabelText('Filter by skills');
      await user.click(skillFilter);
      await user.click(screen.getByText('Tax Preparation'));

      // Verify filter is applied
      await waitFor(() => {
        expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledWith(
          'demand-only',
          expect.any(Date),
          expect.objectContaining({
            skills: ['Tax Preparation']
          })
        );
      });

      // Trigger refresh (simulating real-time update)
      act(() => {
        DemandMatrixService.clearCache();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Verify filter state is maintained after refresh
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

    test('handles partial data updates gracefully', async () => {
      const initialData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Test Client',
              recurringTaskId: 'task-1',
              taskName: 'Task 1',
              skillType: 'Tax Preparation',
              estimatedHours: 50,
              monthlyHours: 50,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-1',
                staffName: 'Alice Johnson',
                roleTitle: 'CPA',
                assignmentType: 'preferred' as const
              }
            },
            {
              clientId: 'client-1',
              clientName: 'Test Client',
              recurringTaskId: 'task-2',
              taskName: 'Task 2',
              skillType: 'Tax Preparation',
              estimatedHours: 50,
              monthlyHours: 50,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff
            }
          ]
        }],
        totalDemand: 100,
        totalTasks: 2,
        totalClients: 1,
        skillSummary: {}
      };

      // Partial update: Only one task gets staff assignment
      const partialUpdate = {
        ...initialData,
        dataPoints: [{
          ...initialData.dataPoints[0],
          taskBreakdown: [
            initialData.dataPoints[0].taskBreakdown[0], // Keep first task as is
            {
              ...initialData.dataPoints[0].taskBreakdown[1],
              preferredStaff: {
                staffId: 'staff-2',
                staffName: 'Bob Smith',
                roleTitle: 'Junior CPA',
                assignmentType: 'preferred' as const
              }
            }
          ]
        }]
      };

      // Initial render
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });

      // Apply partial update
      act(() => {
        DemandMatrixService.clearCache();
      });

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: partialUpdate
      });

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling During Updates', () => {
    test('handles network errors during refresh', async () => {
      // Initial successful load
      const initialData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Test Task',
            skillType: 'Tax Preparation',
            estimatedHours: 50,
            monthlyHours: 50,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
          }]
        }],
        totalDemand: 50,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Simulate network error on refresh
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockRejectedValueOnce(
        new Error('Network error')
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Error refreshing data')).toBeInTheDocument();
        // Should still show previous data
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });
    });

    test('recovers from temporary data corruption', async () => {
      const validData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Advisory'],
        dataPoints: [{
          skillType: 'Advisory',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 30,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Test Task',
            skillType: 'Advisory',
            estimatedHours: 30,
            monthlyHours: 30,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
          }]
        }],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      // Initial load
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: validData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Advisory')).toBeInTheDocument();
      });

      // Simulate corrupted data on refresh
      const corruptedData = {
        ...validData,
        dataPoints: null,
        totalDemand: 'invalid'
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: corruptedData as any
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Data validation error')).toBeInTheDocument();
      });

      // Recovery: valid data returns
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: validData
      });

      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Advisory')).toBeInTheDocument();
        expect(screen.queryByText('Data validation error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance During Updates', () => {
    test('maintains performance with frequent updates', async () => {
      const baseData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Test Task',
            skillType: 'Tax Preparation',
            estimatedHours: 50,
            monthlyHours: 50,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
          }]
        }],
        totalDemand: 50,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: baseData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Simulate 5 rapid updates
      for (let i = 0; i < 5; i++) {
        act(() => {
          DemandMatrixService.clearCache();
        });

        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        await user.click(refreshButton);

        await waitFor(() => {
          expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle multiple updates efficiently
      expect(totalTime).toBeLessThan(5000); // Under 5 seconds for 5 updates
    });
  });
});
