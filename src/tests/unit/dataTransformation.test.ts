/**
 * Unit Tests for Data Transformation Service
 * 
 * Tests bidirectional data transformation between database and application schemas,
 * validation functions, and edge case handling.
 */

import {
  transformDatabaseToApplication,
  transformApplicationToDatabase,
  validateTaskData,
  sanitizeTaskData,
  DataTransformationError
} from '@/services/taskService/dataTransformationService';
import { RecurringTask, TaskPriority, TaskCategory } from '@/types/task';

// Mock types for testing
interface RecurringTaskDB {
  id: string;
  template_id: string;
  client_id: string;
  name: string;
  description: string | null;
  estimated_hours: number;
  required_skills: string[];
  priority: TaskPriority;
  category: TaskCategory;
  status: string;
  due_date: string | null;
  preferred_staff_id: string | null;
  recurrence_type: string;
  recurrence_interval: number;
  weekdays: number[] | null;
  day_of_month: number | null;
  month_of_year: number | null;
  end_date: string | null;
  custom_offset_days: number | null;
  last_generated_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

describe('Data Transformation Service Unit Tests', () => {
  const mockDatabaseTask: RecurringTaskDB = {
    id: 'task-1',
    template_id: 'template-1',
    client_id: 'client-1',
    name: 'Test Task',
    description: 'Test Description',
    estimated_hours: 2.5,
    required_skills: ['skill-1', 'skill-2'],
    priority: 'Medium' as TaskPriority,
    category: 'Tax' as TaskCategory,
    status: 'Unscheduled',
    due_date: '2024-01-15T00:00:00.000Z',
    preferred_staff_id: 'staff-1',
    recurrence_type: 'Monthly',
    recurrence_interval: 1,
    weekdays: null,
    day_of_month: 15,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    notes: 'Test notes'
  };

  const mockApplicationTask: RecurringTask = {
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
    dueDate: new Date('2024-01-15T00:00:00.000Z'),
    preferredStaffId: 'staff-1',
    recurrencePattern: {
      type: 'Monthly',
      interval: 1,
      weekdays: undefined,
      dayOfMonth: 15,
      monthOfYear: undefined,
      endDate: undefined,
      customOffsetDays: undefined
    },
    lastGeneratedDate: null,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    notes: 'Test notes'
  };

  describe('Database to Application Transformation', () => {
    test('transforms complete database record correctly', () => {
      const result = transformDatabaseToApplication(mockDatabaseTask);
      
      expect(result).toEqual(mockApplicationTask);
      expect(result.dueDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    test('handles null values correctly', () => {
      const dbTaskWithNulls: RecurringTaskDB = {
        ...mockDatabaseTask,
        description: null,
        due_date: null,
        preferred_staff_id: null,
        notes: null,
        last_generated_date: null
      };

      const result = transformDatabaseToApplication(dbTaskWithNulls);
      
      expect(result.description).toBe('');
      expect(result.dueDate).toBeNull();
      expect(result.preferredStaffId).toBeNull();
      expect(result.notes).toBeUndefined();
      expect(result.lastGeneratedDate).toBeNull();
    });

    test('handles arrays correctly', () => {
      const dbTaskWithArrays: RecurringTaskDB = {
        ...mockDatabaseTask,
        required_skills: ['skill-1', 'skill-2', 'skill-3'],
        weekdays: [1, 3, 5]
      };

      const result = transformDatabaseToApplication(dbTaskWithArrays);
      
      expect(result.requiredSkills).toEqual(['skill-1', 'skill-2', 'skill-3']);
      expect(result.recurrencePattern.weekdays).toEqual([1, 3, 5]);
    });

    test('throws error for missing required fields', () => {
      const invalidDbTask = { ...mockDatabaseTask, name: undefined } as any;
      
      expect(() => transformDatabaseToApplication(invalidDbTask))
        .toThrow(DataTransformationError);
    });

    test('handles weekly recurrence pattern', () => {
      const weeklyTask: RecurringTaskDB = {
        ...mockDatabaseTask,
        recurrence_type: 'Weekly',
        recurrence_interval: 2,
        weekdays: [1, 3, 5],
        day_of_month: null
      };

      const result = transformDatabaseToApplication(weeklyTask);
      
      expect(result.recurrencePattern.type).toBe('Weekly');
      expect(result.recurrencePattern.interval).toBe(2);
      expect(result.recurrencePattern.weekdays).toEqual([1, 3, 5]);
      expect(result.recurrencePattern.dayOfMonth).toBeUndefined();
    });
  });

  describe('Application to Database Transformation', () => {
    test('transforms complete application record correctly', () => {
      const result = transformApplicationToDatabase(mockApplicationTask);
      
      expect(result.name).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.estimated_hours).toBe(2.5);
      expect(result.required_skills).toEqual(['skill-1', 'skill-2']);
      expect(result.preferred_staff_id).toBe('staff-1');
      expect(result.recurrence_type).toBe('Monthly');
      expect(result.recurrence_interval).toBe(1);
      expect(result.day_of_month).toBe(15);
      expect(result.due_date).toBe('2024-01-15T00:00:00.000Z');
      expect(result.updated_at).toBeDefined();
    });

    test('handles partial updates correctly', () => {
      const partialUpdate: Partial<RecurringTask> = {
        name: 'Updated Name',
        estimatedHours: 3.5,
        preferredStaffId: 'staff-2'
      };

      const result = transformApplicationToDatabase(partialUpdate);
      
      expect(result.name).toBe('Updated Name');
      expect(result.estimated_hours).toBe(3.5);
      expect(result.preferred_staff_id).toBe('staff-2');
      expect(result.updated_at).toBeDefined();
    });

    test('handles null preferred staff correctly', () => {
      const taskWithNullStaff: Partial<RecurringTask> = {
        preferredStaffId: null
      };

      const result = transformApplicationToDatabase(taskWithNullStaff);
      
      expect(result.preferred_staff_id).toBeNull();
    });

    test('handles date transformations correctly', () => {
      const taskWithDates: Partial<RecurringTask> = {
        dueDate: new Date('2024-06-15T10:30:00.000Z'),
        recurrencePattern: {
          type: 'Monthly',
          endDate: new Date('2024-12-31T23:59:59.000Z')
        }
      };

      const result = transformApplicationToDatabase(taskWithDates);
      
      expect(result.due_date).toBe('2024-06-15T10:30:00.000Z');
      expect(result.end_date).toBe('2024-12-31T23:59:59.000Z');
    });

    test('handles arrays correctly', () => {
      const taskWithArrays: Partial<RecurringTask> = {
        requiredSkills: ['skill-1', 'skill-2'],
        recurrencePattern: {
          type: 'Weekly',
          weekdays: [1, 3, 5]
        }
      };

      const result = transformApplicationToDatabase(taskWithArrays);
      
      expect(result.required_skills).toEqual(['skill-1', 'skill-2']);
      expect(result.weekdays).toEqual([1, 3, 5]);
    });
  });

  describe('Task Data Validation', () => {
    test('validates valid task data', () => {
      const validTask: Partial<RecurringTask> = {
        estimatedHours: 2.5,
        requiredSkills: ['skill-1'],
        recurrencePattern: {
          type: 'Monthly',
          interval: 1,
          dayOfMonth: 15
        },
        dueDate: new Date()
      };

      const result = validateTaskData(validTask);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates estimated hours', () => {
      const invalidHours: Partial<RecurringTask> = {
        estimatedHours: 0
      };

      const result = validateTaskData(invalidHours);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated hours must be a positive number');
    });

    test('validates required skills array', () => {
      const noSkills: Partial<RecurringTask> = {
        requiredSkills: []
      };

      const result = validateTaskData(noSkills);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one skill is required');
    });

    test('validates recurrence pattern fields', () => {
      const invalidRecurrence: Partial<RecurringTask> = {
        recurrencePattern: {
          type: 'Monthly',
          interval: 0,
          dayOfMonth: 32,
          monthOfYear: 13,
          weekdays: [7, 8]
        }
      };

      const result = validateTaskData(invalidRecurrence);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Recurrence interval must be a positive integer');
      expect(result.errors).toContain('Day of month must be between 1 and 31');
      expect(result.errors).toContain('Month of year must be between 1 and 12');
      expect(result.errors).toContain('Weekdays must be between 0 (Sunday) and 6 (Saturday)');
    });

    test('validates date objects', () => {
      const invalidDates: Partial<RecurringTask> = {
        dueDate: 'invalid-date' as any,
        recurrencePattern: {
          type: 'Monthly',
          endDate: 'invalid-date' as any
        }
      };

      const result = validateTaskData(invalidDates);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Due date must be a valid Date object');
      expect(result.errors).toContain('End date must be a valid Date object');
    });
  });

  describe('Task Data Sanitization', () => {
    test('sanitizes numeric fields correctly', () => {
      const unsanitizedTask: Partial<RecurringTask> = {
        estimatedHours: 'invalid' as any
      };

      const result = sanitizeTaskData(unsanitizedTask);
      
      expect(result.estimatedHours).toBe(0.25);
    });

    test('sanitizes string fields correctly', () => {
      const unsanitizedTask: Partial<RecurringTask> = {
        name: '  Test Task  ',
        description: '  Test Description  '
      };

      const result = sanitizeTaskData(unsanitizedTask);
      
      expect(result.name).toBe('Test Task');
      expect(result.description).toBe('Test Description');
    });

    test('handles empty preferred staff ID', () => {
      const taskWithEmptyStaff: Partial<RecurringTask> = {
        preferredStaffId: '' as any
      };

      const result = sanitizeTaskData(taskWithEmptyStaff);
      
      expect(result.preferredStaffId).toBeNull();
    });

    test('ensures arrays are properly initialized', () => {
      const taskWithInvalidArray: Partial<RecurringTask> = {
        requiredSkills: 'invalid' as any
      };

      const result = sanitizeTaskData(taskWithInvalidArray);
      
      expect(Array.isArray(result.requiredSkills)).toBe(true);
      expect(result.requiredSkills).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('handles transformation errors gracefully', () => {
      const malformedDbTask = {
        // Missing required fields
        id: 'task-1'
      } as RecurringTaskDB;

      expect(() => transformDatabaseToApplication(malformedDbTask))
        .toThrow(DataTransformationError);
    });

    test('provides meaningful error messages', () => {
      try {
        transformDatabaseToApplication({} as RecurringTaskDB);
      } catch (error) {
        expect(error).toBeInstanceOf(DataTransformationError);
        expect(error.message).toContain('Missing task ID');
      }
    });
  });
});
