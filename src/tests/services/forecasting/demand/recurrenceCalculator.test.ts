
import { describe, it, expect } from 'vitest';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator';
import { RecurringTaskDB } from '@/types/task';

describe('RecurrenceCalculator', () => {
  const mockTask: RecurringTaskDB = {
    id: '1',
    name: 'Monthly Task',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 10,
    required_skills: ['Tax Preparation'],
    priority: 'Medium',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Monthly',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Test monthly task',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null
  };

  describe('calculateMonthlyDemand', () => {
    it('should calculate monthly demand correctly for monthly recurrence', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(mockTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(10);
      expect(result.taskId).toBe('1');
    });

    it('should calculate quarterly demand correctly', () => {
      const quarterlyTask: RecurringTaskDB = {
        ...mockTask,
        id: '2',
        recurrence_type: 'Quarterly',
        estimated_hours: 30
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(quarterlyTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBeCloseTo(0.33, 2);
      expect(result.monthlyHours).toBeCloseTo(10, 2);
    });

    it('should calculate annual demand using month_of_year when available', () => {
      const annualTask: RecurringTaskDB = {
        ...mockTask,
        id: '3',
        name: 'Tax 1120 S - Sr',
        recurrence_type: 'Annually',
        estimated_hours: 8,
        month_of_year: 1, // January
        day_of_month: 15,
        due_date: null // Test month_of_year priority
      };

      // Test January period - should include the task
      const startDateJan = new Date('2025-01-01');
      const endDateJan = new Date('2025-01-31');

      const resultJan = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateJan, endDateJan);

      expect(resultJan.monthlyOccurrences).toBe(1);
      expect(resultJan.monthlyHours).toBe(8);
      expect(resultJan.taskId).toBe('3');

      // Test February period - should NOT include the task
      const startDateFeb = new Date('2025-02-01');
      const endDateFeb = new Date('2025-02-28');

      const resultFeb = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateFeb, endDateFeb);

      expect(resultFeb.monthlyOccurrences).toBe(0);
      expect(resultFeb.monthlyHours).toBe(0);
    });

    it('should detect data inconsistency between month_of_year and due_date', () => {
      const inconsistentTask: RecurringTaskDB = {
        ...mockTask,
        id: '4',
        name: 'Inconsistent Annual Task',
        recurrence_type: 'Annually',
        estimated_hours: 6,
        month_of_year: 1, // January
        due_date: '2025-03-15T00:00:00Z' // March - inconsistent!
      };

      // Should use month_of_year (January) as primary source
      const startDateJan = new Date('2025-01-01');
      const endDateJan = new Date('2025-01-31');

      const resultJan = RecurrenceCalculator.calculateMonthlyDemand(inconsistentTask, startDateJan, endDateJan);

      expect(resultJan.monthlyOccurrences).toBe(1);
      expect(resultJan.monthlyHours).toBe(6);

      // March should be excluded despite due_date
      const startDateMar = new Date('2025-03-01');
      const endDateMar = new Date('2025-03-31');

      const resultMar = RecurrenceCalculator.calculateMonthlyDemand(inconsistentTask, startDateMar, endDateMar);

      expect(resultMar.monthlyOccurrences).toBe(0);
      expect(resultMar.monthlyHours).toBe(0);
    });

    it('should handle annual task with 2-year interval correctly', () => {
      const biennialTask: RecurringTaskDB = {
        ...mockTask,
        id: '5',
        name: 'Biennial Tax Filing',
        recurrence_type: 'Annually',
        recurrence_interval: 2, // Every 2 years
        estimated_hours: 12,
        month_of_year: 3, // March
        day_of_month: 15
      };

      // Test March period - should include the task with 0.5 occurrences
      const startDateMar = new Date('2025-03-01');
      const endDateMar = new Date('2025-03-31');

      const resultMar = RecurrenceCalculator.calculateMonthlyDemand(biennialTask, startDateMar, endDateMar);

      expect(resultMar.monthlyOccurrences).toBe(0.5); // Every 2 years = 0.5 occurrence per year
      expect(resultMar.monthlyHours).toBe(6); // 12 * 0.5 = 6
      expect(resultMar.taskId).toBe('5');
    });

    it('should exclude annual task with no month information', () => {
      const annualTaskNoInfo: RecurringTaskDB = {
        ...mockTask,
        id: '6',
        name: 'Annual Task No Info',
        recurrence_type: 'Annually',
        estimated_hours: 24,
        month_of_year: null,
        due_date: null // No month information
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(annualTaskNoInfo, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
      expect(result.taskId).toBe('6');
    });

    it('should handle invalid task inputs gracefully', () => {
      const invalidTask: RecurringTaskDB = {
        ...mockTask,
        id: '7',
        estimated_hours: -5, // Invalid
        recurrence_type: '', // Invalid
        month_of_year: 15 // Invalid (> 12)
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = RecurrenceCalculator.calculateMonthlyDemand(invalidTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });
  });

  describe('utility methods', () => {
    it('should check if date is in period correctly', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      const dateInPeriod = new Date('2025-01-15');
      const dateBeforePeriod = new Date('2024-12-31');
      const dateAfterPeriod = new Date('2025-02-01');

      expect(RecurrenceCalculator.isDateInPeriod(dateInPeriod, startDate, endDate)).toBe(true);
      expect(RecurrenceCalculator.isDateInPeriod(dateBeforePeriod, startDate, endDate)).toBe(false);
      expect(RecurrenceCalculator.isDateInPeriod(dateAfterPeriod, startDate, endDate)).toBe(false);
    });

    it('should get month from date correctly', () => {
      const januaryDate = new Date('2025-01-15');
      const marchDateString = '2025-03-15T00:00:00Z';

      expect(RecurrenceCalculator.getMonthFromDate(januaryDate)).toBe(0); // January = 0
      expect(RecurrenceCalculator.getMonthFromDate(marchDateString)).toBe(2); // March = 2
    });
  });
});
