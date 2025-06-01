/**
 * Client Task Service Tests
 * 
 * Comprehensive tests for the refactored client task service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecurringTaskById, getClientRecurringTasks, getTaskInstanceById, getClientAdHocTasks } from '@/services/clientTask';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            // This handles the recurring tasks query
          })),
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              // This handles the ad-hoc tasks query
            }))
          }))
        }))
      }))
    }))
  }
}));

const mockSupabase = supabase as any;

describe('Client Task Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
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
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
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
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
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
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
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
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const result = await getRecurringTaskById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTaskInstanceById', () => {
    it('should return task instance data by ID', async () => {
      const taskId = 'task-instance-1';
      const mockTaskInstance = {
        id: taskId,
        template_id: 'template-1',
        client_id: 'client-1',
        name: 'Test Task Instance',
        description: 'Test Description',
        estimated_hours: 3,
        required_skills: ['Skill1'],
        priority: 'High',
        category: 'Audit',
        status: 'Unscheduled',
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: null,
        recurring_task_id: null,
        completed_at: null,
        assigned_staff_id: null,
        scheduled_start_time: null,
        scheduled_end_time: null,
        clients: { legal_name: 'Test Client' },
        task_templates: { name: 'Test Template' }
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTaskInstance,
              error: null
            })
          })
        })
      });

      const taskInstanceData = await getTaskInstanceById(taskId);
      
      expect(taskInstanceData).toBeDefined();
      expect(taskInstanceData!.taskInstance.id).toBeDefined();
      expect(taskInstanceData!.taskInstance.clientId).toBe(mockTaskInstance.client_id);
    });

    it('should return ad-hoc tasks for a client', async () => {
      const clientId = 'client-1';
      const mockTaskInstance = {
        id: 'task-instance-1',
        template_id: 'template-1',
        client_id: clientId,
        name: 'Ad-hoc Task',
        description: 'Ad-hoc Description',
        estimated_hours: 2,
        required_skills: ['Skill1'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: null,
        recurring_task_id: null,
        completed_at: null,
        assigned_staff_id: null,
        scheduled_start_time: null,
        scheduled_end_time: null,
        clients: { legal_name: 'Test Client' },
        task_templates: { name: 'Test Template' }
      };

      const mockChain = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [mockTaskInstance], error: null }))
            }))
          }))
        }))
      };

      mockSupabase.from.mockReturnValue(mockChain as any);

      const tasks = await getClientAdHocTasks(clientId);
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].taskInstance.id).toBe(mockTaskInstance.id);
    });
  });
});
