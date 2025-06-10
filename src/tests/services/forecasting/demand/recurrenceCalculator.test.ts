
import { describe, it, expect } from 'vitest';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator/recurrenceCalculator';
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

    describe('FIXED: Annual tasks with month-specific logic', () => {
      it('should return full hours ONLY for the target month when using month_of_year', () => {
        const annualTask: RecurringTaskDB = {
          ...mockTask,
          id: '3',
          name: 'Tax 1120 S - Sr',
          recurrence_type: 'Annually',
          estimated_hours: 8,
          month_of_year: 1, // January
          day_of_month: 15,
          due_date: null
        };

        // Test January period - should return FULL hours
        const startDateJan = new Date('2025-01-01');
        const endDateJan = new Date('2025-01-31');

        const resultJan = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateJan, endDateJan);

        expect(resultJan.monthlyOccurrences).toBe(1);
        expect(resultJan.monthlyHours).toBe(8);
        expect(resultJan.taskId).toBe('3');

        // Test February period - should return ZERO hours
        const startDateFeb = new Date('2025-02-01');
        const endDateFeb = new Date('2025-02-28');

        const resultFeb = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateFeb, endDateFeb);

        expect(resultFeb.monthlyOccurrences).toBe(0);
        expect(resultFeb.monthlyHours).toBe(0);

        // Test March period - should return ZERO hours
        const startDateMar = new Date('2025-03-01');
        const endDateMar = new Date('2025-03-31');

        const resultMar = RecurrenceCalculator.calculateMonthlyDemand(annualTask, startDateMar, endDateMar);

        expect(resultMar.monthlyOccurrences).toBe(0);
        expect(resultMar.monthlyHours).toBe(0);
      });

      it('should prioritize month_of_year over due_date and return hours only for target month', () => {
        const inconsistentTask: RecurringTaskDB = {
          ...mockTask,
          id: '4',
          name: 'Inconsistent Annual Task',
          recurrence_type: 'Annually',
          estimated_hours: 6,
          month_of_year: 1, // January
          due_date: '2025-03-15T00:00:00Z' // March - inconsistent!
        };

        // Should use month_of_year (January) as primary source and return full hours
        const startDateJan = new Date('2025-01-01');
        const endDateJan = new Date('2025-01-31');

        const resultJan = RecurrenceCalculator.calculateMonthlyDemand(inconsistentTask, startDateJan, endDateJan);

        expect(resultJan.monthlyOccurrences).toBe(1);
        expect(resultJan.monthlyHours).toBe(6);

        // March should return ZERO despite due_date
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

        // Test March period - should return adjusted hours (12 / 2 = 6)
        const startDateMar = new Date('2025-03-01');
        const endDateMar = new Date('2025-03-31');

        const resultMar = RecurrenceCalculator.calculateMonthlyDemand(biennialTask, startDateMar, endDateMar);

        expect(resultMar.monthlyOccurrences).toBe(0.5); // Every 2 years = 0.5 occurrence per year
        expect(resultMar.monthlyHours).toBe(6); // 12 * 0.5 = 6
        expect(resultMar.taskId).toBe('5');

        // Test April period - should return ZERO hours
        const startDateApr = new Date('2025-04-01');
        const endDateApr = new Date('2025-04-30');

        const resultApr = RecurrenceCalculator.calculateMonthlyDemand(biennialTask, startDateApr, endDateApr);

        expect(resultApr.monthlyOccurrences).toBe(0);
        expect(resultApr.monthlyHours).toBe(0);
      });

      it('should use due_date when month_of_year is not available', () => {
        const dueDateTask: RecurringTaskDB = {
          ...mockTask,
          id: '6',
          name: 'Annual Task with Due Date',
          recurrence_type: 'Annually',
          estimated_hours: 15,
          month_of_year: null,
          due_date: '2025-04-15T00:00:00Z' // April
        };

        // Test April period - should return full hours
        const startDateApr = new Date('2025-04-01');
        const endDateApr = new Date('2025-04-30');

        const resultApr = RecurrenceCalculator.calculateMonthlyDemand(dueDateTask, startDateApr, endDateApr);

        expect(resultApr.monthlyOccurrences).toBe(1);
        expect(resultApr.monthlyHours).toBe(15);

        // Test May period - should return ZERO hours
        const startDateMay = new Date('2025-05-01');
        const endDateMay = new Date('2025-05-31');

        const resultMay = RecurrenceCalculator.calculateMonthlyDemand(dueDateTask, startDateMay, endDateMay);

        expect(resultMay.monthlyOccurrences).toBe(0);
        expect(resultMay.monthlyHours).toBe(0);
      });

      it('should exclude annual task with no month information from all months', () => {
        const annualTaskNoInfo: RecurringTaskDB = {
          ...mockTask,
          id: '7',
          name: 'Annual Task No Info',
          recurrence_type: 'Annually',
          estimated_hours: 24,
          month_of_year: null,
          due_date: null // No month information
        };

        // Test multiple months - all should return ZERO
        const months = [
          { start: new Date('2025-01-01'), end: new Date('2025-01-31') },
          { start: new Date('2025-06-01'), end: new Date('2025-06-30') },
          { start: new Date('2025-12-01'), end: new Date('2025-12-31') }
        ];

        months.forEach(({ start, end }) => {
          const result = RecurrenceCalculator.calculateMonthlyDemand(annualTaskNoInfo, start, end);
          expect(result.monthlyOccurrences).toBe(0);
          expect(result.monthlyHours).toBe(0);
          expect(result.taskId).toBe('7');
        });
      });
    });

    it('should handle invalid task inputs gracefully', () => {
      const invalidTask: RecurringTaskDB = {
        ...mockTask,
        id: '8',
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
