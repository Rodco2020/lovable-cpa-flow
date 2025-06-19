
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import {
  createMockTaskBreakdown,
  createMockPreferredStaff,
  createMockDataPoint,
  createMockMatrixData
} from './testDataFactory';
import {
  setupMockService,
  renderDemandMatrix,
  waitForMatrixToLoad
} from './testHelpers';

/**
 * Individual Scenario Test Functions
 * Each function contains tests for a specific user scenario
 */

export const runBasicPreferredStaffDisplayTests = () => {
  describe('Scenario 1: Viewing Tasks with Preferred Staff Assignments', () => {
    const user = userEvent.setup();

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
};

export const runStaffFilteringTests = () => {
  describe('Scenario 2: Filtering by Preferred Staff', () => {
    const user = userEvent.setup();

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
};

export const runUnassignedTaskTests = () => {
  describe('Scenario 3: Including Unassigned Tasks', () => {
    const user = userEvent.setup();

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
};

export const runStaffWorkloadAnalysisTests = () => {
  describe('Scenario 4: Staff Workload Analysis', () => {
    const user = userEvent.setup();

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
};

export const runMultiSkillStaffTests = () => {
  describe('Scenario 5: Multi-Skill Staff Assignment', () => {
    const user = userEvent.setup();

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
};
