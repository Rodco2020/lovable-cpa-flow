
/**
 * Tests for ClientRecurringTaskList component
 * 
 * Covers:
 * - Rendering recurring tasks
 * - Task deactivation
 * - Empty state handling
 * - View task callback
 * - Pagination
 * - Edit dialog functionality
 * - End-to-end edit workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';
import { mockRecurringTasks } from './testUtils/mockData';
import { MockEditRecurringTaskContainer, MockTaskListPagination } from './testUtils/mockComponents';
import { getRecurringTasks, deactivateRecurringTask, getRecurringTaskById, updateRecurringTask } from '@/services/taskService';

// Setup mocks
jest.mock('@/components/clients/EditRecurringTaskContainer', () => ({
  EditRecurringTaskContainer: MockEditRecurringTaskContainer
}));

jest.mock('@/components/clients/TaskListPagination', () => ({
  __esModule: true,
  default: MockTaskListPagination
}));

jest.mock('@/services/taskService', () => ({
  getRecurringTasks: jest.fn().mockResolvedValue([]),
  deactivateRecurringTask: jest.fn().mockResolvedValue(true),
  getTaskInstances: jest.fn().mockResolvedValue([]),
  getRecurringTaskById: jest.fn().mockResolvedValue(null),
  updateRecurringTask: jest.fn().mockResolvedValue(true)
}));

jest.mock('@/services/clientService', () => ({
  getClientAdHocTasks: jest.fn().mockResolvedValue([]),
  getClientById: jest.fn().mockResolvedValue({}),
  deleteClient: jest.fn().mockResolvedValue(true)
}));

describe('ClientRecurringTaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getRecurringTasks as jest.Mock).mockResolvedValue(mockRecurringTasks);
  });

  describe('Task Rendering', () => {
    test('renders recurring tasks correctly', async () => {
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Monthly Bookkeeping');
      await screen.findByText('Quarterly Tax Filing');
      
      expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Tax Filing')).toBeInTheDocument();
    });

    test('displays empty state when no tasks are found', async () => {
      (getRecurringTasks as jest.Mock).mockResolvedValue([]);
      
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('No recurring tasks');
      
      expect(screen.getByText('No recurring tasks')).toBeInTheDocument();
      expect(screen.getByText('This client doesn\'t have any recurring tasks set up yet.')).toBeInTheDocument();
    });
  });

  describe('Task Operations', () => {
    test('handles deactivation correctly', async () => {
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      const deactivateButtons = screen.getAllByText('Deactivate');
      fireEvent.click(deactivateButtons[0]);
      
      expect(deactivateRecurringTask).toHaveBeenCalledWith('task1');
    });

    test('calls onViewTask callback when task is clicked', async () => {
      const mockViewTask = jest.fn();
      render(<ClientRecurringTaskList clientId="client1" onViewTask={mockViewTask} />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      const taskRow = screen.getByText('Monthly Bookkeeping').closest('tr');
      fireEvent.click(taskRow!);
      
      expect(mockViewTask).toHaveBeenCalledWith('task1');
    });
  });

  describe('Pagination', () => {
    test('shows pagination when there are more tasks than items per page', async () => {
      const manyTasks = Array(10).fill(null).map((_, i) => ({
        ...mockRecurringTasks[0],
        id: `task-${i}`,
        name: `Task ${i}`,
      }));
      
      (getRecurringTasks as jest.Mock).mockResolvedValue(manyTasks);
      
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Task 0');
      
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Edit Dialog', () => {
    test('opens edit dialog when Edit button is clicked', async () => {
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      const editButtons = await screen.findAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      const editDialog = screen.getByTestId('edit-task-dialog');
      expect(editDialog).toHaveAttribute('data-open', 'true');
      expect(editDialog).toHaveAttribute('data-task-id', 'task1');
    });
    
    test('clicking Edit button stops event propagation', async () => {
      const mockViewTask = jest.fn();
      render(<ClientRecurringTaskList clientId="client1" onViewTask={mockViewTask} />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      const editButtons = await screen.findAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(mockViewTask).not.toHaveBeenCalled();
    });

    test('refreshes task list after successful edit', async () => {
      const mockRefreshNeeded = jest.fn();
      render(<ClientRecurringTaskList clientId="client1" onRefreshNeeded={mockRefreshNeeded} />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      (getRecurringTasks as jest.Mock).mockClear();
      
      const editButtons = await screen.findAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      const editDialog = screen.getByTestId('edit-task-dialog');
      expect(editDialog).toHaveAttribute('data-open', 'true');
      
      const saveCompleteButton = screen.getByTestId('trigger-save-complete');
      fireEvent.click(saveCompleteButton);
      
      expect(getRecurringTasks).toHaveBeenCalledTimes(1);
      expect(mockRefreshNeeded).toHaveBeenCalledTimes(1);
    });
  });

  describe('End-to-End Workflows', () => {
    test('handles editing inactive tasks correctly', async () => {
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Annual Audit');
      
      const taskRow = screen.getByText('Annual Audit').closest('tr');
      const editButton = taskRow?.querySelector('button:has(svg) + button') || 
                         taskRow?.querySelector('button:has(.h-4.w-4)');
      
      expect(editButton).toBeInTheDocument();
      editButton && fireEvent.click(editButton);
      
      const editDialog = screen.getByTestId('edit-task-dialog');
      expect(editDialog).toHaveAttribute('data-open', 'true');
      expect(editDialog).toHaveAttribute('data-task-id', 'task3-inactive');
    });

    test('performs end-to-end edit workflow correctly', async () => {
      const mockTask = {...mockRecurringTasks[0]};
      (getRecurringTaskById as jest.Mock).mockResolvedValue(mockTask);
      
      const updateSpy = updateRecurringTask as jest.Mock;
      
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      const editButtons = await screen.findAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      const editDialog = screen.getByTestId('edit-task-dialog');
      expect(editDialog).toHaveAttribute('data-open', 'true');
      
      const saveCompleteButton = screen.getByTestId('trigger-save-complete');
      fireEvent.click(saveCompleteButton);
      
      expect(getRecurringTasks).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    test('refreshes UI properly after a failed save attempt followed by success', async () => {
      const mockTask = {...mockRecurringTasks[0]};
      (getRecurringTaskById as jest.Mock).mockResolvedValue(mockTask);
      
      let attemptCount = 0;
      (updateRecurringTask as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(true);
      });
      
      render(<ClientRecurringTaskList clientId="client1" />);
      
      await screen.findByText('Monthly Bookkeeping');
      
      (getRecurringTasks as jest.Mock).mockClear();
      
      const editButtons = await screen.findAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      const editDialog = screen.getByTestId('edit-task-dialog');
      expect(editDialog).toHaveAttribute('data-open', 'true');
      
      const saveCompleteButton = screen.getByTestId('trigger-save-complete');
      fireEvent.click(saveCompleteButton);
      
      expect(getRecurringTasks).not.toHaveBeenCalled();
      
      fireEvent.click(saveCompleteButton);
      
      expect(getRecurringTasks).toHaveBeenCalledTimes(1);
    });
  });
});
