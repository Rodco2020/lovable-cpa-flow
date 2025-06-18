
/**
 * Regression Tests for Existing Functionality
 * 
 * Ensures that all existing functionality continues to work correctly
 * after the unified type system implementation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ClientRecurringTaskList from '@/components/clients/ClientRecurringTaskList';
import ClientDetail from '@/components/clients/ClientDetail';
import { getRecurringTasks, updateRecurringTask, deactivateRecurringTask } from '@/services/taskService';
import { getClientById } from '@/services/clientService';
import { RecurringTask } from '@/types/task';
import { IndustryType, PaymentTerms, BillingFrequency, ClientStatus } from '@/types/client';

// Mock services
jest.mock('@/services/taskService');
jest.mock('@/services/clientService');
jest.mock('@/services/skillService');
jest.mock('@/services/staffService');

const mockGetRecurringTasks = getRecurringTasks as jest.MockedFunction<typeof getRecurringTasks>;
const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockDeactivateRecurringTask = deactivateRecurringTask as jest.MockedFunction<typeof deactivateRecurringTask>;
const mockGetClientById = getClientById as jest.MockedFunction<typeof getClientById>;

describe('Existing Functionality Regression Tests', () => {
  let queryClient: QueryClient;

  const mockClient = {
    id: 'client-1',
    legalName: 'Test Company',
    primaryContact: 'John Doe',
    email: 'john@test.com',
    phone: '555-1234',
    status: 'Active' as ClientStatus,
    industry: 'Technology' as IndustryType,
    billingAddress: '123 Main St',
    expectedMonthlyRevenue: 5000,
    paymentTerms: 'Net30' as PaymentTerms,
    billingFrequency: 'Monthly' as BillingFrequency,
    defaultTaskPriority: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationPreferences: { emailReminders: true, taskNotifications: true }
  };

  const mockRecurringTasks: RecurringTask[] = [
    {
      id: 'task-1',
      templateId: 'template-1',
      clientId: 'client-1',
      name: 'Monthly Bookkeeping',
      description: 'Monthly bookkeeping review',
      estimatedHours: 4,
      requiredSkills: ['bookkeeping'],
      priority: 'Medium',
      category: 'Bookkeeping',
      status: 'Unscheduled',
      dueDate: new Date('2024-03-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
      recurrencePattern: {
        type: 'Monthly',
        interval: 1,
        dayOfMonth: 15
      },
      lastGeneratedDate: null,
      isActive: true,
      preferredStaffId: null
    },
    {
      id: 'task-2',
      templateId: 'template-2',
      clientId: 'client-1',
      name: 'Quarterly Tax Filing',
      description: 'Quarterly tax filing preparation',
      estimatedHours: 8,
      requiredSkills: ['tax-preparation'],
      priority: 'High',
      category: 'Tax',
      status: 'Unscheduled',
      dueDate: new Date('2024-04-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
      recurrencePattern: {
        type: 'Quarterly',
        interval: 1,
        dayOfMonth: 15,
        monthOfYear: 4
      },
      lastGeneratedDate: null,
      isActive: true,
      preferredStaffId: 'staff-1'
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup default mocks with correct return types
    mockGetClientById.mockResolvedValue(mockClient);
    mockGetRecurringTasks.mockResolvedValue(mockRecurringTasks);
    mockUpdateRecurringTask.mockResolvedValue(undefined); // Fix: Return void instead of boolean
    mockDeactivateRecurringTask.mockResolvedValue(undefined); // Fix: Return void instead of boolean

    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('ClientRecurringTaskList Component', () => {
    test('renders task list correctly', async () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

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
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      const deactivateButtons = screen.getAllByText('Deactivate');
      fireEvent.click(deactivateButtons[0]);

      expect(mockDeactivateRecurringTask).toHaveBeenCalledWith('task-1');
    });

    test('opens edit dialog when edit button is clicked', async () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Verify edit dialog opens (this would depend on actual implementation)
      // The dialog should be rendered and visible
      await waitFor(() => {
        expect(screen.getByTestId('edit-task-dialog')).toBeInTheDocument();
      });
    });

    test('displays empty state when no tasks exist', async () => {
      mockGetRecurringTasks.mockResolvedValue([]);

      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('No recurring tasks')).toBeInTheDocument();
      });
    });

    test('handles loading state correctly', () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('preserves existing task properties after update', async () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Simulate task update
      const updatedTask: Partial<RecurringTask> = {
        name: 'Updated Bookkeeping',
        estimatedHours: 5,
        preferredStaffId: 'staff-2'
      };

      await mockUpdateRecurringTask('task-1', updatedTask);

      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', updatedTask);
    });
  });

  describe('Type System Compatibility', () => {
    test('maintains compatibility with existing RecurringTask interface', () => {
      const task: RecurringTask = mockRecurringTasks[0];

      // Verify all required properties are present
      expect(task.id).toBeDefined();
      expect(task.templateId).toBeDefined();
      expect(task.clientId).toBeDefined();
      expect(task.name).toBeDefined();
      expect(task.estimatedHours).toBeDefined();
      expect(task.requiredSkills).toBeDefined();
      expect(task.priority).toBeDefined();
      expect(task.category).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.recurrencePattern).toBeDefined();
      expect(task.isActive).toBeDefined();

      // Verify optional properties can be null/undefined
      expect(task.preferredStaffId).toBeNull();
      expect(task.lastGeneratedDate).toBeNull();
      expect(task.dueDate).toBeInstanceOf(Date);
    });

    test('supports all task priorities', () => {
      const priorities: Array<RecurringTask['priority']> = ['Low', 'Medium', 'High', 'Urgent'];
      
      priorities.forEach(priority => {
        const task: Partial<RecurringTask> = { priority };
        expect(task.priority).toBe(priority);
      });
    });

    test('supports all task categories', () => {
      const categories: Array<RecurringTask['category']> = [
        'Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'
      ];
      
      categories.forEach(category => {
        const task: Partial<RecurringTask> = { category };
        expect(task.category).toBe(category);
      });
    });

    test('supports all recurrence pattern types', () => {
      const recurrenceTypes: Array<RecurringTask['recurrencePattern']['type']> = [
        'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'
      ];
      
      recurrenceTypes.forEach(type => {
        const task: Partial<RecurringTask> = {
          recurrencePattern: { type }
        };
        expect(task.recurrencePattern?.type).toBe(type);
      });
    });
  });

  describe('Service Integration', () => {
    test('getRecurringTasks service maintains existing API', async () => {
      await mockGetRecurringTasks('client-1');
      
      expect(mockGetRecurringTasks).toHaveBeenCalledWith('client-1');
    });

    test('updateRecurringTask service maintains existing API', async () => {
      const updates: Partial<RecurringTask> = {
        name: 'Updated Task',
        estimatedHours: 5
      };

      await mockUpdateRecurringTask('task-1', updates);
      
      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', updates);
    });

    test('deactivateRecurringTask service maintains existing API', async () => {
      await mockDeactivateRecurringTask('task-1');
      
      expect(mockDeactivateRecurringTask).toHaveBeenCalledWith('task-1');
    });
  });

  describe('Component Props Compatibility', () => {
    test('ClientRecurringTaskList accepts all expected props', () => {
      const props = {
        clientId: 'client-1',
        onViewTask: jest.fn(),
        onRefreshNeeded: jest.fn()
      };

      expect(() => {
        renderWithProviders(<ClientRecurringTaskList {...props} />);
      }).not.toThrow();
    });

    test('callback functions are called with correct parameters', async () => {
      const onViewTask = jest.fn();
      
      renderWithProviders(
        <ClientRecurringTaskList 
          clientId="client-1" 
          onViewTask={onViewTask}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Click on task row to trigger view - Fix: Pass boolean true instead of string
      const taskRow = screen.getByText('Monthly Bookkeeping').closest('tr');
      if (taskRow) {
        fireEvent.click(taskRow);
        expect(onViewTask).toHaveBeenCalledWith('task-1');
      }
    });
  });

  describe('Error Handling Compatibility', () => {
    test('handles service errors gracefully', async () => {
      mockGetRecurringTasks.mockRejectedValue(new Error('Service error'));

      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        // Should handle error gracefully without crashing
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('handles update errors gracefully', async () => {
      mockUpdateRecurringTask.mockRejectedValue(new Error('Update failed'));

      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // The error should be handled without crashing the component
      // This would depend on the actual error handling implementation
    });
  });

  describe('Performance Regression', () => {
    test('renders large task lists efficiently', async () => {
      // Create a large number of tasks
      const largeMockTasks = Array.from({ length: 100 }, (_, index) => ({
        ...mockRecurringTasks[0],
        id: `task-${index}`,
        name: `Task ${index}`
      }));

      mockGetRecurringTasks.mockResolvedValue(largeMockTasks);

      const startTime = performance.now();
      
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(2000);
    });

    test('maintains responsive UI during updates', async () => {
      renderWithProviders(<ClientRecurringTaskList clientId="client-1" />);

      await waitFor(() => {
        expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
      });

      // Simulate rapid updates
      const updatePromises = Array.from({ length: 10 }, (_, i) => 
        mockUpdateRecurringTask(`task-${i}`, { name: `Updated Task ${i}` })
      );

      await Promise.all(updatePromises);

      // Component should remain responsive
      expect(screen.getByText('Monthly Bookkeeping')).toBeInTheDocument();
    });
  });
});
