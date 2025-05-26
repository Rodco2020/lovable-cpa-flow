
/**
 * Client Task Service Tests
 * 
 * Comprehensive tests for the refactored client task service
 */

import { getClientRecurringTasks, getClientAdHocTasks, getRecurringTaskById, getTaskInstanceById } from '@/services/clientTask';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            // This handles the recurring tasks query
          })),
          is: jest.fn(() => ({
            order: jest.fn(() => ({
              // This handles the ad-hoc tasks query
            }))
          }))
        }))
      }))
    }))
  }
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Client Task Service - Refactored', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClientRecurringTasks', () => {
    it('should return recurring tasks for a specific client', async () => {
      const mockData = [
        {
          id: 'task1',
          client_id: 'client1',
          name: 'Task 1',
          template_id: 'template1',
          description: 'Test task',
          estimated_hours: 5,
          required_skills: ['skill1'],
          priority: 'Medium',
          category: 'Tax',
          status: 'Unscheduled',
          due_date: '2023-12-01',
          recurrence_type: 'Monthly',
          recurrence_interval: 1,
          weekdays: null,
          day_of_month: 15,
          month_of_year: null,
          end_date: null,
          custom_offset_days: null,
          last_generated_date: null,
          is_active: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          notes: 'Test notes'
        }
      ];

      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getClientRecurringTasks('client1');

      expect(mockSupabase.from).toHaveBeenCalledWith('recurring_tasks');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task1');
      expect(result[0].clientId).toBe('client1');
    });

    it('should handle errors gracefully', async () => {
      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      await expect(getClientRecurringTasks('client1')).rejects.toThrow();
    });
  });

  describe('getClientAdHocTasks', () => {
    it('should return ad-hoc tasks for a specific client', async () => {
      const mockData = [
        {
          id: 'task1',
          client_id: 'client1',
          name: 'Ad-hoc Task 1',
          template_id: 'template1',
          description: 'Test ad-hoc task',
          estimated_hours: 3,
          required_skills: ['skill1'],
          priority: 'High',
          category: 'Advisory',
          status: 'Unscheduled',
          due_date: '2023-12-01',
          completed_at: null,
          assigned_staff_id: null,
          scheduled_start_time: null,
          scheduled_end_time: null,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          notes: 'Ad-hoc notes',
          recurring_task_id: null
        }
      ];

      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
            }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getClientAdHocTasks('client1');

      expect(mockSupabase.from).toHaveBeenCalledWith('task_instances');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task1');
      expect(result[0].clientId).toBe('client1');
    });
  });

  describe('getRecurringTaskById', () => {
    it('should return a specific recurring task', async () => {
      const mockData = {
        id: 'task1',
        client_id: 'client1',
        name: 'Task 1',
        template_id: 'template1',
        description: 'Test task',
        estimated_hours: 5,
        required_skills: ['skill1'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        due_date: '2023-12-01',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        weekdays: null,
        day_of_month: 15,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null,
        is_active: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        notes: 'Test notes'
      };

      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getRecurringTaskById('task1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('task1');
    });

    it('should return null when task not found', async () => {
      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getRecurringTaskById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTaskInstanceById', () => {
    it('should return a specific task instance', async () => {
      const mockData = {
        id: 'instance1',
        client_id: 'client1',
        name: 'Instance 1',
        template_id: 'template1',
        description: 'Test instance',
        estimated_hours: 3,
        required_skills: ['skill1'],
        priority: 'High',
        category: 'Advisory',
        status: 'Unscheduled',
        due_date: '2023-12-01',
        completed_at: null,
        assigned_staff_id: null,
        scheduled_start_time: null,
        scheduled_end_time: null,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        notes: 'Instance notes',
        recurring_task_id: null
      };

      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getTaskInstanceById('instance1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('instance1');
    });
  });
});
