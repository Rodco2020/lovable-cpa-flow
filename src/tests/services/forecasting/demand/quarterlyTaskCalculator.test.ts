
import { describe, it, expect } from 'vitest';
import { QuarterlyTaskCalculator } from '@/services/forecasting/demand/recurrenceCalculator/quarterlyTaskCalculator';
import { RecurringTaskDB } from '@/types/task';

describe('QuarterlyTaskCalculator - Accurate Quarterly Calculations', () => {
  describe('calculateQuarterlyOccurrences', () => {
    const createMockTask = (dueDate: string, interval: number = 1): RecurringTaskDB => ({
      id: 'test-task',
      template_id: 'template-1',
      client_id: 'client-1',
      name: 'Test Quarterly Task',
      description: null,
      estimated_hours: 10,
      required_skills: ['Tax'],
      priority: 'Medium',
      category: 'Tax',
      status: 'Unscheduled',
      due_date: dueDate,
      recurrence_type: 'quarterly',
      recurrence_interval: interval,
      weekdays: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      is_active: true,
      preferred_staff_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      notes: null
    });

    it('should return 1 for due months in quarterly schedule', () => {
      const task = createMockTask('2024-03-15', 1); // Due in March
      
      // March should have 1 occurrence
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 2, 2024)).toBe(1);
      
      // June should have 1 occurrence (3 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 5, 2024)).toBe(1);
      
      // September should have 1 occurrence (6 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 8, 2024)).toBe(1);
      
      // December should have 1 occurrence (9 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 11, 2024)).toBe(1);
    });

    it('should return 0 for non-due months', () => {
      const task = createMockTask('2024-03-15', 1); // Due in March
      
      // January should have 0 occurrences
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 0, 2024)).toBe(0);
      
      // February should have 0 occurrences
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 1, 2024)).toBe(0);
      
      // April should have 0 occurrences
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 3, 2024)).toBe(0);
      
      // May should have 0 occurrences
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 4, 2024)).toBe(0);
    });

    it('should handle semi-annual tasks (interval = 2)', () => {
      const task = createMockTask('2024-01-31', 2); // Due every 6 months starting January
      
      // January should have 1 occurrence
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 0, 2024)).toBe(1);
      
      // July should have 1 occurrence (6 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 6, 2024)).toBe(1);
      
      // April should have 0 occurrences (not a due month)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 3, 2024)).toBe(0);
      
      // October should have 0 occurrences (not a due month)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 9, 2024)).toBe(0);
    });

    it('should handle annual tasks (interval = 4)', () => {
      const task = createMockTask('2024-02-28', 4); // Due annually in February
      
      // February 2024 should have 1 occurrence
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 1, 2024)).toBe(1);
      
      // February 2025 should have 1 occurrence (12 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 1, 2025)).toBe(1);
      
      // All other months should have 0 occurrences
      for (let month = 0; month < 12; month++) {
        if (month !== 1) { // Skip February
          expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, month, 2024)).toBe(0);
        }
      }
    });

    it('should handle cross-year calculations correctly', () => {
      const task = createMockTask('2023-12-15', 1); // Due in December 2023
      
      // December 2023 should have 1 occurrence
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 11, 2023)).toBe(1);
      
      // March 2024 should have 1 occurrence (3 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 2, 2024)).toBe(1);
      
      // June 2024 should have 1 occurrence (6 months later)
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 5, 2024)).toBe(1);
      
      // January 2024 should have 0 occurrences
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 0, 2024)).toBe(0);
    });

    it('should handle invalid due dates gracefully', () => {
      const task = createMockTask('invalid-date', 1);
      
      // Should return 0 for invalid due dates
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 2, 2024)).toBe(0);
    });

    it('should handle null due dates gracefully', () => {
      const task = createMockTask('', 1);
      task.due_date = null;
      
      // Should return 0 for null due dates
      expect(QuarterlyTaskCalculator.calculateQuarterlyOccurrences(task, 2, 2024)).toBe(0);
    });
  });

  describe('getQuarterlyDescription', () => {
    const createMockTask = (dueDate: string, interval: number = 1): RecurringTaskDB => ({
      id: 'test-task',
      template_id: 'template-1',
      client_id: 'client-1',
      name: 'Test Quarterly Task',
      description: null,
      estimated_hours: 10,
      required_skills: ['Tax'],
      priority: 'Medium',
      category: 'Tax',
      status: 'Unscheduled',
      due_date: dueDate,
      recurrence_type: 'quarterly',
      recurrence_interval: interval,
      weekdays: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      is_active: true,
      preferred_staff_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      notes: null
    });

    it('should provide description for quarterly tasks', () => {
      const task = createMockTask('2024-03-15', 1);
      const description = QuarterlyTaskCalculator.getQuarterlyDescription(task);
      expect(description).toBe('Quarterly in March');
    });

    it('should provide description for semi-annual tasks', () => {
      const task = createMockTask('2024-01-31', 2);
      const description = QuarterlyTaskCalculator.getQuarterlyDescription(task);
      expect(description).toBe('Semi-annually in January');
    });

    it('should provide description for annual tasks', () => {
      const task = createMockTask('2024-02-28', 4);
      const description = QuarterlyTaskCalculator.getQuarterlyDescription(task);
      expect(description).toBe('Annually in February');
    });

    it('should handle invalid due dates', () => {
      const task = createMockTask('invalid-date', 1);
      const description = QuarterlyTaskCalculator.getQuarterlyDescription(task);
      expect(description).toBe('Every quarter(s)');
    });
  });
});
