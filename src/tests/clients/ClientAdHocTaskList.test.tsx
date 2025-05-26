
/**
 * Tests for ClientAdHocTaskList component
 * 
 * Covers:
 * - Rendering ad-hoc tasks
 * - Search functionality
 * - Status filtering
 * - Due date filtering
 * - Empty state handling
 * - View task callback
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientAdHocTaskList from '@/components/clients/ClientAdHocTaskList';
import { mockAdHocTasks, createTasksWithDifferentDueDates } from './testUtils/mockData';
import { getClientAdHocTasks } from '@/services/clientService';

// Setup mocks
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

describe('ClientAdHocTaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClientAdHocTasks as jest.Mock).mockResolvedValue(mockAdHocTasks);
  });

  describe('Task Rendering', () => {
    test('renders ad-hoc tasks correctly', async () => {
      render(<ClientAdHocTaskList clientId="client1" />);
      
      await screen.findByText('Special Advisory Project');
      
      expect(screen.getByText('Special Advisory Project')).toBeInTheDocument();
      expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
    });

    test('displays empty state when no tasks are available', async () => {
      (getClientAdHocTasks as jest.Mock).mockResolvedValue([]);
      
      render(<ClientAdHocTaskList clientId="client1" />);
      
      await screen.findByText('No Ad-hoc Tasks');
      
      expect(screen.getByText('No Ad-hoc Tasks')).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    test('filters tasks based on search term', async () => {
      render(<ClientAdHocTaskList clientId="client1" />);
      
      await screen.findByText('Special Advisory Project');
      
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'emergency' } });
      
      expect(screen.queryByText('Special Advisory Project')).not.toBeInTheDocument();
      expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
    });

    test('filters tasks by status with the expanded filter interface', async () => {
      render(<ClientAdHocTaskList clientId="client1" />);
      
      await screen.findByText('Special Advisory Project');
      
      const filterButton = screen.getByText('Filters');
      fireEvent.click(filterButton);
      
      const statusSelect = screen.getByText('All Statuses');
      fireEvent.click(statusSelect);
      fireEvent.click(screen.getByText('In Progress'));
      
      expect(screen.queryByText('Special Advisory Project')).not.toBeInTheDocument();
      expect(screen.getByText('Emergency Tax Consultation')).toBeInTheDocument();
    });

    test('filters tasks by due date', async () => {
      const tasksWithDifferentDueDates = createTasksWithDifferentDueDates();
      (getClientAdHocTasks as jest.Mock).mockResolvedValue(tasksWithDifferentDueDates);
      
      render(<ClientAdHocTaskList clientId="client1" />);
      
      await screen.findByText('Past Due Task');
      
      const filterButton = screen.getByText('Filters');
      fireEvent.click(filterButton);
      
      const todayButton = screen.getByText('Due Today');
      fireEvent.click(todayButton);
      
      expect(screen.queryByText('Past Due Task')).not.toBeInTheDocument();
      expect(screen.getByText('Due Today Task')).toBeInTheDocument();
      expect(screen.queryByText('Upcoming Task')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onViewTask callback when task is clicked', async () => {
      const mockViewTask = jest.fn();
      render(<ClientAdHocTaskList clientId="client1" onViewTask={mockViewTask} />);
      
      await screen.findByText('Special Advisory Project');
      
      const taskRow = screen.getByText('Special Advisory Project').closest('tr');
      fireEvent.click(taskRow!);
      
      expect(mockViewTask).toHaveBeenCalledWith('task3');
    });
  });
});
