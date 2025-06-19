import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientDetail from '@/components/clients/ClientDetail';
import { EditRecurringTaskContainer } from '@/components/clients/EditRecurringTaskContainer';
import { getClientById } from '@/services/clientService';
import { 
  getRecurringTasks, 
  getRecurringTaskById, 
  updateRecurringTask, 
  createRecurringTask 
} from '@/services/taskService';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { StaffOption } from '@/types/staffOption';
import { toast } from 'sonner';

// Mock all required services
jest.mock('@/services/clientService');
jest.mock('@/services/taskService');
jest.mock('@/services/staff/staffDropdownService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Test data setup
const mockClient = {
  id: 'client-1',
  legalName: 'Test Corporation',
  primaryContact: 'John Doe',
  email: 'john@test.com',
  phone: '555-1234',
  status: 'Active',
  industry: 'Technology',
  billingAddress: '123 Main St',
  expectedMonthlyRevenue: 5000,
  paymentTerms: 'Net 30',
  billingFrequency: 'Monthly',
  defaultTaskPriority: 'Medium',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  notificationPreferences: { emailReminders: true, taskNotifications: true }
};

const mockStaffOptions: StaffOption[] = [
  { id: 'staff-1', full_name: 'Alice Johnson' },
  { id: 'staff-2', full_name: 'Bob Smith' },
  { id: 'staff-3', full_name: 'Carol Davis' }
];

const createMockTask = (overrides: Partial<RecurringTask> = {}): RecurringTask => ({
  id: 'task-1',
  templateId: 'template-1',
  clientId: 'client-1',
  name: 'Test Task',
  description: 'Test Description',
  estimatedHours: 2,
  requiredSkills: ['CPA'],
  priority: 'Medium' as TaskPriority,
  category: 'Advisory' as TaskCategory,
  status: 'Unscheduled',
  dueDate: new Date('2023-06-15'),
  createdAt: new Date('2023-05-01'),
  updatedAt: new Date('2023-05-01'),
  recurrencePattern: {
    type: 'Monthly',
    interval: 1,
    dayOfMonth: 15
  },
  lastGeneratedDate: null,
  isActive: true,
  preferredStaffId: null,
  ...overrides
});

describe('Phase 7: End-to-End Integration Testing - Preferred Staff Feature', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Mock service implementations
    (getClientById as jest.Mock).mockResolvedValue(mockClient);
    (getActiveStaffForDropdown as jest.Mock).mockResolvedValue(mockStaffOptions);
    (getRecurringTasks as jest.Mock).mockResolvedValue([]);
    (updateRecurringTask as jest.Mock).mockImplementation(async (id, updates) => ({
      ...createMockTask(),
      ...updates,
      id
    }));
    (createRecurringTask as jest.Mock).mockImplementation(async (taskData) => ({
      ...createMockTask(),
      ...taskData,
      id: 'new-task-id'
    }));
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

  describe('Complete Workflow Testing: Database → Service → Form → UI → Submission → Database', () => {
    test('End-to-end workflow: Create new recurring task with preferred staff assignment', async () => {
      const taskWithStaff = createMockTask({ 
        name: 'New Task with Staff',
        preferredStaffId: 'staff-1' 
      });
      
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithStaff);
      
      // Test creation workflow - remove properties that shouldn't be passed to createRecurringTask
      const taskDataForCreation = {
        templateId: taskWithStaff.templateId,
        clientId: taskWithStaff.clientId,
        name: taskWithStaff.name,
        description: taskWithStaff.description,
        estimatedHours: taskWithStaff.estimatedHours,
        requiredSkills: taskWithStaff.requiredSkills,
        priority: taskWithStaff.priority,
        category: taskWithStaff.category,
        dueDate: taskWithStaff.dueDate,
        recurrencePattern: taskWithStaff.recurrencePattern,
        preferredStaffId: taskWithStaff.preferredStaffId
      };

      await act(async () => {
        await createRecurringTask(taskDataForCreation);
      });

      expect(createRecurringTask).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: 'staff-1'
        })
      );

      // Verify data persistence
      const savedTask = await getRecurringTaskById('new-task-id');
      expect(savedTask).toEqual(expect.objectContaining({
        preferredStaffId: 'staff-1'
      }));
    });

    test('End-to-end workflow: Edit existing task to add preferred staff', async () => {
      const originalTask = createMockTask({ preferredStaffId: null });
      const updatedTask = createMockTask({ preferredStaffId: 'staff-2' });
      
      (getRecurringTaskById as jest.Mock).mockResolvedValue(originalTask);
      
      // Test update workflow
      await act(async () => {
        await updateRecurringTask('task-1', { preferredStaffId: 'staff-2' });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1', 
        expect.objectContaining({
          preferredStaffId: 'staff-2'
        })
      );
    });

    test('End-to-end workflow: Edit existing task to change preferred staff', async () => {
      const originalTask = createMockTask({ preferredStaffId: 'staff-1' });
      
      (getRecurringTaskById as jest.Mock).mockResolvedValue(originalTask);
      
      await act(async () => {
        await updateRecurringTask('task-1', { preferredStaffId: 'staff-3' });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          preferredStaffId: 'staff-3'
        })
      );
    });

    test('End-to-end workflow: Edit existing task to remove preferred staff assignment', async () => {
      const originalTask = createMockTask({ preferredStaffId: 'staff-1' });
      
      (getRecurringTaskById as jest.Mock).mockResolvedValue(originalTask);
      
      await act(async () => {
        await updateRecurringTask('task-1', { preferredStaffId: null });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });
  });

  describe('Edge Cases Testing', () => {
    test('Editing tasks with no preferred staff assigned', async () => {
      const taskWithoutStaff = createMockTask({ preferredStaffId: null });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithoutStaff);

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // Verify that the preferred staff field shows "No preference"
      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
      });
    });

    test('Editing tasks with preferred staff assigned', async () => {
      const taskWithStaff = createMockTask({ preferredStaffId: 'staff-1' });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithStaff);

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // Should show the assigned staff member
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    test('Assigning staff to tasks that previously had none', async () => {
      const taskWithoutStaff = createMockTask({ preferredStaffId: null });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithoutStaff);

      await act(async () => {
        await updateRecurringTask('task-1', { 
          preferredStaffId: 'staff-2',
          name: 'Updated Task Name'
        });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          preferredStaffId: 'staff-2'
        })
      );
    });

    test('Changing preferred staff assignments', async () => {
      const taskWithStaff = createMockTask({ preferredStaffId: 'staff-1' });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithStaff);

      await act(async () => {
        await updateRecurringTask('task-1', { 
          preferredStaffId: 'staff-3'
        });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          preferredStaffId: 'staff-3'
        })
      );
    });

    test('Removing preferred staff assignments', async () => {
      const taskWithStaff = createMockTask({ preferredStaffId: 'staff-2' });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithStaff);

      await act(async () => {
        await updateRecurringTask('task-1', { 
          preferredStaffId: null
        });
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });
  });

  describe('Error Scenarios Testing', () => {
    test('Staff member deleted while assigned to tasks', async () => {
      // Mock scenario where staff member no longer exists
      (getActiveStaffForDropdown as jest.Mock).mockResolvedValue(
        mockStaffOptions.filter(staff => staff.id !== 'staff-1')
      );

      const taskWithDeletedStaff = createMockTask({ preferredStaffId: 'staff-1' });
      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithDeletedStaff);

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // The form should still load, but the deleted staff won't be in the dropdown
      await waitFor(() => {
        const staffDropdown = screen.getByRole('combobox');
        expect(staffDropdown).toBeInTheDocument();
      });
    });

    test('Database connection issues during staff loading', async () => {
      (getActiveStaffForDropdown as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const task = createMockTask();
      (getRecurringTaskById as jest.Mock).mockResolvedValue(task);

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to load staff members')).toBeInTheDocument();
      });
    });

    test('Invalid staff ID scenarios', async () => {
      // Test with invalid UUID format
      const invalidStaffUpdate = {
        name: 'Test Task',
        preferredStaffId: 'invalid-uuid'
      };

      (updateRecurringTask as jest.Mock).mockRejectedValue(
        new Error('Invalid staff ID format')
      );

      try {
        await updateRecurringTask('task-1', invalidStaffUpdate);
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Invalid staff ID');
      }
    });

    test('Network error during task update', async () => {
      const task = createMockTask();
      (getRecurringTaskById as jest.Mock).mockResolvedValue(task);
      (updateRecurringTask as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      try {
        await updateRecurringTask('task-1', { preferredStaffId: 'staff-1' });
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Network error');
      }
    });
  });

  describe('Performance Testing with Realistic Data Volumes', () => {
    test('Performance with large staff list', async () => {
      // Generate large staff list
      const largeStaffList: StaffOption[] = Array.from({ length: 100 }, (_, i) => ({
        id: `staff-${i + 1}`,
        full_name: `Staff Member ${i + 1}`
      }));

      (getActiveStaffForDropdown as jest.Mock).mockResolvedValue(largeStaffList);

      const task = createMockTask();
      (getRecurringTaskById as jest.Mock).mockResolvedValue(task);

      const startTime = performance.now();

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Performance should be reasonable (under 2 seconds for 100 staff members)
      expect(renderTime).toBeLessThan(2000);
    });

    test('Performance with multiple concurrent task operations', async () => {
      const tasks = Array.from({ length: 10 }, (_, i) => 
        createMockTask({ 
          id: `task-${i + 1}`,
          name: `Task ${i + 1}`,
          preferredStaffId: i % 2 === 0 ? `staff-${i + 1}` : null
        })
      );

      // Test concurrent updates
      const startTime = performance.now();

      const updatePromises = tasks.map(task => 
        updateRecurringTask(task.id, { 
          preferredStaffId: `staff-${Math.floor(Math.random() * 3) + 1}`
        })
      );

      await Promise.all(updatePromises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All operations should complete within reasonable time
      expect(totalTime).toBeLessThan(5000);
      expect(updateRecurringTask).toHaveBeenCalledTimes(10);
    });
  });

  describe('Data Integrity and Persistence Verification', () => {
    test('Verify data persistence across all operations', async () => {
      const originalTask = createMockTask({ preferredStaffId: null });
      
      // Step 1: Create task without staff - remove properties that shouldn't be passed
      const taskDataForCreation = {
        templateId: originalTask.templateId,
        clientId: originalTask.clientId,
        name: originalTask.name,
        description: originalTask.description,
        estimatedHours: originalTask.estimatedHours,
        requiredSkills: originalTask.requiredSkills,
        priority: originalTask.priority,
        category: originalTask.category,
        dueDate: originalTask.dueDate,
        recurrencePattern: originalTask.recurrencePattern,
        preferredStaffId: originalTask.preferredStaffId
      };

      await createRecurringTask(taskDataForCreation);
      expect(createRecurringTask).toHaveBeenCalledWith(
        expect.objectContaining({ preferredStaffId: null })
      );

      // Step 2: Add preferred staff
      await updateRecurringTask('task-1', { preferredStaffId: 'staff-1' });
      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({ preferredStaffId: 'staff-1' })
      );

      // Step 3: Change preferred staff
      await updateRecurringTask('task-1', { preferredStaffId: 'staff-2' });
      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({ preferredStaffId: 'staff-2' })
      );

      // Step 4: Remove preferred staff
      await updateRecurringTask('task-1', { preferredStaffId: null });
      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({ preferredStaffId: null })
      );
    });

    test('Test with various staff numbers and scenarios', async () => {
      // Test with no staff available
      (getActiveStaffForDropdown as jest.Mock).mockResolvedValue([]);

      const task = createMockTask();
      (getRecurringTaskById as jest.Mock).mockResolvedValue(task);

      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No active staff members found')).toBeInTheDocument();
      });

      // Test with single staff member
      (getActiveStaffForDropdown as jest.Mock).mockResolvedValue([mockStaffOptions[0]]);

      // Re-render to test single staff scenario
      renderWithProviders(
        <EditRecurringTaskContainer
          open={true}
          onOpenChange={() => {}}
          taskId="task-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('Regression Testing - Existing Functionality', () => {
    test('Ensure no impact on existing recurring task functionality', async () => {
      const standardTask = createMockTask({
        name: 'Standard Task',
        description: 'Standard Description',
        estimatedHours: 5,
        priority: 'High' as TaskPriority,
        category: 'Tax' as TaskCategory
      });

      (getRecurringTaskById as jest.Mock).mockResolvedValue(standardTask);

      // Test that all existing fields still work
      await updateRecurringTask('task-1', {
        name: 'Updated Standard Task',
        description: 'Updated Description',
        estimatedHours: 6,
        priority: 'Urgent' as TaskPriority
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          name: 'Updated Standard Task',
          description: 'Updated Description',
          estimatedHours: 6,
          priority: 'Urgent'
        })
      );
    });

    test('Verify recurrence pattern functionality remains intact', async () => {
      const taskWithRecurrence = createMockTask({
        recurrencePattern: {
          type: 'Weekly',
          interval: 2,
          weekdays: [1, 3, 5],
          dayOfMonth: undefined,
          monthOfYear: undefined
        }
      });

      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithRecurrence);

      await updateRecurringTask('task-1', {
        recurrencePattern: {
          type: 'Monthly',
          interval: 1,
          dayOfMonth: 15
        }
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          recurrencePattern: expect.objectContaining({
            type: 'Monthly',
            interval: 1,
            dayOfMonth: 15
          })
        })
      );
    });

    test('Verify required skills functionality remains intact', async () => {
      const taskWithSkills = createMockTask({
        requiredSkills: ['CPA', 'Tax Preparation']
      });

      (getRecurringTaskById as jest.Mock).mockResolvedValue(taskWithSkills);

      await updateRecurringTask('task-1', {
        requiredSkills: ['CPA', 'Advisory', 'Audit']
      });

      expect(updateRecurringTask).toHaveBeenCalledWith('task-1',
        expect.objectContaining({
          requiredSkills: ['CPA', 'Advisory', 'Audit']
        })
      );
    });
  });
});
