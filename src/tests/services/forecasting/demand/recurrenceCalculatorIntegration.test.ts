
import { describe, it, expect } from 'vitest';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator/recurrenceCalculator';
import { ValidationUtils } from '@/services/forecasting/demand/recurrenceCalculator/validationUtils';
import { WeekdayUtils } from '@/services/forecasting/demand/recurrenceCalculator/weekdayUtils';
import { RecurringTaskDB } from '@/types/task';

describe('RecurrenceCalculator - Phase 3 Enhanced Validation and Error Handling Tests', () => {
  const baseTask: RecurringTaskDB = {
    id: '1',
    name: 'Test Weekly Task',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 10,
    required_skills: ['Tax Preparation'],
    priority: 'Medium',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Weekly',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Test weekly task with enhanced validation',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null
  };

  describe('Enhanced Error Handling', () => {
    it('should handle null task gracefully', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(null as any, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
      expect(result.taskId).toBe('unknown');
    });

    it('should handle missing required fields gracefully', () => {
      const invalidTask: Partial<RecurringTaskDB> = {
        id: '1',
        name: 'Invalid Task'
        // Missing required fields
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(invalidTask as RecurringTaskDB, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
      expect(result.taskId).toBe('1');
    });

    it('should handle extremely invalid weekdays data gracefully', () => {
      const taskWithInvalidWeekdays: RecurringTaskDB = {
        ...baseTask,
        weekdays: 'not an array at all' as any
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithInvalidWeekdays, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });

    it('should handle negative estimated hours', () => {
      const taskWithNegativeHours: RecurringTaskDB = {
        ...baseTask,
        estimated_hours: -5
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithNegativeHours, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });

    it('should handle invalid recurrence interval', () => {
      const taskWithInvalidInterval: RecurringTaskDB = {
        ...baseTask,
        recurrence_interval: 0
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithInvalidInterval, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });
  });

  describe('Enhanced Weekdays Validation', () => {
    it('should provide detailed validation results', () => {
      const validationResult = ValidationUtils.validateTaskInputs({
        ...baseTask,
        weekdays: [1, 3, 5, 7, -1] // Mix of valid and invalid
      });

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(error => error.includes('Weekdays validation failed'))).toBe(true);
      expect(validationResult.warnings).toBeDefined();
      expect(validationResult.context).toBeDefined();
    });

    it('should provide warnings for edge cases', () => {
      const validationResult = ValidationUtils.validateTaskInputs({
        ...baseTask,
        weekdays: [0, 1, 2, 3, 4, 5, 6] // All 7 days
      });

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.warnings.some(warning => warning.includes('All 7 weekdays selected'))).toBe(true);
    });

    it('should handle null weekdays appropriately', () => {
      const validationResult = ValidationUtils.validateTaskInputs({
        ...baseTask,
        weekdays: null
      });

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.warnings.some(warning => warning.includes('legacy calculation'))).toBe(true);
    });
  });

  describe('WeekdayUtils Comprehensive Testing', () => {
    it('should validate weekdays with detailed error reporting', () => {
      const result = WeekdayUtils.validateAndNormalizeWeekdays([1, 'invalid', 3, 7, -1]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid weekday values');
      expect(result.validWeekdays).toEqual([1, 3]);
    });

    it('should handle duplicate weekdays', () => {
      const result = WeekdayUtils.validateAndNormalizeWeekdays([1, 1, 3, 3, 5]);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Duplicate weekdays removed'))).toBe(true);
      expect(result.validWeekdays).toEqual([1, 3, 5]);
    });

    it('should calculate weekly occurrences correctly', () => {
      const result = WeekdayUtils.calculateWeeklyOccurrences([1, 3, 5], 1);

      expect(result.occurrences).toBeCloseTo(13.05, 1); // 3 days * 4.35 weeks
      expect(result.calculation).toContain('4.35 weeks/month');
      expect(result.details.weekdayNames).toEqual(['Monday', 'Wednesday', 'Friday']);
    });

    it('should throw error for empty weekdays in calculation', () => {
      expect(() => {
        WeekdayUtils.calculateWeeklyOccurrences([], 1);
      }).toThrow('Cannot calculate occurrences for empty weekdays array');
    });

    it('should throw error for invalid interval', () => {
      expect(() => {
        WeekdayUtils.calculateWeeklyOccurrences([1, 3, 5], 0);
      }).toThrow('Invalid interval: 0');
    });

    it('should provide appropriate weekday descriptions', () => {
      expect(WeekdayUtils.getWeekdaysDescription([1, 2, 3, 4, 5])).toBe('Weekdays (Mon-Fri)');
      expect(WeekdayUtils.getWeekdaysDescription([0, 6])).toBe('Weekends (Sat-Sun)');
      expect(WeekdayUtils.getWeekdaysDescription([1, 3, 5])).toBe('Monday, Wednesday, Friday');
      expect(WeekdayUtils.getWeekdaysDescription([])).toBe('No specific days');
    });
  });

  describe('Graceful Fallback Behavior', () => {
    it('should fall back to legacy calculation when weekdays validation fails', () => {
      const taskWithCorruptWeekdays: RecurringTaskDB = {
        ...baseTask,
        weekdays: [7, 8, 9, 10] // All invalid
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithCorruptWeekdays, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });

    it('should maintain existing functionality for non-weekly tasks', () => {
      const monthlyTask: RecurringTaskDB = {
        ...baseTask,
        recurrence_type: 'Monthly',
        weekdays: [1, 2, 3] // Should be ignored
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(monthlyTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(10);
    });
  });

  describe('Integration with Larger System', () => {
    it('should preserve existing calculation results for valid tasks', () => {
      const validWeeklyTask: RecurringTaskDB = {
        ...baseTask,
        weekdays: [1, 3, 5]
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(validWeeklyTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBeCloseTo(13.05, 1);
      expect(result.monthlyHours).toBeCloseTo(130.5, 1);
      expect(result.taskId).toBe('1');
    });

    it('should handle annual tasks without interference from weekdays logic', () => {
      const annualTask: RecurringTaskDB = {
        ...baseTask,
        recurrence_type: 'Annually',
        month_of_year: 1, // January
        weekdays: [1, 2, 3] // Should be ignored
      };

      // Test January (target month)
      const startDateJan = new Date('2025-01-01');
      const endDateJan = new Date('2025-01-31');
      const resultJan = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateJan, endDateJan);

      expect(resultJan.monthlyOccurrences).toBe(1);
      expect(resultJan.monthlyHours).toBe(10);

      // Test February (non-target month)
      const startDateFeb = new Date('2025-02-01');
      const endDateFeb = new Date('2025-02-28');
      const resultFeb = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateFeb, endDateFeb);

      expect(resultFeb.monthlyOccurrences).toBe(0);
      expect(resultFeb.monthlyHours).toBe(0);
    });
  });

  describe('Performance and Error Recovery', () => {
    it('should handle calculation errors gracefully', () => {
      const taskWithExtremeDatas: RecurringTaskDB = {
        ...baseTask,
        estimated_hours: Number.POSITIVE_INFINITY
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithExtremeDatas, startDate, endDate);

      // Should return 0 instead of crashing
      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });

    it('should not crash with malformed task objects', () => {
      const malformedTask = {
        // Minimal required fields
        id: 'test',
        estimated_hours: 10,
        recurrence_type: 'Weekly',
        // Missing many required fields
      } as any;

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(malformedTask, startDate, endDate);

      expect(result.taskId).toBe('test');
      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });
  });
});
