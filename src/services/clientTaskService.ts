
import { supabase } from '@/lib/supabaseClient';
import { TaskInstance, RecurringTask, TaskPriority, TaskCategory, RecurrencePattern, TaskStatus } from '@/types/task';
import { getRecurringTasks, getTaskInstances } from './taskService';

/**
 * Client Task Service
 * 
 * Handles operations related to client tasks including:
 * - Fetching client ad-hoc and recurring tasks
 * - Task instance retrieval by ID
 * - Recurring task retrieval by ID
 */

/**
 * Get a recurring task by ID
 */
export const getRecurringTaskById = async (taskId: string): Promise<RecurringTask | null> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching recurring task:', error);
      throw error;
    }
    
    // Create recurrence pattern object from individual fields
    const recurrencePattern: RecurrencePattern = {
      type: data.recurrence_type as RecurrencePattern['type'],
      interval: data.recurrence_interval || undefined,
      weekdays: data.weekdays || undefined,
      dayOfMonth: data.day_of_month || undefined,
      monthOfYear: data.month_of_year || undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      customOffsetDays: data.custom_offset_days || undefined,
    };
    
    return {
      id: data.id,
      templateId: data.template_id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      estimatedHours: data.estimated_hours,
      requiredSkills: data.required_skills || [],
      priority: data.priority as TaskPriority,
      category: data.category as TaskCategory,
      status: data.status as TaskStatus,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      recurrencePattern,
      lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : null,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes
    };
  } catch (error) {
    console.error('Error in getRecurringTaskById:', error);
    throw error;
  }
};

/**
 * Get a task instance by ID
 */
export const getTaskInstanceById = async (taskId: string): Promise<TaskInstance | null> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching task instance:', error);
      throw error;
    }
    
    return {
      id: data.id,
      templateId: data.template_id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      estimatedHours: data.estimated_hours,
      requiredSkills: data.required_skills || [],
      priority: data.priority as TaskPriority,
      category: data.category as TaskCategory,
      status: data.status as TaskStatus,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      assignedStaffId: data.assigned_staff_id,
      scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
      scheduledEndTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes
    };
  } catch (error) {
    console.error('Error in getTaskInstanceById:', error);
    throw error;
  }
};

/**
 * Fetch ad-hoc tasks for a specific client
 */
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId)
      .is('recurring_task_id', null)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching client ad-hoc tasks:', error);
      throw error;
    }
    
    // Map the database results to our TaskInstance type
    return data.map(task => ({
      id: task.id,
      templateId: task.template_id,
      clientId: task.client_id,
      name: task.name,
      description: task.description || '',
      estimatedHours: task.estimated_hours,
      requiredSkills: task.required_skills || [],
      priority: task.priority as TaskPriority,
      category: task.category as TaskCategory,
      status: task.status as TaskStatus,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      assignedStaffId: task.assigned_staff_id,
      scheduledStartTime: task.scheduled_start_time ? new Date(task.scheduled_start_time) : undefined,
      scheduledEndTime: task.scheduled_end_time ? new Date(task.scheduled_end_time) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      notes: task.notes
    }));
  } catch (error) {
    console.error('Error in getClientAdHocTasks:', error);
    throw error;
  }
};

/**
 * Fetch recurring tasks for a specific client
 */
export const getClientRecurringTasks = async (clientId: string): Promise<RecurringTask[]> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching client recurring tasks:', error);
      throw error;
    }
    
    // Map the database results to our RecurringTask type
    return data.map(task => {
      // Create recurrence pattern object from individual fields
      const recurrencePattern: RecurrencePattern = {
        type: task.recurrence_type as RecurrencePattern['type'],
        interval: task.recurrence_interval || undefined,
        weekdays: task.weekdays || undefined,
        dayOfMonth: task.day_of_month || undefined,
        monthOfYear: task.month_of_year || undefined,
        endDate: task.end_date ? new Date(task.end_date) : undefined,
        customOffsetDays: task.custom_offset_days || undefined,
      };
      
      return {
        id: task.id,
        templateId: task.template_id,
        clientId: task.client_id,
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimated_hours,
        requiredSkills: task.required_skills || [],
        priority: task.priority as TaskPriority,
        category: task.category as TaskCategory,
        status: task.status as TaskStatus,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        recurrencePattern,
        lastGeneratedDate: task.last_generated_date ? new Date(task.last_generated_date) : null,
        isActive: task.is_active,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        notes: task.notes
      };
    });
  } catch (error) {
    console.error('Error in getClientRecurringTasks:', error);
    throw error;
  }
};
