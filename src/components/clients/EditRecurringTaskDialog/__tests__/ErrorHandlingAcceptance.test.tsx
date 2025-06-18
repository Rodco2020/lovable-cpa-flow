
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '../EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { updateRecurringTask } from '@/services/clientTask/recurringTaskOperations';
import { validateStaffExists } from '@/services/clientTask/staffValidationService';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/services/staff/staffDropdownService');
jest.mock('@/services/clientTask/recurringTaskOperations');
jest.mock('@/services/clientTask/staffValidationService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }
}));

const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;
const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockValidateStaffExists = validateStaffExists as jest.MockedFunction<typeof validateStaffExists>;
const mockToast = toast as jest.Mocked<typeof toast>;

const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' }
];

const mockRecurringTask: RecurringTask = {
  id: 'task-1',
  templateId: 'template-1',
  clientId: 'client-1',
  name: 'Test Task',
  description: 'Test Description',
  estimatedHours: 2,
  requiredSkills: ['CPA'],
  priority: 'Medium' as TaskPriority,
  category: 'Tax' as TaskCategory,
  status: 'Unscheduled',
  dueDate: new Date('2023-06-15'),
  preferredStaffId: 'staff-1',
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

describe('Error Handling User Acceptance Tests - Phase 4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateStaffExists.mockResolvedValue({ isValid: true, exists: true });
  });

  test('PHASE 4: Network error handling with retry functionality', async () => {
    // Mock network error
    mockGetActiveStaffForDropdown.mockRejectedValueOnce(new Error('Network error'));
    mockGetActiveStaffForDropdown.mockResolvedValueOnce(mockStaffOptions);

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

    // Should show network error
    await waitFor(() => {
      expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
    });

    // Should have retry button
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryButton);

    // Should eventually load staff options
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load staff data/i)).not.toBeInTheDocument();
    });
  });

  test('PHASE 4: Invalid staff selection with recovery options', async () => {
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    
    // Mock task with invalid staff ID
    const invalidTask = { 
      ...mockRecurringTask, 
      preferredStaffId: 'invalid-staff-id' 
    };

    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={invalidTask}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    // Should show validation error for invalid staff
    await waitFor(() => {
      expect(screen.getByText(/Selected staff member is no longer available/i)).toBeInTheDocument();
    });
  });

  test('PHASE 4: Form submission error with user-friendly feedback', async () => {
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    
    // Mock submission error
    mockUpdateRecurringTask.mockRejectedValue(new Error('Staff member not found'));
    mockValidateStaffExists.mockResolvedValue({
      isValid: false,
      exists: false,
      error: 'Staff member not found'
    });

    const mockOnSave = jest.fn().mockImplementation(async () => {
      throw new Error('Staff member not found');
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
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Staff member not found/i)).toBeInTheDocument();
    });

    // Should show error toast
    expect(mockToast.error).toHaveBeenCalled();
  });

  test('PHASE 4: Loading states and visual feedback', async () => {
    // Mock slow loading
    let resolveStaffOptions: (value: any) => void;
    const staffPromise = new Promise(resolve => {
      resolveStaffOptions = resolve;
    });
    mockGetActiveStaffForDropdown.mockReturnValue(staffPromise as any);

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

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Loading staff.../i)).toBeInTheDocument();
    });

    // Resolve the promise
    act(() => {
      resolveStaffOptions!(mockStaffOptions);
    });

    // Should show loaded state
    await waitFor(() => {
      expect(screen.queryByText(/Loading staff.../i)).not.toBeInTheDocument();
    });
  });

  test('PHASE 4: Staff selection persistence after errors', async () => {
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    
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
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    // Should maintain the initial staff selection (John Doe)
    await waitFor(() => {
      const preferredStaffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
      expect(preferredStaffTrigger).toHaveTextContent('John Doe');
    });

    // Change selection to Jane Smith
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Jane Smith'));

    // Selection should persist
    await waitFor(() => {
      const preferredStaffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
      expect(preferredStaffTrigger).toHaveTextContent('Jane Smith');
    });
  });

  test('PHASE 4: Validation feedback for empty required fields', async () => {
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    
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
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    // Clear required field
    const nameField = screen.getByDisplayValue('Test Task');
    fireEvent.change(nameField, { target: { value: '' } });

    // Try to submit
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Task name is required/i)).toBeInTheDocument();
    });
  });

  test('PHASE 4: Success feedback with clear messaging', async () => {
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    mockUpdateRecurringTask.mockResolvedValue(mockRecurringTask);

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
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Update Task'));
    });

    // Should show success feedback
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Task updated successfully",
        expect.objectContaining({
          description: "Staff preference has been saved"
        })
      );
    });
  });
});
