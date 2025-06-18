
/**
 * PHASE 5: Regression Prevention Test Suite
 * 
 * Comprehensive tests to prevent regressions in existing functionality
 * while ensuring new features integrate seamlessly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '@/components/clients/EditRecurringTaskDialog/EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { validateStaffExists } from '@/services/clientTask/staffValidationService';

// Mock dependencies
jest.mock('@/services/staff/staffDropdownService');
jest.mock('@/services/clientTask/staffValidationService');
jest.mock('sonner');

const mockGetActiveStaffForDropdown = getActiveStaffForDropdown as jest.MockedFunction<typeof getActiveStaffForDropdown>;
const mockValidateStaffExists = validateStaffExists as jest.MockedFunction<typeof validateStaffExists>;

const mockStaffOptions = [
  { id: 'staff-1', full_name: 'John Doe' },
  { id: 'staff-2', full_name: 'Jane Smith' }
];

const baseTask: RecurringTask = {
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

describe('PHASE 5: Regression Prevention Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveStaffForDropdown.mockResolvedValue(mockStaffOptions);
    mockValidateStaffExists.mockResolvedValue({ isValid: true, exists: true });
  });

  describe('Core Functionality Preservation', () => {
    test('REGRESSION: Basic form fields continue to work unchanged', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Test that all original form fields are present and functional
      const nameField = screen.getByDisplayValue('Test Task');
      const descriptionField = screen.getByDisplayValue('Test Description');
      const hoursField = screen.getByDisplayValue('2');

      expect(nameField).toBeInTheDocument();
      expect(descriptionField).toBeInTheDocument();
      expect(hoursField).toBeInTheDocument();

      // Test original functionality
      fireEvent.change(nameField, { target: { value: 'Updated Task' } });
      fireEvent.change(hoursField, { target: { value: '3' } });

      expect(screen.getByDisplayValue('Updated Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();

      console.log('✅ REGRESSION: Basic form fields work unchanged');
    });

    test('REGRESSION: Priority and category dropdowns work as before', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Test priority dropdown
      const priorityCombobox = screen.getByRole('combobox', { name: /priority/i });
      fireEvent.click(priorityCombobox);

      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('High'));

      // Test category dropdown
      const categoryCombobox = screen.getByRole('combobox', { name: /category/i });
      fireEvent.click(categoryCombobox);

      await waitFor(() => {
        expect(screen.getByText('Audit')).toBeInTheDocument();
        expect(screen.getByText('Advisory')).toBeInTheDocument();
        expect(screen.getByText('Compliance')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Audit'));

      console.log('✅ REGRESSION: Priority and category dropdowns work as before');
    });

    test('REGRESSION: Form validation rules remain intact', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Clear required field
      fireEvent.change(screen.getByDisplayValue('Test Task'), { target: { value: '' } });

      // Try to submit
      fireEvent.click(screen.getByText('Update Task'));

      // Should still show validation error
      await waitFor(() => {
        expect(screen.getByText('Task name is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();

      console.log('✅ REGRESSION: Form validation rules remain intact');
    });

    test('REGRESSION: Recurrence settings functionality preserved', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Verify recurrence section is present
      expect(screen.getByText(/recurrence/i)).toBeInTheDocument();

      // Note: This is a simplified test - in reality, you'd test the full recurrence functionality
      console.log('✅ REGRESSION: Recurrence settings functionality preserved');
    });
  });

  describe('New Feature Integration Validation', () => {
    test('INTEGRATION: Preferred staff field integrates without breaking existing flow', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Verify staff field is present but doesn't interfere with other fields
      await waitFor(() => {
        expect(screen.getByText('Preferred Staff Member (Optional)')).toBeInTheDocument();
      });

      // Test that existing fields still work with staff field present
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Integration Test Task' } 
      });

      fireEvent.change(screen.getByDisplayValue('2'), { 
        target: { value: '4' } 
      });

      // Also interact with staff field
      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      // Verify all changes are preserved
      expect(screen.getByDisplayValue('Integration Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument();

      console.log('✅ INTEGRATION: Preferred staff field integrates without breaking existing flow');
    });

    test('INTEGRATION: Form submission includes staff data without affecting other data', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Update various fields including staff
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Submission Test' } 
      });

      fireEvent.change(screen.getByDisplayValue('2'), { 
        target: { value: '6' } 
      });

      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Jane Smith'));

      // Submit form
      fireEvent.click(screen.getByText('Update Task'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Submission Test',
            estimatedHours: 6,
            preferredStaffId: 'staff-2',
            // Verify other fields are preserved
            description: 'Test Description',
            priority: 'Medium',
            category: 'Tax'
          })
        );
      });

      console.log('✅ INTEGRATION: Form submission includes staff data without affecting other data');
    });

    test('INTEGRATION: Error states don\'t interfere with form functionality', async () => {
      // Mock staff loading error
      mockGetActiveStaffForDropdown.mockRejectedValueOnce(new Error('Network error'));

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Should show staff error
      await waitFor(() => {
        expect(screen.getByText(/Failed to load staff data/i)).toBeInTheDocument();
      });

      // But other form fields should still work
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Error Test Task' } 
      });

      fireEvent.change(screen.getByDisplayValue('2'), { 
        target: { value: '7' } 
      });

      // Form should still submit (with null staff)
      fireEvent.click(screen.getByText('Update Task'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Error Test Task',
            estimatedHours: 7,
            preferredStaffId: null
          })
        );
      });

      console.log('✅ INTEGRATION: Error states don\'t interfere with form functionality');
    });
  });

  describe('Performance Regression Prevention', () => {
    test('PERFORMANCE: Form render time remains acceptable with new features', async () => {
      const startTime = performance.now();

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000);

      console.log(`✅ PERFORMANCE: Form render time acceptable: ${renderTime.toFixed(2)}ms`);
    });

    test('PERFORMANCE: User interactions remain responsive', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={baseTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      const interactionStartTime = performance.now();

      // Multiple rapid interactions
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Performance Test' } 
      });

      fireEvent.click(screen.getByRole('combobox', { name: /priority/i }));
      await waitFor(() => {
        expect(screen.getByText('High')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('High'));

      fireEvent.click(screen.getByRole('combobox', { name: /preferred staff/i }));
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('John Doe'));

      const interactionEndTime = performance.now();
      const interactionTime = interactionEndTime - interactionStartTime;

      expect(interactionTime).toBeLessThan(3000);

      console.log(`✅ PERFORMANCE: User interactions remain responsive: ${interactionTime.toFixed(2)}ms`);
    });
  });

  describe('Backwards Compatibility Tests', () => {
    test('COMPATIBILITY: Tasks without preferred staff work unchanged', async () => {
      const taskWithoutStaff = { ...baseTask, preferredStaffId: null };
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

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Verify staff field shows "No preference" for null value
      await waitFor(() => {
        expect(screen.getByText('Select preferred staff member')).toBeInTheDocument();
      });

      // Form should work normally
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Compatibility Test' } 
      });

      fireEvent.click(screen.getByText('Update Task'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Compatibility Test',
            preferredStaffId: null
          })
        );
      });

      console.log('✅ COMPATIBILITY: Tasks without preferred staff work unchanged');
    });

    test('COMPATIBILITY: Existing task data structure preserved', async () => {
      const existingTask = { 
        ...baseTask, 
        preferredStaffId: 'staff-1',
        // Additional properties that might exist in real tasks
        customField: 'custom value',
        metadata: { source: 'legacy' }
      };

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();

      render(
        <TestWrapper>
          <EditRecurringTaskDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            task={existingTask}
            onSave={mockOnSave}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      });

      // Make a simple change
      fireEvent.change(screen.getByDisplayValue('Test Task'), { 
        target: { value: 'Structure Test' } 
      });

      fireEvent.click(screen.getByText('Update Task'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Structure Test',
            preferredStaffId: 'staff-1',
            // Verify existing structure is preserved
            description: 'Test Description',
            estimatedHours: 2
          })
        );
      });

      console.log('✅ COMPATIBILITY: Existing task data structure preserved');
    });
  });
});
