
/**
 * Test Helpers for Preferred Staff Scenarios
 * Provides utility functions for testing preferred staff functionality
 */

import { RecurringTaskDB } from '@/types/task';

/**
 * Creates a mock recurring task for testing purposes
 */
export const createMockRecurringTask = (overrides: Partial<RecurringTaskDB> = {}): RecurringTaskDB => {
  return {
    id: 'test-task-id',
    name: 'Test Task',
    description: 'Test Description',
    client_id: 'test-client-id',
    template_id: 'test-template-id',
    estimated_hours: 2.5,
    priority: 'Medium',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Monthly',
    required_skills: ['Tax Preparation'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preferred_staff_id: null,
    due_date: null,
    recurrence_interval: 1,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    last_generated_date: null,
    notes: null,
    weekdays_for_daily: null,
    custom_offset_days: null,
    clients: null,
    preferred_staff: null,
    ...overrides
  };
};

/**
 * Creates test data for preferred staff scenarios
 */
export const createPreferredStaffTestData = () => {
  return {
    tasks: [
      createMockRecurringTask({ id: 'task-1', preferred_staff_id: 'staff-1' }),
      createMockRecurringTask({ id: 'task-2', preferred_staff_id: null }),
      createMockRecurringTask({ id: 'task-3', preferred_staff_id: 'staff-2' })
    ],
    staff: [
      { id: 'staff-1', full_name: 'John Doe' },
      { id: 'staff-2', full_name: 'Jane Smith' }
    ]
  };
};
