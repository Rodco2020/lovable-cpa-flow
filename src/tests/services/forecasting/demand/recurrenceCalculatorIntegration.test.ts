
import { describe, it, expect } from 'vitest';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator/recurrenceCalculator';
import { ValidationUtils } from '@/services/forecasting/demand/recurrenceCalculator/validationUtils';
import { RecurringTaskDB } from '@/types/task';

describe('RecurrenceCalculator - Phase 2 Integration Tests', () => {
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
    description: 'Test weekly task with weekdays integration',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null
  };

  describe('Parameter Passing Integration', () => {
    it('should correctly pass weekdays parameter to RecurrenceTypeCalculator', () => {
      const weeklyTask: RecurringTaskDB = {
        ...baseTask,
        weekdays: [1, 3, 5] // Monday, Wednesday, Friday
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(weeklyTask, startDate, endDate);

      // Should use enhanced weekdays calculation (not legacy 4.33)
      expect(result.monthlyOccurrences).toBeCloseTo(13.05, 1); // 3 days * 4.35 weeks
      expect(result.monthlyHours).toBeCloseTo(130.5, 1);
      expect(result.taskId).toBe('1');
    });

    it('should handle null weekdays parameter correctly', () => {
      const weeklyTask: RecurringTaskDB = {
        ...baseTask,
        weekdays: null
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(weeklyTask, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });

    it('should handle undefined weekdays parameter correctly', () => {
      const weeklyTask: RecurringTaskDB = {
        ...baseTask,
        weekdays: undefined as any
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(weeklyTask, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });

    it('should not pass weekdays parameter for non-weekly tasks', () => {
      const monthlyTask: RecurringTaskDB = {
        ...baseTask,
        recurrence_type: 'Monthly',
        weekdays: [1, 2, 3] // Should be ignored for monthly tasks
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(monthlyTask, startDate, endDate);

      // Should use monthly calculation (1 occurrence)
      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(10);
    });
  });

  describe('Weekdays Validation Integration', () => {
    it('should validate weekdays during task input validation', () => {
      const taskWithInvalidWeekdays: RecurringTaskDB = {
        ...baseTask,
        weekdays: [1, 7, 3, -1] // Mix of valid and invalid
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithInvalidWeekdays, startDate, endDate);

      // Should still calculate but filter out invalid weekdays
      // Valid weekdays: [1, 3] = 2 days * 4.35 weeks = ~8.7 occurrences
      expect(result.monthlyOccurrences).toBeCloseTo(8.7, 1);
      expect(result.monthlyHours).toBeCloseTo(87, 1);
    });

    it('should handle completely invalid weekdays array', () => {
      const taskWithAllInvalidWeekdays: RecurringTaskDB = {
        ...baseTask,
        weekdays: [7, 8, -1, -2] // All invalid
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithAllInvalidWeekdays, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });

    it('should handle empty weekdays array', () => {
      const taskWithEmptyWeekdays: RecurringTaskDB = {
        ...baseTask,
        weekdays: []
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(taskWithEmptyWeekdays, startDate, endDate);

      // Should fall back to legacy calculation
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 2);
      expect(result.monthlyHours).toBeCloseTo(43.3, 1);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain exact same behavior for legacy weekly tasks', () => {
      const legacyWeeklyTask: RecurringTaskDB = {
        ...baseTask,
        weekdays: null // Legacy behavior
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(legacyWeeklyTask, startDate, endDate);

      // Must match legacy calculation exactly
      expect(result.monthlyOccurrences).toBeCloseTo(4.33, 3);
      expect(result.monthlyHours).toBeCloseTo(43.3, 2);
      expect(result.taskId).toBe('1');
      expect(result.nextDueDates).toEqual([]);
    });

    it('should maintain exact same behavior for non-weekly recurrence types', () => {
      const testCases = [
        { type: 'Daily', interval: 1, expected: 30 },
        { type: 'Monthly', interval: 1, expected: 1 },
        { type: 'Quarterly', interval: 1, expected: 1 }, // First quarter
      ];

      testCases.forEach((testCase) => {
        const task: RecurringTaskDB = {
          ...baseTask,
          recurrence_type: testCase.type,
          recurrence_interval: testCase.interval,
          weekdays: [1, 2, 3] // Should be ignored for non-weekly tasks
        };

        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-01-31');

        const result = RecurrenceCalculator.calculateMonthlyDemand(task, startDate, endDate);

        expect(result.monthlyOccurrences).toBe(testCase.expected);
        expect(result.monthlyHours).toBe(testCase.expected * 10);
      });
    });

    it('should preserve annual task behavior completely', () => {
      const annualTask: RecurringTaskDB = {
        ...baseTask,
        recurrence_type: 'Annually',
        month_of_year: 1, // January
        weekdays: [1, 2, 3] // Should be ignored for annual tasks
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

  describe('Various Weekly Recurrence Configurations', () => {
    const testConfigurations = [
      {
        name: 'Single weekday (Monday)',
        weekdays: [1],
        expectedOccurrences: 4.35,
        expectedHours: 43.5
      },
      {
        name: 'Two weekdays (Monday, Friday)',
        weekdays: [1, 5],
        expectedOccurrences: 8.7,
        expectedHours: 87
      },
      {
        name: 'Weekdays (Mon-Fri)',
        weekdays: [1, 2, 3, 4, 5],
        expectedOccurrences: 21.75,
        expectedHours: 217.5
      },
      {
        name: 'Weekend only',
        weekdays: [0, 6],
        expectedOccurrences: 8.7,
        expectedHours: 87
      },
      {
        name: 'All days',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        expectedOccurrences: 30.45,
        expectedHours: 304.5
      }
    ];

    testConfigurations.forEach((config) => {
      it(`should calculate correctly for ${config.name}`, () => {
        const weeklyTask: RecurringTaskDB = {
          ...baseTask,
          weekdays: config.weekdays
        };

        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-01-31');

        const result = RecurrenceCalculator.calculateMonthlyDemand(weeklyTask, startDate, endDate);

        expect(result.monthlyOccurrences).toBeCloseTo(config.expectedOccurrences, 1);
        expect(result.monthlyHours).toBeCloseTo(config.expectedHours, 1);
      });
    });

    it('should handle biweekly tasks with weekdays correctly', () => {
      const biweeklyTask: RecurringTaskDB = {
        ...baseTask,
        recurrence_interval: 2,
        weekdays: [1, 3, 5] // Monday, Wednesday, Friday every 2 weeks
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(biweeklyTask, startDate, endDate);

      // 3 days per week * 4.35 weeks per month / 2 interval = ~6.525
      expect(result.monthlyOccurrences).toBeCloseTo(6.525, 2);
      expect(result.monthlyHours).toBeCloseTo(65.25, 1);
    });
  });
});

describe('ValidationUtils - Weekdays Validation Tests', () => {
  describe('validateWeekdaysArray', () => {
    it('should validate correct weekdays array', () => {
      const result = ValidationUtils.validateWeekdaysArray([1, 3, 5]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validWeekdays).toEqual([1, 3, 5]);
    });

    it('should handle empty array correctly', () => {
      const result = ValidationUtils.validateWeekdaysArray([]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validWeekdays).toEqual([]);
    });

    it('should reject non-array input', () => {
      const result = ValidationUtils.validateWeekdaysArray('not-an-array');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Weekdays must be an array, got: string');
    });

    it('should filter out invalid weekday values', () => {
      const result = ValidationUtils.validateWeekdaysArray([1, 7, 3, -1, 5]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid weekday values found');
      expect(result.validWeekdays).toEqual([1, 3, 5]);
    });

    it('should remove duplicate weekdays', () => {
      const result = ValidationUtils.validateWeekdaysArray([1, 1, 3, 3, 5]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validWeekdays).toEqual([1, 3, 5]);
    });

    it('should handle all invalid weekdays', () => {
      const result = ValidationUtils.validateWeekdaysArray([7, 8, -1, -2]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No valid weekdays found (all values were invalid)');
    });
  });

  describe('validateTaskInputs with weekdays', () => {
    const baseTask: RecurringTaskDB = {
      id: '1',
      name: 'Test Task',
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
      description: 'Test task',
      notes: null,
      weekdays: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null
    };

    it('should validate weekly task with valid weekdays', () => {
      const task = { ...baseTask, weekdays: [1, 3, 5] };
      const result = ValidationUtils.validateTaskInputs(task);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle weekly task with invalid weekdays', () => {
      const task = { ...baseTask, weekdays: [1, 7, 3, -1] };
      const result = ValidationUtils.validateTaskInputs(task);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid weekday values'))).toBe(true);
    });

    it('should not validate weekdays for non-weekly tasks', () => {
      const task = { ...baseTask, recurrence_type: 'Monthly', weekdays: [7, 8] };
      const result = ValidationUtils.validateTaskInputs(task);
      
      expect(result.isValid).toBe(true); // Invalid weekdays should be ignored for non-weekly tasks
    });
  });
});
