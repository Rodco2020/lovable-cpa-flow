
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

    it('should handle quarterly recurrence correctly', () => {
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
  });
});
