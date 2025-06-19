/**
 * User Acceptance Tests for Preferred Staff Scenarios
 * Tests real-world scenarios involving preferred staff assignments and filtering
 */

import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

// Mock the service
vi.mock('@/services/forecasting/demandMatrixService');

describe('Preferred Staff User Acceptance Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('Scenario 1: Viewing Tasks with Preferred Staff Assignments', () => {
    test('should display preferred staff information in matrix cells', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 40,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Monthly Tax Prep',
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
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-2',
              taskName: 'Tax Review',
              skillType: 'Tax Preparation',
              estimatedHours: 20,
              monthlyHours: 20,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff assigned
            }
          ]
        }],
        totalDemand: 40,
        totalTasks: 2,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Should show preferred staff name in the matrix
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Senior CPA')).toBeInTheDocument();
    });
  });

  describe('Scenario 2: Filtering by Preferred Staff', () => {
    test('should filter matrix to show only tasks assigned to specific staff', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 20,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [{
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Tax Task',
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
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-2',
              taskName: 'Advisory Task',
              skillType: 'Advisory',
              estimatedHours: 30,
              monthlyHours: 30,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-2',
                staffName: 'Bob Smith',
                roleTitle: 'Advisor',
                assignmentType: 'preferred' as const
              }
            }]
          }
        ],
        totalDemand: 50,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {}
      };

      // Mock unfiltered data first
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: mockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      // Apply preferred staff filter
      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      // Mock filtered data (only Alice Johnson's tasks)
      const filteredData = {
        ...mockData,
        dataPoints: [mockData.dataPoints[0]], // Only Tax Preparation with Alice
        totalDemand: 20,
        totalTasks: 1,
        totalClients: 1
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: filteredData
      });

      const staffFilter = screen.getByLabelText('Filter by Preferred Staff');
      await user.click(staffFilter);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario 3: Including Unassigned Tasks', () => {
    test('should show both assigned and unassigned tasks when filter is enabled', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 3,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Assigned Task',
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
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-2',
              taskName: 'Unassigned Task 1',
              skillType: 'Tax Preparation',
              estimatedHours: 15,
              monthlyHours: 15,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff
            },
            {
              clientId: 'client-2',
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-3',
              taskName: 'Unassigned Task 2',
              skillType: 'Tax Preparation',
              estimatedHours: 15,
              monthlyHours: 15,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff
            }
          ]
        }],
        totalDemand: 50,
        totalTasks: 3,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Should show both assigned and unassigned tasks
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Task 1')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Task 2')).toBeInTheDocument();

      // Total should include all tasks
      expect(screen.getByText('50')).toBeInTheDocument(); // Total hours
    });

    test('should allow filtering to show only unassigned tasks', async () => {
      const allTasksData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 3,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Assigned Task',
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
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-2',
              taskName: 'Unassigned Task',
              skillType: 'Tax Preparation',
              estimatedHours: 30,
              monthlyHours: 30,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
              // No preferred staff
            }
          ]
        }],
        totalDemand: 50,
        totalTasks: 3,
        totalClients: 2,
        skillSummary: {}
      };

      // Initial render with all tasks
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: allTasksData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Unassigned Task')).toBeInTheDocument();
      });

      // Apply unassigned-only filter
      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      // Mock filtered data (only unassigned tasks)
      const unassignedOnlyData = {
        ...allTasksData,
        dataPoints: [{
          ...allTasksData.dataPoints[0],
          taskBreakdown: [allTasksData.dataPoints[0].taskBreakdown[1]], // Only unassigned task
          demandHours: 30,
          taskCount: 1,
          clientCount: 1
        }],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: unassignedOnlyData
      });

      const showUnassignedCheckbox = screen.getByLabelText('Include unassigned tasks');
      await user.click(showUnassignedCheckbox);

      await waitFor(() => {
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.getByText('Unassigned Task')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario 4: Staff Workload Analysis', () => {
    test('should allow drill-down to view specific staff workload', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 60,
          taskCount: 3,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Tax Prep - ABC',
              skillType: 'Tax Preparation',
              estimatedHours: 25,
              monthlyHours: 25,
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
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-2',
              taskName: 'Tax Review - XYZ',
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
              clientName: 'XYZ Inc',
              recurringTaskId: 'task-3',
              taskName: 'Complex Tax Analysis',
              skillType: 'Tax Preparation',
              estimatedHours: 15,
              monthlyHours: 15,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              preferredStaff: {
                staffId: 'staff-2',
                staffName: 'Bob Smith',
                roleTitle: 'CPA',
                assignmentType: 'preferred' as const
              }
            }
          ]
        }],
        totalDemand: 60,
        totalTasks: 3,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      // Should show both staff members and their workloads
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();

      // Click on cell to see drill-down (mocked interaction)
      const taxPrepCell = screen.getByText('60'); // Total hours cell
      await user.click(taxPrepCell);

      // Should show detailed breakdown (this would open a drill-down dialog)
      await waitFor(() => {
        // Verify that the correct data is being displayed
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario 5: Multi-Skill Staff Assignment', () => {
    test('should handle staff assigned to multiple skill types', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 30,
            taskCount: 2,
            clientCount: 1,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'ABC Corp',
                recurringTaskId: 'task-1',
                taskName: 'Tax Prep',
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
                clientId: 'client-1',
                clientName: 'ABC Corp',
                recurringTaskId: 'task-2',
                taskName: 'Tax Review',
                skillType: 'Tax Preparation',
                estimatedHours: 10,
                monthlyHours: 10,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                preferredStaff: {
                  staffId: 'staff-2',
                  staffName: 'Bob Smith',
                  roleTitle: 'CPA',
                  assignmentType: 'preferred' as const
                }
              }
            ]
          },
          {
            skillType: 'Advisory',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 25,
            taskCount: 1,
            clientCount: 1,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'ABC Corp',
                recurringTaskId: 'task-3',
                taskName: 'Financial Advisory',
                skillType: 'Advisory',
                estimatedHours: 25,
                monthlyHours: 25,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'Alice Johnson',
                  roleTitle: 'Senior CPA',
                  assignmentType: 'preferred' as const
                }
              }
            ]
          }
        ],
        totalDemand: 55,
        totalTasks: 3,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
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

      // Alice Johnson should appear in both skill categories
      const aliceElements = screen.getAllByText('Alice Johnson');
      expect(aliceElements.length).toBeGreaterThan(1);

      // Filter by Alice Johnson to see her total workload across skills
      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      // Mock filtered data showing only Alice's tasks
      const aliceOnlyData = {
        ...mockData,
        dataPoints: [
          {
            ...mockData.dataPoints[0],
            taskBreakdown: [mockData.dataPoints[0].taskBreakdown[0]], // Only Alice's tax task
            demandHours: 20,
            taskCount: 1
          },
          {
            ...mockData.dataPoints[1],
            // Keep Alice's advisory task as is
            demandHours: 25,
            taskCount: 1
          }
        ],
        totalDemand: 45,
        totalTasks: 2,
        totalClients: 1
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: aliceOnlyData
      });

      const aliceFilter = screen.getByText('Alice Johnson');
      await user.click(aliceFilter);

      await waitFor(() => {
        // Should show Alice's total workload across both skills
        expect(screen.getByText('45')).toBeInTheDocument(); // Total demand for Alice
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });
  });
});

// Helper function for date formatting (simplified for tests)
function format(date: Date, formatString: string): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
