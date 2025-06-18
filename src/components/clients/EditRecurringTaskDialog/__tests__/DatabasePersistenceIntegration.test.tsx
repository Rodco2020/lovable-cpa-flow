
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '../EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { getRecurringTaskById, updateRecurringTask } from '@/services/clientTask/recurringTaskOperations';
import { validateStaffExists } from '@/services/clientTask/staffValidationService';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/services/staff/staffDropdownService');
jest.mock('@/services/clientTask/recurringTaskOperations');
jest.mock('@/services/clientTask/staffValidationService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;
const mockGetRecurringTaskById = getRecurringTaskById as jest.MockedFunction<typeof getRecurringTaskById>;
const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockValidateStaffExists = validateStaffExists as jest.MockedFunction<typeof validateStaffExists>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock staff data
const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' },
  { id: 'staff-3', full_name: 'Bob Johnson' }
];

// Mock recurring task
const mockRecurringTask: RecurringTask = {
  id: 'task-1',
  templateId: 'template-1',
  clientId: 'client-1',
  name: 'Monthly Financial Review',
  description: 'Review and analyze financial statements',
  estimatedHours: 3,
  requiredSkills: ['CPA'],
  priority: 'Medium' as TaskPriority,
  category: 'Advisory' as TaskCategory,
  status: 'Unscheduled',
  dueDate: new Date('2023-06-15'),
  preferredStaffId: null,
  createdAt: new Date('2023-05-01'),
  updatedAt: new Date('2023-05-01'),
  recurrencePattern: {
    type: 'Monthly',
    interval: 1,
    dayOfMonth: 15
  },
  lastGeneratedDate: null,
  isActive: true
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Database Persistence Integration Tests - Phase 3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    mockValidateStaffExists.mockResolvedValue({ isValid: true, exists: true });
  });

  test('PHASE 3: End-to-end persistence flow - null to valid staff ID', async () => {
    // Setup: Task with null preferred staff ID
    const initialTask = { ...mockRecurringTask, preferredStaffId: null };
    
    // Mock successful update with staff selection
    const updatedTask = { ...initialTask, preferredStaffId: 'staff-1' };
    mockUpdateRecurringTask.mockResolvedValue(updatedTask);

    const mockOnSave = jest.fn().mockImplementation(async (taskUpdates) => {
      // Simulate the actual service call
      console.log('🧪 [Test] OnSave called with:', taskUpdates);
      return await mockUpdateRecurringTask('task-1', taskUpdates);
    });

    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={initialTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // Select a staff member
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('John Doe'));

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Verify the persistence flow
    await waitFor(() => {
      expect(mockValidateStaffExists).toHaveBeenCalledWith('staff-1');
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: 'staff-1'
        })
      );
      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', 
        expect.objectContaining({
          preferredStaffId: 'staff-1'
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
  });

  test('PHASE 3: End-to-end persistence flow - valid staff ID to null', async () => {
    // Setup: Task with existing preferred staff ID
    const initialTask = { ...mockRecurringTask, preferredStaffId: 'staff-2' };
    
    // Mock successful update to null
    const updatedTask = { ...initialTask, preferredStaffId: null };
    mockUpdateRecurringTask.mockResolvedValue(updatedTask);

    const mockOnSave = jest.fn().mockImplementation(async (taskUpdates) => {
      return await mockUpdateRecurringTask('task-1', taskUpdates);
    });

    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={initialTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load with initial selection
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // Change to "No preference"
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('No preference')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('No preference'));

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Verify the persistence flow
    await waitFor(() => {
      expect(mockValidateStaffExists).toHaveBeenCalledWith(null);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: null
        })
      );
      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', 
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
  });

  test('PHASE 3: Database persistence validation failure handling', async () => {
    // Setup: Mock staff validation failure
    mockValidateStaffExists.mockResolvedValue({
      isValid: false,
      exists: false,
      error: 'Staff member not found'
    });

    // Mock update rejection due to validation failure
    mockUpdateRecurringTask.mockRejectedValue(new Error('Invalid preferred staff: Staff member not found'));

    const mockOnSave = jest.fn().mockImplementation(async (taskUpdates) => {
      return await mockUpdateRecurringTask('task-1', taskUpdates);
    });

    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={mockRecurringTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // Select a staff member
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('John Doe'));

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Verify validation was called and error handling
    await waitFor(() => {
      expect(mockValidateStaffExists).toHaveBeenCalledWith('staff-1');
      expect(mockOnSave).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to update task');
      expect(screen.getByText('Invalid preferred staff: Staff member not found')).toBeInTheDocument();
    });
  });

  test('PHASE 3: Data persistence verification after successful update', async () => {
    // Setup: Simulate complete round-trip persistence
    const initialTask = { ...mockRecurringTask, preferredStaffId: null };
    const persistedTask = { ...initialTask, preferredStaffId: 'staff-3', updatedAt: new Date() };
    
    mockUpdateRecurringTask.mockResolvedValue(persistedTask);
    
    // Mock follow-up fetch to verify persistence
    mockGetRecurringTaskById.mockResolvedValue(persistedTask);

    const mockOnSave = jest.fn().mockImplementation(async (taskUpdates) => {
      const result = await mockUpdateRecurringTask('task-1', taskUpdates);
      
      // Simulate verification query
      await mockGetRecurringTaskById('task-1');
      
      return result;
    });

    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={initialTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // Select Bob Johnson
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Bob Johnson'));

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Verify complete persistence flow
    await waitFor(() => {
      expect(mockValidateStaffExists).toHaveBeenCalledWith('staff-3');
      expect(mockUpdateRecurringTask).toHaveBeenCalledWith('task-1', 
        expect.objectContaining({
          preferredStaffId: 'staff-3'
        })
      );
      expect(mockGetRecurringTaskById).toHaveBeenCalledWith('task-1');
    });

    expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
  });

  test('PHASE 3: Multiple staff ID changes in single session', async () => {
    // Test multiple changes without form submission to verify state handling
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={mockRecurringTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // First selection: John Doe
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('John Doe'));

    // Second selection: Jane Smith
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Jane Smith'));

    // Final selection: No preference
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('No preference')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('No preference'));

    // Submit form - should save final state (null)
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });
  });
});
