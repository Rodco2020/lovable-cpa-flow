/**
 * PHASE 5: Comprehensive Regression Testing Suite for Preferred Staff Functionality
 * 
 * This test suite ensures that all existing functionality remains intact
 * while validating the new preferred staff features work correctly.
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

// Test data
const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' },
  { id: 'staff-3', full_name: 'Bob Wilson' },
  { id: 'staff-4', full_name: 'Alice Cooper' },
  { id: 'staff-5', full_name: 'Mike Johnson' }
];

const baseRecurringTask: RecurringTask = {
  id: 'task-1',
  templateId: 'template-1',
  clientId: 'client-1',
  name: 'Monthly Tax Review',
  description: 'Review monthly tax obligations',
  estimatedHours: 4,
  requiredSkills: ['Tax', 'CPA'],
  priority: 'Medium' as TaskPriority,
  category: 'Tax' as TaskCategory,
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
  preferredStaffId: null
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

describe('PHASE 5: Preferred Staff Regression Testing Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    mockValidateStaffExists.mockResolvedValue({ isValid: true, exists: true });
  });

  describe('Existing Functionality Preservation Tests', () => {
    test('REGRESSION: Tasks without preferred staff continue to work correctly', async () => {
      const taskWithoutStaff = { ...baseRecurringTask, preferredStaffId: null };
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithoutStaff}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Verify form still works for basic fields
      const nameField = screen.getByDisplayValue('Monthly Tax Review');
      fireEvent.change(nameField, { target: { value: 'Updated Tax Review' } });

      const hoursField = screen.getByDisplayValue('4');
      fireEvent.change(hoursField, { target: { value: '5' } });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      // Verify save was called with correct data
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Tax Review',
            estimatedHours: 5,
            preferredStaffId: null
          })
        );
      });

      console.log('✅ REGRESSION: Tasks without preferred staff work correctly');
    });

    test('REGRESSION: All original form fields maintain their functionality', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Test all form fields
      fireEvent.change(screen.getByDisplayValue('Monthly Tax Review'), { 
        target: { value: 'Quarterly Tax Review' } 
      });
      fireEvent.change(screen.getByDisplayValue('Review monthly tax obligations'), { 
        target: { value: 'Updated description' } 
      });
      fireEvent.change(screen.getByDisplayValue('4'), { 
        target: { value: '6' } 
      });

      // Test priority dropdown
      fireEvent.click(screen.getByRole('combobox', { name: /priority/i }));
      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('High'));

      // Test category dropdown
      fireEvent.click(screen.getByRole('combobox', { name: /category/i }));
      await waitFor(() => {
        expect(screen.getByText('Audit')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Audit'));

      // Submit and verify
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Quarterly Tax Review',
            description: 'Updated description',
            estimatedHours: 6,
            priority: 'High',
            category: 'Audit'
          })
        );
      });

      console.log('✅ REGRESSION: All original form fields maintain functionality');
    });

    test('REGRESSION: Form validation continues to work for required fields', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Clear required field
      fireEvent.change(screen.getByDisplayValue('Monthly Tax Review'), { 
        target: { value: '' } 
      });

      // Try to submit
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Task name is required')).toBeInTheDocument();
      });

      console.log('✅ REGRESSION: Form validation works for required fields');
    });
  });

  describe('Staff Selection Integration Tests', () => {
    test('INTEGRATION: Staff selection works correctly with existing form flow', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Select a staff member
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      // Also update other fields to ensure integration
      fireEvent.change(screen.getByDisplayValue('4'), { target: { value: '3' } });

      // Submit
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            preferredStaffId: 'staff-1',
            estimatedHours: 3
          })
        );
      });

      console.log('✅ INTEGRATION: Staff selection integrates with form flow');
    });

    test('INTEGRATION: Staff selection persistence across form changes', async () => {
      const taskWithStaff = { ...baseRecurringTask, preferredStaffId: 'staff-2' };
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithStaff}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Verify initial staff selection is preserved
      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Jane Smith');
      });

      // Make other changes
      fireEvent.change(screen.getByDisplayValue('Monthly Tax Review'), { 
        target: { value: 'Weekly Tax Review' } 
      });

      // Staff selection should persist
      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Jane Smith');
      });

      // Submit
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Weekly Tax Review',
            preferredStaffId: 'staff-2'
          })
        );
      });

      console.log('✅ INTEGRATION: Staff selection persists across form changes');
    });
  });

  describe('Performance Validation Tests', () => {
    test('PERFORMANCE: Form remains responsive with large staff list', async () => {
      // Mock large staff list
      const largeStaffList = Array.from({ length: 100 }, (_, i) => ({
        id: `staff-${i}`,
        full_name: `Staff Member ${i}`
      }));
      
      mockGetActiveStaffForDropdown.mockResolvedValueOnce(largeStaffList);

      const startTime = performance.now();
      
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time even with large staff list
      expect(renderTime).toBeLessThan(3000);

      // Test dropdown performance
      const dropdownStartTime = performance.now();
      
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Staff Member 0')).toBeInTheDocument();
      });

      const dropdownEndTime = performance.now();
      const dropdownTime = dropdownEndTime - dropdownStartTime;

      expect(dropdownTime).toBeLessThan(1000);

      console.log(`✅ PERFORMANCE: Large staff list performance acceptable - Render: ${renderTime.toFixed(2)}ms, Dropdown: ${dropdownTime.toFixed(2)}ms`);
    });

    test('PERFORMANCE: Form submission remains fast with staff validation', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Select staff and submit
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const submitStartTime = performance.now();

      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const submitEndTime = performance.now();
      const submitTime = submitEndTime - submitStartTime;

      // Form submission should be fast
      expect(submitTime).toBeLessThan(2000);

      console.log(`✅ PERFORMANCE: Form submission with staff validation: ${submitTime.toFixed(2)}ms`);
    });
  });

  describe('Error Handling Regression Tests', () => {
    test('REGRESSION: Error handling doesn\'t break existing form functionality', async () => {
      // Mock staff loading error
      mockGetActiveStaffForDropdown.mockRejectedValueOnce(new Error('Network error'));

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseRecurringTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Should show staff error but form should still work
      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
      });

      // Other form fields should still work
      fireEvent.change(screen.getByDisplayValue('Monthly Tax Review'), { 
        target: { value: 'Updated Task Name' } 
      });

      fireEvent.change(screen.getByDisplayValue('4'), { 
        target: { value: '2' } 
      });

      // Form should still submit successfully (with null preferredStaffId)
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Task Name',
            estimatedHours: 2,
            preferredStaffId: null
          })
        );
      });

      console.log('✅ REGRESSION: Error handling doesn\'t break form functionality');
    });
  });

  describe('Comprehensive Scenario Tests', () => {
    test('COMPREHENSIVE: Complete edit workflow with all features', async () => {
      const taskWithStaff = { ...baseRecurringTask, preferredStaffId: 'staff-3' };
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={taskWithStaff}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Verify initial state
      expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();
      
      await waitFor(() => {
        const staffTrigger = screen.getByRole('combobox', { name: /preferred staff/i });
        expect(staffTrigger).toHaveTextContent('Bob Wilson');
      });

      // Make comprehensive changes
      fireEvent.change(screen.getByDisplayValue('Monthly Tax Review'), { 
        target: { value: 'Comprehensive Tax Analysis' } 
      });
      
      fireEvent.change(screen.getByDisplayValue('Review monthly tax obligations'), { 
        target: { value: 'Comprehensive quarterly tax analysis and compliance review' } 
      });
      
      fireEvent.change(screen.getByDisplayValue('4'), { 
        target: { value: '8' } 
      });

      // Change priority
      fireEvent.click(screen.getByRole('combobox', { name: /priority/i }));
      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('High'));

      // Change staff
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Alice Cooper'));

      // Submit comprehensive changes
      await act(async () => {
        fireEvent.click(screen.getByText('Update Task'));
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Comprehensive Tax Analysis',
            description: 'Comprehensive quarterly tax analysis and compliance review',
            estimatedHours: 8,
            priority: 'High',
            preferredStaffId: 'staff-4'
          })
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');

      console.log('✅ COMPREHENSIVE: Complete edit workflow works with all features');
    });
  });
});
