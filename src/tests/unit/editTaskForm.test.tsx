
/**
 * Unit Tests for Edit Task Form Hook
 * 
 * Tests form validation, data transformation, and error handling scenarios
 * to ensure the unified type system works correctly.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useEditTaskForm } from '@/components/clients/EditRecurringTaskDialog/hooks/useEditTaskForm';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';
import { skillValidationService } from '@/services/skillValidationService';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/services/skillValidationService');
jest.mock('sonner');

const mockSkillValidationService = skillValidationService as jest.Mocked<typeof skillValidationService>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useEditTaskForm Hook Unit Tests', () => {
  const mockTask: RecurringTask = {
    id: 'task-1',
    templateId: 'template-1',
    clientId: 'client-1',
    name: 'Test Task',
    description: 'Test Description',
    estimatedHours: 2.5,
    requiredSkills: ['skill-1', 'skill-2'],
    priority: 'Medium' as TaskPriority,
    category: 'Tax' as TaskCategory,
    status: 'Unscheduled',
    dueDate: new Date('2024-01-15'),
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

  const mockOnSave = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSkillValidationService.validateSkillIds.mockResolvedValue({
      valid: ['skill-1', 'skill-2'],
      invalid: [],
      details: [
        { id: 'skill-1', name: 'Skill 1' },
        { id: 'skill-2', name: 'Skill 2' }
      ]
    });
  });

  describe('Form Initialization', () => {
    test('initializes form with task data correctly', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await waitFor(() => {
        const formValues = result.current.form.getValues();
        expect(formValues.name).toBe('Test Task');
        expect(formValues.description).toBe('Test Description');
        expect(formValues.estimatedHours).toBe(2.5);
        expect(formValues.priority).toBe('Medium');
        expect(formValues.category).toBe('Tax');
        expect(formValues.requiredSkills).toEqual(['skill-1', 'skill-2']);
        expect(formValues.preferredStaffId).toBe('staff-1');
        expect(formValues.recurrenceType).toBe('Monthly');
        expect(formValues.interval).toBe(1);
        expect(formValues.dayOfMonth).toBe(15);
      });
    });

    test('handles null preferred staff correctly', async () => {
      const taskWithoutStaff = { ...mockTask, preferredStaffId: null };
      
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: taskWithoutStaff,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await waitFor(() => {
        const formValues = result.current.form.getValues();
        expect(formValues.preferredStaffId).toBeNull();
      });
    });
  });

  describe('Form Validation', () => {
    test('validates required fields correctly', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.form.setValue('name', '');
        result.current.form.setValue('estimatedHours', 0);
        result.current.form.setValue('requiredSkills', []);
      });

      await act(async () => {
        result.current.form.trigger();
      });

      const errors = result.current.form.formState.errors;
      expect(errors.name).toBeDefined();
      expect(errors.estimatedHours).toBeDefined();
    });

    test('validates estimated hours range', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.form.setValue('estimatedHours', 0.1);
      });

      await act(async () => {
        result.current.form.trigger('estimatedHours');
      });

      const errors = result.current.form.formState.errors;
      expect(errors.estimatedHours).toBeDefined();
    });

    test('validates skill requirements', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.setSelectedSkills([]);
      });

      expect(result.current.skillsError).toBe('At least one skill must be selected');
    });
  });

  describe('Skill Management', () => {
    test('toggles skills correctly', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.toggleSkill('skill-3');
      });

      expect(result.current.selectedSkills).toContain('skill-3');

      await act(async () => {
        result.current.toggleSkill('skill-1');
      });

      expect(result.current.selectedSkills).not.toContain('skill-1');
    });

    test('sets skills array correctly', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.setSelectedSkills(['skill-3', 'skill-4']);
      });

      expect(result.current.selectedSkills).toEqual(['skill-3', 'skill-4']);
    });
  });

  describe('Form Submission', () => {
    test('submits valid form data successfully', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      const formData = {
        name: 'Updated Task',
        description: 'Updated Description',
        estimatedHours: 3,
        priority: 'High' as TaskPriority,
        category: 'Audit' as TaskCategory,
        requiredSkills: ['skill-1'],
        preferredStaffId: 'staff-2',
        isRecurring: true,
        recurrenceType: 'Weekly' as const,
        interval: 2,
        weekdays: [1, 3, 5],
        dayOfMonth: 1,
        monthOfYear: 1,
        endDate: null,
        customOffsetDays: undefined,
        dueDate: undefined
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockSkillValidationService.validateSkillIds).toHaveBeenCalledWith(['skill-1']);
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Task',
        estimatedHours: 3,
        priority: 'High',
        category: 'Audit',
        requiredSkills: ['skill-1'],
        preferredStaffId: 'staff-2'
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Task updated successfully');
    });

    test('handles skill validation failure', async () => {
      mockSkillValidationService.validateSkillIds.mockResolvedValue({
        valid: ['skill-1'],
        invalid: ['invalid-skill'],
        details: [
          { id: 'skill-1', name: 'Skill 1' },
          { id: 'invalid-skill', error: 'Skill not found' }
        ]
      });

      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.setSelectedSkills(['skill-1', 'invalid-skill']);
      });

      const formData = {
        name: 'Test Task',
        description: '',
        estimatedHours: 1,
        priority: 'Medium' as TaskPriority,
        category: 'Tax' as TaskCategory,
        requiredSkills: ['skill-1', 'invalid-skill'],
        preferredStaffId: null,
        isRecurring: true,
        recurrenceType: 'Monthly' as const,
        interval: 1,
        weekdays: [],
        dayOfMonth: 1,
        monthOfYear: 1,
        endDate: null,
        customOffsetDays: undefined,
        dueDate: undefined
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.skillsError).toBe('Some selected skills are invalid. Please refresh and try again.');
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('handles submission errors correctly', async () => {
      const errorMessage = 'Network error';
      mockOnSave.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      const formData = {
        name: 'Test Task',
        description: '',
        estimatedHours: 1,
        priority: 'Medium' as TaskPriority,
        category: 'Tax' as TaskCategory,
        requiredSkills: ['skill-1'],
        preferredStaffId: null,
        isRecurring: true,
        recurrenceType: 'Monthly' as const,
        interval: 1,
        weekdays: [],
        dayOfMonth: 1,
        monthOfYear: 1,
        endDate: null,
        customOffsetDays: undefined,
        dueDate: undefined
      };

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(result.current.formError).toBe(errorMessage);
      expect(mockToast.error).toHaveBeenCalledWith('Failed to update task');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    test('resets form state correctly', async () => {
      const { result } = renderHook(() => 
        useEditTaskForm({
          task: mockTask,
          onSave: mockOnSave,
          onSuccess: mockOnSuccess
        })
      );

      await act(async () => {
        result.current.form.setValue('name', 'Changed Name');
        result.current.setSelectedSkills(['skill-3']);
      });

      await act(async () => {
        result.current.resetForm();
      });

      expect(result.current.formError).toBeNull();
      expect(result.current.skillsError).toBeNull();
    });
  });
});
