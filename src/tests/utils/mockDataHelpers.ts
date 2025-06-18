
import { RecurringTaskDB } from '@/types/task';

export const createMockRecurringTask = (overrides: Partial<RecurringTaskDB> = {}): RecurringTaskDB => {
  return {
    id: '1',
    name: 'Mock Task',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 10,
    required_skills: ['Test Skill'],
    priority: 'Medium',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Monthly',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Mock task description',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null, // Add preferred staff field to mock data
    ...overrides
  };
};
