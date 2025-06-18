
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '../EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/services/staff/staffDropdownService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;
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

describe('Form Submission Integration - Phase 2 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
  });

  test('submits form with null preferred staff correctly', async () => {
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

    // Ensure "No preference" is selected (since task.preferredStaffId is null)
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('No preference')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('No preference'));

    // Submit form
    fireEvent.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
  });

  test('submits form with selected staff member correctly', async () => {
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

    // Select a staff member
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('John Doe'));

    // Submit form
    fireEvent.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: 'staff-1'
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
  });

  test('handles form submission error correctly', async () => {
    const mockOnSave = jest.fn().mockRejectedValue(new Error('Database error'));
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

    // Submit form
    fireEvent.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to update task');
    });

    // Error should be displayed in the form
    expect(screen.getByText('Database error')).toBeInTheDocument();
  });

  test('preserves preferred staff selection when switching between staff members', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    const mockOnOpenChange = jest.fn();

    render(
      <TestWrapper>
        <EditRecurringTaskDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          task={{
            ...mockRecurringTask,
            preferredStaffId: 'staff-1' // Start with a staff member selected
          }}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Wait for form to load with initial selection
    await waitFor(() => {
      expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
    });

    // Change to a different staff member
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Jane Smith'));

    // Then change to "No preference"
    fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
    await waitFor(() => {
      expect(screen.getByText('No preference')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('No preference'));

    // Submit form
    fireEvent.click(screen.getByText('Update Task'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredStaffId: null
        })
      );
    });
  });

  test('validates required fields before submission', async () => {
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

    // Clear the task name to trigger validation
    const nameInput = screen.getByDisplayValue('Monthly Financial Review');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Submit form
    fireEvent.click(screen.getByText('Update Task'));

    // Should not call onSave due to validation error
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    // Validation error should be displayed
    expect(screen.getByText('Task name is required')).toBeInTheDocument();
  });
});
