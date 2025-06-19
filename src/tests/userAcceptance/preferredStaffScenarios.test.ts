
/**
 * User Acceptance Tests for Preferred Staff Scenarios
 * Tests real-world scenarios involving preferred staff assignments and filtering
 * 
 * Test Structure:
 * - Scenario 1: Basic preferred staff display
 * - Scenario 2: Staff filtering functionality
 * - Scenario 3: Unassigned task handling
 * - Scenario 4: Staff workload analysis
 * - Scenario 5: Multi-skill staff assignments
 * 
 * Each scenario validates specific user workflows and UI interactions
 * without modifying the underlying business logic or visual appearance.
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

/**
 * Test Data Factory
 * Creates consistent mock data for different test scenarios
 */
const createMockTaskBreakdown = (overrides = {}) => ({
  clientId: 'client-1',
  clientName: 'ABC Corp',
  recurringTaskId: 'task-1',
  taskName: 'Monthly Tax Prep',
  skillType: 'Tax Preparation',
  estimatedHours: 20,
  monthlyHours: 20,
  recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
  ...overrides
});

const createMockPreferredStaff = (overrides = {}) => ({
  staffId: 'staff-1',
  staffName: 'Alice Johnson',
  roleTitle: 'Senior CPA',
  assignmentType: 'preferred',
  ...overrides
});

const createMockDataPoint = (overrides = {}) => ({
  skillType: 'Tax Preparation',
  month: '2025-01',
  monthLabel: 'Jan 2025',
  demandHours: 40,
  taskCount: 2,
  clientCount: 1,
  taskBreakdown: [],
  ...overrides
});

const createMockMatrixData = (overrides = {}) => ({
  months: [{ key: '2025-01', label: 'Jan 2025' }],
  skills: ['Tax Preparation'],
  dataPoints: [],
  totalDemand: 40,
  totalTasks: 2,
  totalClients: 1,
  skillSummary: {},
  ...overrides
});

/**
 * Test Helper Functions
 * Reusable functions for common test operations
 */
const setupMockService = (mockData) => {
  vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
    matrixData: mockData
  });
};

const renderDemandMatrix = () => {
  return render(
    <TestWrapper>
      <DemandMatrix groupingMode="skill" />
    </TestWrapper>
  );
};

const waitForMatrixToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
  });
};

describe('Preferred Staff User Acceptance Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('Scenario 1: Viewing Tasks with Preferred Staff Assignments', () => {
    test('should display preferred staff information in matrix cells', async () => {
      const taskWithPreferredStaff = createMockTaskBreakdown({
        preferredStaff: createMockPreferredStaff()
      });

      const taskWithoutPreferredStaff = createMockTaskBreakdown({
        recurringTaskId: 'task-2',
        taskName: 'Tax Review',
        preferredStaff: undefined
      });

      const dataPoint = createMockDataPoint({
        taskBreakdown: [taskWithPreferredStaff, taskWithoutPreferredStaff]
      });

      const mockData = createMockMatrixData({
        dataPoints: [dataPoint]
      });

      setupMockService(mockData);
      renderDemandMatrix();
      await waitForMatrixToLoad();

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Senior CPA')).toBeInTheDocument();
    });
  });

  describe('Scenario 2: Filtering by Preferred Staff', () => {
    test('should filter matrix to show only tasks assigned to specific staff', async () => {
      const aliceTask = createMockTaskBreakdown({
        taskName: 'Tax Task',
        preferredStaff: createMockPreferredStaff()
      });

      const bobTask = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-2',
        taskName: 'Advisory Task',
        skillType: 'Advisory',
        estimatedHours: 30,
        monthlyHours: 30,
        preferredStaff: createMockPreferredStaff({
          staffId: 'staff-2',
          staffName: 'Bob Smith',
          roleTitle: 'Advisor'
        })
      });

      const taxDataPoint = createMockDataPoint({
        demandHours: 20,
        taskCount: 1,
        taskBreakdown: [aliceTask]
      });

      const advisoryDataPoint = createMockDataPoint({
        skillType: 'Advisory',
        demandHours: 30,
        taskCount: 1,
        clientCount: 1,
        taskBreakdown: [bobTask]
      });

      const mockData = createMockMatrixData({
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [taxDataPoint, advisoryDataPoint],
        totalDemand: 50,
        totalTasks: 2,
        totalClients: 2
      });

      setupMockService(mockData);
      renderDemandMatrix();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      const filteredData = createMockMatrixData({
        dataPoints: [taxDataPoint],
        totalDemand: 20,
        totalTasks: 1,
        totalClients: 1
      });

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
      const assignedTask = createMockTaskBreakdown({
        taskName: 'Assigned Task',
        preferredStaff: createMockPreferredStaff()
      });

      const unassignedTask1 = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-2',
        taskName: 'Unassigned Task 1',
        estimatedHours: 15,
        monthlyHours: 15,
        preferredStaff: undefined
      });

      const unassignedTask2 = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-3',
        taskName: 'Unassigned Task 2',
        estimatedHours: 15,
        monthlyHours: 15,
        preferredStaff: undefined
      });

      const dataPoint = createMockDataPoint({
        demandHours: 50,
        taskCount: 3,
        clientCount: 2,
        taskBreakdown: [assignedTask, unassignedTask1, unassignedTask2]
      });

      const mockData = createMockMatrixData({
        dataPoints: [dataPoint],
        totalDemand: 50,
        totalTasks: 3,
        totalClients: 2
      });

      setupMockService(mockData);
      renderDemandMatrix();
      await waitForMatrixToLoad();

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Task 1')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Task 2')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    test('should allow filtering to show only unassigned tasks', async () => {
      const assignedTask = createMockTaskBreakdown({
        taskName: 'Assigned Task',
        preferredStaff: createMockPreferredStaff()
      });

      const unassignedTask = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-2',
        taskName: 'Unassigned Task',
        estimatedHours: 30,
        monthlyHours: 30,
        preferredStaff: undefined
      });

      const allTasksData = createMockMatrixData({
        dataPoints: [createMockDataPoint({
          taskBreakdown: [assignedTask, unassignedTask]
        })],
        totalTasks: 3
      });

      setupMockService(allTasksData);
      renderDemandMatrix();

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Unassigned Task')).toBeInTheDocument();
      });

      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      const unassignedOnlyData = createMockMatrixData({
        dataPoints: [createMockDataPoint({
          taskBreakdown: [unassignedTask],
          demandHours: 30,
          taskCount: 1,
          clientCount: 1
        })],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1
      });

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
      const aliceTask1 = createMockTaskBreakdown({
        taskName: 'Tax Prep - ABC',
        estimatedHours: 25,
        monthlyHours: 25,
        preferredStaff: createMockPreferredStaff()
      });

      const aliceTask2 = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-2',
        taskName: 'Tax Review - XYZ',
        preferredStaff: createMockPreferredStaff()
      });

      const bobTask = createMockTaskBreakdown({
        clientId: 'client-2',
        clientName: 'XYZ Inc',
        recurringTaskId: 'task-3',
        taskName: 'Complex Tax Analysis',
        estimatedHours: 15,
        monthlyHours: 15,
        preferredStaff: createMockPreferredStaff({
          staffId: 'staff-2',
          staffName: 'Bob Smith',
          roleTitle: 'CPA'
        })
      });

      const dataPoint = createMockDataPoint({
        demandHours: 60,
        taskCount: 3,
        taskBreakdown: [aliceTask1, aliceTask2, bobTask]
      });

      const mockData = createMockMatrixData({
        dataPoints: [dataPoint],
        totalDemand: 60,
        totalTasks: 3
      });

      setupMockService(mockData);
      renderDemandMatrix();
      await waitForMatrixToLoad();

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();

      const taxPrepCell = screen.getByText('60');
      await user.click(taxPrepCell);

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario 5: Multi-Skill Staff Assignment', () => {
    test('should handle staff assigned to multiple skill types', async () => {
      const aliceTaxTask = createMockTaskBreakdown({
        taskName: 'Tax Prep',
        preferredStaff: createMockPreferredStaff()
      });

      const bobTaxTask = createMockTaskBreakdown({
        recurringTaskId: 'task-2',
        taskName: 'Tax Review',
        estimatedHours: 10,
        monthlyHours: 10,
        preferredStaff: createMockPreferredStaff({
          staffId: 'staff-2',
          staffName: 'Bob Smith',
          roleTitle: 'CPA'
        })
      });

      const aliceAdvisoryTask = createMockTaskBreakdown({
        recurringTaskId: 'task-3',
        taskName: 'Financial Advisory',
        skillType: 'Advisory',
        estimatedHours: 25,
        monthlyHours: 25,
        preferredStaff: createMockPreferredStaff()
      });

      const taxDataPoint = createMockDataPoint({
        demandHours: 30,
        taskCount: 2,
        taskBreakdown: [aliceTaxTask, bobTaxTask]
      });

      const advisoryDataPoint = createMockDataPoint({
        skillType: 'Advisory',
        demandHours: 25,
        taskCount: 1,
        taskBreakdown: [aliceAdvisoryTask]
      });

      const mockData = createMockMatrixData({
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [taxDataPoint, advisoryDataPoint],
        totalDemand: 55,
        totalTasks: 3
      });

      setupMockService(mockData);
      renderDemandMatrix();

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
        expect(screen.getByText('Advisory')).toBeInTheDocument();
      });

      const aliceElements = screen.getAllByText('Alice Johnson');
      expect(aliceElements.length).toBeGreaterThan(1);

      const filterToggle = screen.getByText('Filter');
      await user.click(filterToggle);

      const aliceOnlyData = createMockMatrixData({
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [
          createMockDataPoint({
            taskBreakdown: [aliceTaxTask],
            demandHours: 20,
            taskCount: 1
          }),
          createMockDataPoint({
            skillType: 'Advisory',
            demandHours: 25,
            taskCount: 1,
            taskBreakdown: [aliceAdvisoryTask]
          })
        ],
        totalDemand: 45,
        totalTasks: 2,
        totalClients: 1
      });

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: aliceOnlyData
      });

      const aliceFilter = screen.getByText('Alice Johnson');
      await user.click(aliceFilter);

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      });
    });
  });
});

/**
 * Helper function for date formatting (simplified for tests)
 * Provides consistent date formatting across all test scenarios
 */
function format(date: Date, formatString: string): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
