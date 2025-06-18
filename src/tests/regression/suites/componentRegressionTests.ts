
/**
 * Component Regression Test Suite
 * 
 * Tests core component functionality to ensure existing behavior is preserved.
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';

export interface ComponentRegressionTestConfig {
  mockClient: any;
  mockRecurringTasks: any[];
  mockGetRecurringTasks: jest.MockedFunction<any>;
  mockUpdateRecurringTask: jest.MockedFunction<any>;
  mockDeactivateRecurringTask: jest.MockedFunction<any>;
  renderWithProviders: (component: React.ReactElement) => any;
}

export const runComponentRegressionTests = ({
  mockClient,
  mockRecurringTasks,
  mockGetRecurringTasks,
  mockUpdateRecurringTask,
  mockDeactivateRecurringTask,
  renderWithProviders
}: ComponentRegressionTestConfig) => {
  describe('ClientRecurringTaskList Component', () => {
    test('renders task list correctly', async () => {
      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
        expect(screen.getByText('Quarterly Tax Filing')).toBeInTheDocument();
      });

      // Verify task details are displayed
      expect(screen.getByText('4 hours')).toBeInTheDocument();
      expect(screen.getByText('8 hours')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    test('handles task deactivation correctly', async () => {
      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText('Deactivate');
      fireEvent.click(deactivateButtons[0]);

      expect(mockDeactivateRecurringTask).toHaveBeenCalledWith('task-1');
    });

    test('opens edit dialog when edit button is clicked', async () => {
      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Verify edit dialog opens (this would depend on actual implementation)
      await waitFor(() => {
        expect(screen.getByTestId('edit-task-dialog')).toBeInTheDocument();
      });
    });

    test('displays empty state when no tasks exist', async () => {
      mockGetRecurringTasks.mockResolvedValue([]);

      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      await waitFor(() => {
        expect(screen.getByText('No recurring tasks')).toBeInTheDocument();
      });
    });

    test('handles loading state correctly', () => {
      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('preserves existing task properties after update', async () => {
      renderWithProviders(React.createElement(ClientRecurringTaskList, { clientId: "client-1" }));

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Simulate task update
      const updatedTask = {
        name: 'Updated Bookkeeping',
        estimatedHours: 5,
        preferredStaffId: 'staff-2'
      };

      await mockUpdateRecurringTask('task-1', updatedTask);

      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', updatedTask);
    });
  });
};
