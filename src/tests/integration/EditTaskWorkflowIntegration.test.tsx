
/**
 * Integration Tests for Edit Task Workflow
 * 
 * Tests the complete end-to-end workflow including dialog opening,
 * form interaction, data validation, service calls, and state updates.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditRecurringTaskDialog from '@/components/clients/EditRecurringTaskDialog/EditRecurringTaskDialog';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { SkillCategory } from '@/types/skill';
import { StaffStatus } from '@/types/staff';
import { updateRecurringTask, getRecurringTaskById } from '@/services/taskService';
import { skillValidationService } from '@/services/skillValidationService';
import { getAllSkills } from '@/services/skillService';
import { getAllStaff } from '@/services/staffService';

// Mock all service dependencies
jest.mock('@/services/taskService');
jest.mock('@/services/skillValidationService');
jest.mock('@/services/skillService');
jest.mock('@/services/staffService');
jest.mock('sonner');

const mockUpdateRecurringTask = updateRecurringTask as jest.MockedFunction<typeof updateRecurringTask>;
const mockGetRecurringTaskById = getRecurringTaskById as jest.MockedFunction<typeof getRecurringTaskById>;
const mockSkillValidationService = skillValidationService as jest.Mocked<typeof skillValidationService>;
const mockGetAllSkills = getAllSkills as jest.MockedFunction<typeof getAllSkills>;
const mockGetAllStaff = getAllStaff as jest.MockedFunction<typeof getAllStaff>;

describe('Edit Task Workflow Integration Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  const mockTask: RecurringTask = {
    id: 'task-1',
    templateId: 'template-1',
    clientId: 'client-1',
    name: 'Monthly Tax Review',
    description: 'Monthly review of tax documents',
    estimatedHours: 3,
    requiredSkills: ['tax-preparation', 'document-review'],
    priority: 'Medium' as TaskPriority,
    category: 'Tax' as TaskCategory,
    status: 'Unscheduled',
    dueDate: new Date('2024-03-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    recurrencePattern: {
      type: 'Monthly',
      interval: 1,
      dayOfMonth: 15
    },
    lastGeneratedDate: null,
    isActive: true,
    preferredStaffId: 'staff-1'
  };

  const mockSkills = [
    { 
      id: 'tax-preparation', 
      name: 'Tax Preparation', 
      category: 'Tax' as SkillCategory,
      description: 'Tax preparation skills',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    { 
      id: 'document-review', 
      name: 'Document Review', 
      category: 'Administrative' as SkillCategory,
      description: 'Document review skills',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    { 
      id: 'audit-support', 
      name: 'Audit Support', 
      category: 'Audit' as SkillCategory,
      description: 'Audit support skills',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockStaff = [
    { 
      id: 'staff-1', 
      fullName: 'John Smith', 
      email: 'john@example.com',
      roleTitle: 'Senior Tax Specialist',
      skills: ['tax-preparation'],
      assignedSkills: ['tax-preparation'],
      costPerHour: 75,
      phone: '555-0101',
      status: 'active' as StaffStatus,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    { 
      id: 'staff-2', 
      fullName: 'Jane Doe', 
      email: 'jane@example.com',
      roleTitle: 'Document Specialist',
      skills: ['document-review'],
      assignedSkills: ['document-review'],
      costPerHour: 65,
      phone: '555-0102',
      status: 'active' as StaffStatus,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
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
    mockGetAllSkills.mockResolvedValue(mockSkills);
    mockGetAllStaff.mockResolvedValue(mockStaff);
    mockSkillValidationService.validateSkillIds.mockResolvedValue({
      valid: ['tax-preparation', 'document-review'],
      invalid: [],
      details: mockSkills.slice(0, 2).map(skill => ({ id: skill.id, name: skill.name }))
    });
    mockUpdateRecurringTask.mockResolvedValue(undefined); // Fix: Return void instead of boolean
    mockGetRecurringTaskById.mockResolvedValue(mockTask);

    jest.clearAllMocks();
  });

  const renderDialog = (props: Partial<React.ComponentProps<typeof EditRecurringTaskDialog>> = {}) => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      task: mockTask,
      onSave: jest.fn(),
      isLoading: false,
      loadError: null,
      attemptedLoad: true
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <EditRecurringTaskDialog {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe('Dialog Opening and Loading', () => {
    test('displays loading state correctly', () => {
      renderDialog({ isLoading: true, task: null, attemptedLoad: false });
      
      expect(screen.getByText('Loading task details...')).toBeInTheDocument();
    });

    test('displays error state correctly', () => {
      renderDialog({ 
        task: null, 
        loadError: 'Task not found', 
        attemptedLoad: true 
      });
      
      expect(screen.getByText('Error Loading Task')).toBeInTheDocument();
      expect(screen.getByText('Task not found')).toBeInTheDocument();
    });

    test('renders form with task data when loaded', async () => {
      renderDialog();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Monthly review of tax documents')).toBeInTheDocument();
        expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    test('allows editing basic task information', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Monthly Tax Review');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Tax Review');

      const descriptionInput = screen.getByDisplayValue('Monthly review of tax documents');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');

      const hoursInput = screen.getByDisplayValue('3');
      await user.clear(hoursInput);
      await user.type(hoursInput, '4.5');

      expect(screen.getByDisplayValue('Updated Tax Review')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4.5')).toBeInTheDocument();
    });

    test('allows changing priority and category', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // Change priority
      const priorityTrigger = screen.getByRole('combobox', { name: /priority/i });
      await user.click(priorityTrigger);
      await user.click(screen.getByText('High'));

      // Change category
      const categoryTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryTrigger);
      await user.click(screen.getByText('Audit'));

      // Verify selections
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Audit')).toBeInTheDocument();
    });

    test('handles skill selection correctly', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // Skills should be pre-selected based on task data
      // This test would need the actual SkillsSelection component implementation
      // to verify skill selection behavior
    });

    test('handles preferred staff selection', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Edit Recurring Task')).toBeInTheDocument();
      });

      // The preferred staff should be pre-selected
      // This test would need the actual PreferredStaffField component implementation
      // to verify staff selection behavior
    });
  });

  describe('Form Validation', () => {
    test('validates required fields on submission', async () => {
      const mockOnSave = jest.fn();
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Clear required field
      const nameInput = screen.getByDisplayValue('Monthly Tax Review');
      await user.clear(nameInput);

      // Submit form
      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      // Should not call onSave due to validation error
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('validates estimated hours range', async () => {
      const mockOnSave = jest.fn();
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      });

      // Set invalid hours
      const hoursInput = screen.getByDisplayValue('3');
      await user.clear(hoursInput);
      await user.type(hoursInput, '0.1');

      // Submit form
      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      // Should not call onSave due to validation error
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Successful Form Submission', () => {
    test('submits form with valid data successfully', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnOpenChange = jest.fn();
      
      renderDialog({ onSave: mockOnSave, onOpenChange: mockOnOpenChange });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      // Make a simple change
      const nameInput = screen.getByDisplayValue('Monthly Tax Review');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Task Name');

      // Submit form
      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Task Name'
          })
        );
      });

      // Dialog should close on success
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('shows loading state during submission', async () => {
      const mockOnSave = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    test('handles skill validation errors', async () => {
      mockSkillValidationService.validateSkillIds.mockResolvedValue({
        valid: ['tax-preparation'],
        invalid: ['invalid-skill'],
        details: [
          { id: 'tax-preparation', name: 'Tax Preparation' },
          { id: 'invalid-skill', error: 'Skill not found' }
        ]
      });

      const mockOnSave = jest.fn();
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      // Should show skill validation error
      await waitFor(() => {
        expect(screen.getByText(/some selected skills are invalid/i)).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('handles submission errors', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Network error'));
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Recurrence Pattern Handling', () => {
    test('handles monthly recurrence pattern correctly', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            recurrencePattern: expect.objectContaining({
              type: 'Monthly',
              interval: 1,
              dayOfMonth: 15
            })
          })
        );
      });
    });

    test('handles weekly recurrence pattern correctly', async () => {
      const weeklyTask = {
        ...mockTask,
        recurrencePattern: {
          type: 'Weekly' as const,
          interval: 2,
          weekdays: [1, 3, 5]
        }
      };

      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      renderDialog({ task: weeklyTask, onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            recurrencePattern: expect.objectContaining({
              type: 'Weekly',
              interval: 2,
              weekdays: [1, 3, 5]
            })
          })
        );
      });
    });
  });

  describe('Preferred Staff Handling', () => {
    test('preserves preferred staff assignment', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      renderDialog({ onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            preferredStaffId: 'staff-1'
          })
        );
      });
    });

    test('handles null preferred staff correctly', async () => {
      const taskWithoutStaff = { ...mockTask, preferredStaffId: null };
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      renderDialog({ task: taskWithoutStaff, onSave: mockOnSave });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            preferredStaffId: null
          })
        );
      });
    });
  });

  describe('Dialog Management', () => {
    test('closes dialog when cancel is clicked', async () => {
      const mockOnOpenChange = jest.fn();
      renderDialog({ onOpenChange: mockOnOpenChange });

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('prevents closing dialog during submission', async () => {
      const mockOnSave = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      const mockOnOpenChange = jest.fn();
      
      renderDialog({ onSave: mockOnSave, onOpenChange: mockOnOpenChange });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monthly Tax Review')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Update Task');
      await user.click(submitButton);

      // Try to cancel during submission
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });
});
