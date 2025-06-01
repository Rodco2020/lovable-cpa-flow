import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, RecurringTask, TaskInstance } from '@/types/task';
import { Database } from '@/types/supabase';

type RecurringTaskRow = Database['public']['Tables']['recurring_tasks']['Row'];
type TaskInstanceRow = Database['public']['Tables']['task_instances']['Row'];
type TaskTemplateRow = Database['public']['Tables']['task_templates']['Row'];

/**
 * Enhanced error handling for task operations
 */
export class TaskServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

/**
 * Create a task template with proper error handling
 */
export const createTaskTemplate = async (templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<TaskTemplate> => {
  try {
    console.log('Creating task template:', templateData);
    
    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        name: templateData.name,
        description: templateData.description,
        default_estimated_hours: templateData.defaultEstimatedHours,
        required_skills: templateData.requiredSkills,
        default_priority: templateData.defaultPriority,
        category: templateData.category,
        is_archived: templateData.isArchived || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task template:', error);
      throw new TaskServiceError(
        `Failed to create task template: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapTaskTemplateFromDB(data);
  } catch (error) {
    console.error('Task template creation failed:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error creating task template', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Create a recurring task with enhanced validation and error handling
 */
export const createRecurringTask = async (taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringTask> => {
  try {
    console.log('Creating recurring task:', taskData);
    
    // Validate template exists first
    const { data: templateExists, error: templateError } = await supabase
      .from('task_templates')
      .select('id')
      .eq('id', taskData.templateId)
      .single();

    if (templateError || !templateExists) {
      throw new TaskServiceError(
        `Template with ID ${taskData.templateId} not found`,
        'TEMPLATE_NOT_FOUND',
        { templateId: taskData.templateId }
      );
    }

    // Validate client exists
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', taskData.clientId)
      .single();

    if (clientError || !clientExists) {
      throw new TaskServiceError(
        `Client with ID ${taskData.clientId} not found`,
        'CLIENT_NOT_FOUND',
        { clientId: taskData.clientId }
      );
    }

    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({
        template_id: taskData.templateId,
        client_id: taskData.clientId,
        name: taskData.name,
        description: taskData.description,
        estimated_hours: taskData.estimatedHours,
        required_skills: taskData.requiredSkills,
        priority: taskData.priority,
        category: taskData.category,
        status: taskData.status,
        due_date: taskData.dueDate?.toISOString(),
        recurrence_type: taskData.recurrencePattern.type,
        recurrence_interval: taskData.recurrencePattern.interval,
        weekdays: taskData.recurrencePattern.weekdays,
        day_of_month: taskData.recurrencePattern.dayOfMonth,
        month_of_year: taskData.recurrencePattern.monthOfYear,
        end_date: taskData.recurrencePattern.endDate?.toISOString(),
        custom_offset_days: taskData.recurrencePattern.customOffsetDays,
        last_generated_date: taskData.lastGeneratedDate?.toISOString(),
        is_active: taskData.isActive,
        notes: taskData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring task:', error);
      throw new TaskServiceError(
        `Failed to create recurring task: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapRecurringTaskFromDB(data);
  } catch (error) {
    console.error('Recurring task creation failed:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error creating recurring task', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Create a task instance with enhanced validation
 */
export const createTaskInstance = async (instanceData: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskInstance> => {
  try {
    console.log('Creating task instance:', instanceData);
    
    // Validate template exists
    const { data: templateExists, error: templateError } = await supabase
      .from('task_templates')
      .select('id')
      .eq('id', instanceData.templateId)
      .single();

    if (templateError || !templateExists) {
      throw new TaskServiceError(
        `Template with ID ${instanceData.templateId} not found`,
        'TEMPLATE_NOT_FOUND',
        { templateId: instanceData.templateId }
      );
    }

    // Validate client exists
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', instanceData.clientId)
      .single();

    if (clientError || !clientExists) {
      throw new TaskServiceError(
        `Client with ID ${instanceData.clientId} not found`,
        'CLIENT_NOT_FOUND',
        { clientId: instanceData.clientId }
      );
    }

    const { data, error } = await supabase
      .from('task_instances')
      .insert({
        template_id: instanceData.templateId,
        client_id: instanceData.clientId,
        name: instanceData.name,
        description: instanceData.description,
        estimated_hours: instanceData.estimatedHours,
        required_skills: instanceData.requiredSkills,
        priority: instanceData.priority,
        category: instanceData.category,
        status: instanceData.status,
        due_date: instanceData.dueDate?.toISOString(),
        recurring_task_id: instanceData.recurringTaskId,
        completed_at: instanceData.completedAt?.toISOString(),
        assigned_staff_id: instanceData.assignedStaffId,
        scheduled_start_time: instanceData.scheduledStartTime?.toISOString(),
        scheduled_end_time: instanceData.scheduledEndTime?.toISOString(),
        notes: instanceData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task instance:', error);
      throw new TaskServiceError(
        `Failed to create task instance: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapTaskInstanceFromDB(data);
  } catch (error) {
    console.error('Task instance creation failed:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error creating task instance', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Get task templates with error handling
 */
export const getTaskTemplates = async (includeArchived = false): Promise<TaskTemplate[]> => {
  try {
    console.log('Fetching task templates, includeArchived:', includeArchived);
    
    let query = supabase.from('task_templates').select('*');
    
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    
    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching task templates:', error);
      throw new TaskServiceError(
        `Failed to fetch task templates: ${error.message}`,
        error.code,
        error.details
      );
    }

    return (data || []).map(mapTaskTemplateFromDB);
  } catch (error) {
    console.error('Failed to fetch task templates:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error fetching task templates', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Get recurring tasks with error handling
 */
export const getRecurringTasks = async (includeInactive = false): Promise<RecurringTask[]> => {
  try {
    console.log('Fetching recurring tasks, includeInactive:', includeInactive);
    
    let query = supabase.from('recurring_tasks').select('*');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching recurring tasks:', error);
      throw new TaskServiceError(
        `Failed to fetch recurring tasks: ${error.message}`,
        error.code,
        error.details
      );
    }

    return (data || []).map(mapRecurringTaskFromDB);
  } catch (error) {
    console.error('Failed to fetch recurring tasks:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error fetching recurring tasks', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Get task instances with filtering options
 */
export const getTaskInstances = async (filters?: {
  status?: string;
  dueAfter?: Date;
  dueBefore?: Date;
  clientId?: string;
}): Promise<TaskInstance[]> => {
  try {
    console.log('Fetching task instances with filters:', filters);
    
    let query = supabase.from('task_instances').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.dueAfter) {
      query = query.gte('due_date', filters.dueAfter.toISOString());
    }
    
    if (filters?.dueBefore) {
      query = query.lte('due_date', filters.dueBefore.toISOString());
    }
    
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    
    const { data, error } = await query.order('due_date');

    if (error) {
      console.error('Error fetching task instances:', error);
      throw new TaskServiceError(
        `Failed to fetch task instances: ${error.message}`,
        error.code,
        error.details
      );
    }

    return (data || []).map(mapTaskInstanceFromDB);
  } catch (error) {
    console.error('Failed to fetch task instances:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error fetching task instances', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Get unscheduled task instances
 */
export const getUnscheduledTaskInstances = async (): Promise<TaskInstance[]> => {
  return getTaskInstances({ status: 'Unscheduled' });
};

/**
 * Update task instance
 */
export const updateTaskInstance = async (id: string, updates: Partial<TaskInstance>): Promise<TaskInstance> => {
  try {
    console.log('Updating task instance:', id, updates);
    
    const { data, error } = await supabase
      .from('task_instances')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.estimatedHours && { estimated_hours: updates.estimatedHours }),
        ...(updates.requiredSkills && { required_skills: updates.requiredSkills }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.category && { category: updates.category }),
        ...(updates.status && { status: updates.status }),
        ...(updates.dueDate && { due_date: updates.dueDate.toISOString() }),
        ...(updates.assignedStaffId && { assigned_staff_id: updates.assignedStaffId }),
        ...(updates.scheduledStartTime && { scheduled_start_time: updates.scheduledStartTime.toISOString() }),
        ...(updates.scheduledEndTime && { scheduled_end_time: updates.scheduledEndTime.toISOString() }),
        ...(updates.completedAt && { completed_at: updates.completedAt.toISOString() }),
        ...(updates.notes && { notes: updates.notes })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task instance:', error);
      throw new TaskServiceError(
        `Failed to update task instance: ${error.message}`,
        error.code,
        error.details
      );
    }

    return mapTaskInstanceFromDB(data);
  } catch (error) {
    console.error('Failed to update task instance:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error updating task instance', 'UNKNOWN_ERROR', error);
  }
};

/**
 * Delete operations with proper error handling
 */
export const deleteRecurringTaskAssignment = async (id: string): Promise<void> => {
  try {
    console.log('Deleting recurring task:', id);
    
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring task:', error);
      throw new TaskServiceError(
        `Failed to delete recurring task: ${error.message}`,
        error.code,
        error.details
      );
    }
  } catch (error) {
    console.error('Failed to delete recurring task:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error deleting recurring task', 'UNKNOWN_ERROR', error);
  }
};

export const deleteTaskInstance = async (id: string): Promise<void> => {
  try {
    console.log('Deleting task instance:', id);
    
    const { error } = await supabase
      .from('task_instances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task instance:', error);
      throw new TaskServiceError(
        `Failed to delete task instance: ${error.message}`,
        error.code,
        error.details
      );
    }
  } catch (error) {
    console.error('Failed to delete task instance:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error deleting task instance', 'UNKNOWN_ERROR', error);
  }
};

// Mapping functions
const mapTaskTemplateFromDB = (row: TaskTemplateRow): TaskTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  defaultEstimatedHours: Number(row.default_estimated_hours),
  requiredSkills: row.required_skills || [],
  defaultPriority: row.default_priority as TaskTemplate['defaultPriority'],
  category: row.category as TaskTemplate['category'],
  isArchived: row.is_archived,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  version: row.version
});

const mapRecurringTaskFromDB = (row: RecurringTaskRow): RecurringTask => ({
  id: row.id,
  templateId: row.template_id,
  clientId: row.client_id,
  name: row.name,
  description: row.description || '',
  estimatedHours: Number(row.estimated_hours),
  requiredSkills: row.required_skills || [],
  priority: row.priority as RecurringTask['priority'],
  category: row.category as RecurringTask['category'],
  status: row.status as RecurringTask['status'],
  dueDate: row.due_date ? new Date(row.due_date) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  notes: row.notes,
  recurrencePattern: {
    type: row.recurrence_type as RecurringTask['recurrencePattern']['type'],
    interval: row.recurrence_interval || undefined,
    weekdays: row.weekdays || undefined,
    dayOfMonth: row.day_of_month || undefined,
    monthOfYear: row.month_of_year || undefined,
    endDate: row.end_date ? new Date(row.end_date) : null,
    customOffsetDays: row.custom_offset_days || undefined
  },
  lastGeneratedDate: row.last_generated_date ? new Date(row.last_generated_date) : null,
  isActive: row.is_active
});

const mapTaskInstanceFromDB = (row: TaskInstanceRow): TaskInstance => ({
  id: row.id,
  templateId: row.template_id,
  clientId: row.client_id,
  name: row.name,
  description: row.description || '',
  estimatedHours: Number(row.estimated_hours),
  requiredSkills: row.required_skills || [],
  priority: row.priority as TaskInstance['priority'],
  category: row.category as TaskInstance['category'],
  status: row.status as TaskInstance['status'],
  dueDate: row.due_date ? new Date(row.due_date) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  notes: row.notes,
  recurringTaskId: row.recurring_task_id || undefined,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  assignedStaffId: row.assigned_staff_id || undefined,
  scheduledStartTime: row.scheduled_start_time ? new Date(row.scheduled_start_time) : undefined,
  scheduledEndTime: row.scheduled_end_time ? new Date(row.scheduled_end_time) : undefined
});
