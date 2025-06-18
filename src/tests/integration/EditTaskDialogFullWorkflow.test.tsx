
/**
 * PHASE 5: Full Workflow Integration Test
 * 
 * End-to-end testing of the complete edit task dialog workflow
 * with comprehensive scenario coverage.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '@/components/clients/EditRecurringTaskDialog/EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { updateRecurringTask } from '@/services/clientTask/recurringTaskOperations';
import { validateStaffExists } from '@/services/clientTask/staffValidationService';
import { toast } from 'sonner';

// Mock all dependencies
jest.mock('@/services/staff/staffDropdownService');
jest.mock('@/services/clientTask/recurringTaskOperations');
jest.mock('@/services/clientTask/staffValidationService');
jest.mock('sonner');

const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;
const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockValidateStaffExists = validateStaffExists as jest.MockedFunction<typeof validateStaffExists>;
const mockToast = toast as jest.Mocked<typeof toast>;

const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' },
  { id: 'staff-3', full_name: 'Bob Wilson' },
  { id: 'staff-4', full_name: 'Alice Cooper' },
  { id: 'staff-5', full_name: 'Charlie Brown' }
];

const createMockTask = (overrides = {}): RecurringTask => ({
  id: 'task-1',
  templateId: 'template-1',
  clientId: 'client-1',
  name: 'Monthly Financial Review',
  description: 'Comprehensive monthly financial analysis',
  estimatedHours: 5,
  requiredSkills: ['CPA', 'Financial Analysis'],
  priority: 'Medium' as TaskPriority,
  category: 'Advisory' as TaskCategory,
  status: 'Unscheduled',
  dueDate: new Date('2023-12-15'),
  createdAt: new Date('2023-11-01'),
  updatedAt: new Date('2023-11-01'),
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

describe('PHASE 5: Full Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    mockValidateStaffExists.mockResolvedValue({ isValid: true, exists: true });
    mockUpdateRecurringTask.mockResolvedValue(createMockTask());
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  describe('Complete Workflow Scenarios', () => {
    test('WORKFLOW: Complete edit with all field types', async () => {
      const task = createMockTask({ preferredStaffId: 'staff-2' });
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={task}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
      });

      // Verify initial staff selection
      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Jane Smith');
      });

      // Update all field types
      
      // Text fields
      fireEvent.change(screen.getByDisplayValue('Monthly Financial Review'), {
        target: { value: 'Quarterly Business Review' }
      });
      
      fireEvent.change(screen.getByDisplayValue('Comprehensive monthly financial analysis'), {
        target: { value: 'Detailed quarterly business analysis and strategic planning' }
      });

      // Number field
      fireEvent.change(screen.getByDisplayValue('5'), {
        target: { value: '8' }
      });

      // Dropdown fields
      fireEvent.click(screen.getByRole('combobox', { name: /priority/i }));
      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('High'));

      fireEvent.click(screen.getByRole('combobox', { name: /category/i }));
      await waitFor(() => {
        expect(screen.getByText('Compliance')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Compliance'));

      // Staff selection
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Alice Cooper'));

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      // Verify comprehensive update
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Quarterly Business Review',
            description: 'Detailed quarterly business analysis and strategic planning',
            estimatedHours: 8,
            priority: 'High',
            category: 'Compliance',
            preferredStaffId: 'staff-4'
          })
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');

      console.log('✅ WORKFLOW: Complete edit with all field types');
    });

    test('WORKFLOW: Staff preference workflow scenarios', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      // Scenario 1: No staff to selected staff
      const { rerender } = render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask({ preferredStaffId: null })}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
      });

      // Select staff
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Bob Wilson'));

      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ preferredStaffId: 'staff-3' })
        );
      });

      // Scenario 2: Selected staff to different staff
      jest.clearAllMocks();
      
      rerender(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask({ preferredStaffId: 'staff-1' })}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('John Doe');
      });

      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Charlie Brown'));

      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ preferredStaffId: 'staff-5' })
        );
      });

      // Scenario 3: Selected staff to no preference
      jest.clearAllMocks();
      
      rerender(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask({ preferredStaffId: 'staff-2' })}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Jane Smith');
      });

      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('No preference')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('No preference'));

      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ preferredStaffId: null })
        );
      });

      console.log('✅ WORKFLOW: Staff preference workflow scenarios');
    });

    test('WORKFLOW: Error recovery and retry scenarios', async () => {
      // Scenario 1: Network error with retry
      mockGetActiveStaffForDropdown
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(mockStaffOptions);

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask()}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
      });

      // Retry should work
      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.queryByText(/Failed to load staff data/i)).not.toBeInTheDocument();
      });

      // Form should be functional after retry
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /preferred staff/i })).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      console.log('✅ WORKFLOW: Error recovery and retry scenarios');
    });

    test('WORKFLOW: Form validation with mixed valid/invalid states', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask()}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
      });

      // Make invalid change
      fireEvent.change(screen.getByDisplayValue('Monthly Financial Review'), {
        target: { value: '' }
      });

      // Valid staff selection
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      // Try to submit with invalid name
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      // Should not submit due to validation error
      expect(mockOnSave).not.toHaveBeenCalled();
      
      await waitFor(() => {
        expect(screen.getByText('Task name is required')).toBeInTheDocument();
      });

      // Fix validation error
      fireEvent.change(screen.getByDisplayValue(''), {
        target: { value: 'Fixed Task Name' }
      });

      // Now submission should work
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Fixed Task Name',
            preferredStaffId: 'staff-1'
          })
        );
      });

      console.log('✅ WORKFLOW: Form validation with mixed valid/invalid states');
    });

    test('WORKFLOW: Performance under rapid user interactions', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask()}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Rapid interactions
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
        
        await waitFor(() => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('John Doe'));
        
        fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
        
        await waitFor(() => {
          expect(screen.getByText('No preference')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('No preference'));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid interactions efficiently
      expect(totalTime).toBeLessThan(5000);

      // Final state should be consistent
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ preferredStaffId: null })
        );
      });

      console.log(`✅ WORKFLOW: Performance under rapid interactions: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Edge Case Integration Tests', () => {
    test('EDGE CASE: Large task with complex data', async () => {
      const complexTask = createMockTask({
        name: 'Very Long Task Name That Exceeds Normal Length Expectations for Testing Purposes',
        description: 'This is an extremely detailed description that contains multiple paragraphs of information about the task requirements, expected outcomes, and detailed instructions for completion. It should test how the form handles larger amounts of text data and ensure that the interface remains responsive and usable.',
        estimatedHours: 999.75,
        requiredSkills: ['CPA', 'Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Financial Analysis', 'Strategic Planning'],
        preferredStaffId: 'staff-3'
      });

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      const startTime = performance.now();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={complexTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue(complexTask.name)).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(3000);

      // Verify complex data is handled correctly
      expect(screen.getByDisplayValue(complexTask.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue('999.75')).toBeInTheDocument();

      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Bob Wilson');
      });

      console.log(`✅ EDGE CASE: Large task with complex data handled in ${renderTime.toFixed(2)}ms`);
    });

    test('EDGE CASE: Concurrent form operations', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={createMockTask()}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Financial Review')).toBeInTheDocument();
      });

      // Simulate concurrent operations
      act(() => {
        fireEvent.change(screen.getByDisplayValue('Monthly Financial Review'), {
          target: { value: 'Updated Name' }
        });
        
        fireEvent.change(screen.getByDisplayValue('5'), {
          target: { value: '10' }
        });
      });

      act(() => {
        fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Jane Smith'));
      });

      // Verify all changes are preserved
      expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Name',
            estimatedHours: 10,
            preferredStaffId: 'staff-2'
          })
        );
      });

      console.log('✅ EDGE CASE: Concurrent form operations handled correctly');
    });
  });
});
