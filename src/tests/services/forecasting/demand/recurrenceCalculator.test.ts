import { describe, it, expect } from 'vitest';
import { RecurrenceCalculator } from '@/services/forecasting/demand/recurrenceCalculator';
import { RecurringTaskDB } from '@/types/task';

describe('RecurrenceCalculator', () => {
  const mockTask: RecurringTaskDB = {
    id: '1',
    name: 'Tax Task',
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
    description: 'Test task',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null
  };

  it('should calculate the next due date for a monthly task', () => {
    const lastGeneratedDate = new Date('2024-12-15T00:00:00Z');
    const expectedDueDate = new Date('2025-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(mockTask, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle tasks due on the last day of the month', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      day_of_month: 31,
      due_date: '2025-01-31T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-01T00:00:00Z');
    const expectedDueDate = new Date('2025-01-31T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle tasks due on the last day of February in a non-leap year', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      day_of_month: 29,
      due_date: '2025-02-28T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-01T00:00:00Z');
    const expectedDueDate = new Date('2025-02-28T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle tasks due on the last day of February in a leap year', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      day_of_month: 29,
      due_date: '2024-02-29T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2024-01-01T00:00:00Z');
    const expectedDueDate = new Date('2024-02-29T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should calculate the next due date for a quarterly task', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Quarterly',
      recurrence_interval: 3,
      month_of_year: 1,
      due_date: '2025-01-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2024-10-15T00:00:00Z');
    const expectedDueDate = new Date('2025-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should calculate the next due date for an annually task', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Annually',
      recurrence_interval: 12,
      month_of_year: 1,
      due_date: '2025-01-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2024-01-15T00:00:00Z');
    const expectedDueDate = new Date('2025-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should return null if the task is not active', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      is_active: false
    };
    const lastGeneratedDate = new Date('2024-12-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toBeNull();
  });

  it('should handle null lastGeneratedDate', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Monthly',
      recurrence_interval: 1,
      day_of_month: 15,
      due_date: '2025-01-15T00:00:00Z'
    };
    const lastGeneratedDate = null;
    const expectedDueDate = new Date('2025-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle monthly tasks with day_of_month greater than the number of days in the month', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Monthly',
      recurrence_interval: 1,
      day_of_month: 31,
      due_date: '2025-02-28T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-01T00:00:00Z');
    const expectedDueDate = new Date('2025-02-28T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle quarterly tasks where the month_of_year is greater than 12', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Quarterly',
      recurrence_interval: 3,
      month_of_year: 13,
      due_date: '2025-01-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2024-10-15T00:00:00Z');
    const expectedDueDate = new Date('2025-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle annually tasks where the month_of_year is greater than 12', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Annually',
      recurrence_interval: 12,
      month_of_year: 13,
      due_date: '2026-01-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-15T00:00:00Z');
    const expectedDueDate = new Date('2026-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle monthly tasks with recurrence_interval greater than 1', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Monthly',
      recurrence_interval: 2,
      day_of_month: 15,
      due_date: '2025-03-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-15T00:00:00Z');
    const expectedDueDate = new Date('2025-03-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle quarterly tasks with recurrence_interval greater than 1', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Quarterly',
      recurrence_interval: 2,
      month_of_year: 1,
      due_date: '2025-07-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-15T00:00:00Z');
    const expectedDueDate = new Date('2025-07-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  it('should handle annually tasks with recurrence_interval greater than 1', () => {
    const task: RecurringTaskDB = {
      ...mockTask,
      recurrence_type: 'Annually',
      recurrence_interval: 2,
      month_of_year: 1,
      due_date: '2027-01-15T00:00:00Z'
    };
    const lastGeneratedDate = new Date('2025-01-15T00:00:00Z');
    const expectedDueDate = new Date('2027-01-15T00:00:00Z');

    const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

    expect(nextDueDate).toEqual(expectedDueDate);
  });

  describe('Complex Integration Scenarios', () => {
    const complexRecurrenceTask: RecurringTaskDB = {
      id: 'complex-1',
      name: 'Complex Recurring Task',
      template_id: 'template-complex',
      client_id: 'client-complex',
      estimated_hours: 8,
      required_skills: ['Advanced Analysis'],
      priority: 'Medium',
      category: 'Tax',
      status: 'Unscheduled',
      recurrence_type: 'Weekly',
      recurrence_interval: 2,
      weekdays: [1, 3, 5], // Monday, Wednesday, Friday
      is_active: true,
      due_date: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      description: 'Complex test task with bi-weekly frequency',
      notes: null,
      day_of_month: null,
      month_of_year: null,
      end_date: null,
      custom_offset_days: null,
      last_generated_date: null,
      preferred_staff_id: null
    };

    it('should calculate the next due date for a complex weekly task', () => {
      const lastGeneratedDate = new Date('2024-12-20T00:00:00Z'); // Friday
      const expectedDueDate = new Date('2024-12-30T00:00:00Z'); // Monday two weeks later

      const nextDueDate = RecurrenceCalculator.calculateNextDueDate(complexRecurrenceTask, lastGeneratedDate);

      expect(nextDueDate).toEqual(expectedDueDate);
    });

    it('should handle weekly tasks with no weekdays specified', () => {
      const task: RecurringTaskDB = {
        ...complexRecurrenceTask,
        weekdays: null
      };
      const lastGeneratedDate = new Date('2024-12-20T00:00:00Z');
      const expectedDueDate = new Date('2024-12-27T00:00:00Z');

      const nextDueDate = RecurrenceCalculator.calculateNextDueDate(task, lastGeneratedDate);

      expect(nextDueDate).toEqual(expectedDueDate);
    });
  });
});
