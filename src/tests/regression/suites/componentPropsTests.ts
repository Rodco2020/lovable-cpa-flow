
/**
 * Component Props Compatibility Test Suite
 * 
 * Tests component prop interfaces and callback functionality.
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';

export interface ComponentPropsTestConfig {
  renderWithProviders: (component: React.ReactElement) => any;
}

export const runComponentPropsTests = ({ renderWithProviders }: ComponentPropsTestConfig) => {
  describe('Component Props Compatibility', () => {
    test('ClientRecurringTaskList accepts all expected props', () => {
      const props = {
        clientId: 'client-1',
        onViewTask: jest.fn(),
        onRefreshNeeded: jest.fn()
      };

      expect(() => {
        renderWithProviders(React.createElement(ClientRecurringTaskList, props));
      }).not.toThrow();
    });

    test('callback functions are called with correct parameters', async () => {
      const onViewTask = jest.fn();
      
      renderWithProviders(
        React.createElement(ClientRecurringTaskList, {
          clientId: "client-1",
          onViewTask: onViewTask
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Click on task row to trigger view - Fixed to pass task ID
      const taskRow = screen.getByText('Monthly Bookkeeping').closest('tr');
      if (taskRow) {
        fireEvent.click(taskRow);
        expect(onViewTask).toHaveBeenCalledWith('task-1');
      }
    });
  });
};
