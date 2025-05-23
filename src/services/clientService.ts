import { supabase } from '@/lib/supabaseClient';
import { TaskInstance, RecurringTask, TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';

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

/**
 * Copy a recurring task to another client
 */
export const copyRecurringTask = async (taskId: string, targetClientId: string): Promise<RecurringTask> => {
  try {
    // First, get the source task
    const sourceTask = await getRecurringTaskById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Recurring task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = {
      templateId: sourceTask.templateId,
      clientId: targetClientId,
      name: sourceTask.name,
      description: sourceTask.description,
      estimatedHours: sourceTask.estimatedHours,
      requiredSkills: sourceTask.requiredSkills,
      priority: sourceTask.priority,
      category: sourceTask.category,
      dueDate: sourceTask.dueDate,
      recurrencePattern: {
        type: sourceTask.recurrencePattern.type,
        interval: sourceTask.recurrencePattern.interval,
        weekdays: sourceTask.recurrencePattern.weekdays,
        dayOfMonth: sourceTask.recurrencePattern.dayOfMonth,
        monthOfYear: sourceTask.recurrencePattern.monthOfYear,
        endDate: sourceTask.recurrencePattern.endDate,
        customOffsetDays: sourceTask.recurrencePattern.customOffsetDays,
      },
      notes: sourceTask.notes
    };
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([{
        template_id: newTaskData.templateId,
        client_id: newTaskData.clientId,
        name: newTaskData.name,
        description: newTaskData.description,
        estimated_hours: newTaskData.estimatedHours,
        required_skills: newTaskData.requiredSkills,
        priority: newTaskData.priority,
        category: newTaskData.category,
        due_date: newTaskData.dueDate ? newTaskData.dueDate.toISOString() : null,
        recurrence_type: newTaskData.recurrencePattern.type,
        recurrence_interval: newTaskData.recurrencePattern.interval,
        weekdays: newTaskData.recurrencePattern.weekdays,
        day_of_month: newTaskData.recurrencePattern.dayOfMonth,
        month_of_year: newTaskData.recurrencePattern.monthOfYear,
        end_date: newTaskData.recurrencePattern.endDate ? newTaskData.recurrencePattern.endDate.toISOString() : null,
        custom_offset_days: newTaskData.recurrencePattern.customOffsetDays,
        notes: newTaskData.notes,
        is_active: true,
        status: 'Unscheduled'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying recurring task:', error);
      throw error;
    }
    
    // Convert the database response to our RecurringTask type
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
    console.error('Error in copyRecurringTask:', error);
    throw error;
  }
};

/**
 * Copy an ad-hoc task to another client
 */
export const copyAdHocTask = async (taskId: string, targetClientId: string): Promise<TaskInstance> => {
  try {
    // First, get the source task
    const sourceTask = await getTaskInstanceById(taskId);
    
    if (!sourceTask) {
      throw new Error(`Ad-hoc task with ID ${taskId} not found`);
    }
    
    // Create a new task based on the source task but with the target client ID
    const newTaskData = {
      templateId: sourceTask.templateId,
      clientId: targetClientId,
      name: sourceTask.name,
      description: sourceTask.description,
      estimatedHours: sourceTask.estimatedHours,
      requiredSkills: sourceTask.requiredSkills,
      priority: sourceTask.priority,
      category: sourceTask.category,
      dueDate: sourceTask.dueDate,
      notes: sourceTask.notes
    };
    
    // Create the new task in the database
    const { data, error } = await supabase
      .from('task_instances')
      .insert([{
        template_id: newTaskData.templateId,
        client_id: newTaskData.clientId,
        name: newTaskData.name,
        description: newTaskData.description,
        estimated_hours: newTaskData.estimatedHours,
        required_skills: newTaskData.requiredSkills,
        priority: newTaskData.priority,
        category: newTaskData.category,
        due_date: newTaskData.dueDate ? newTaskData.dueDate.toISOString() : null,
        notes: newTaskData.notes,
        status: 'Unscheduled'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error copying ad-hoc task:', error);
      throw error;
    }
    
    // Convert the database response to our TaskInstance type
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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes
    };
  } catch (error) {
    console.error('Error in copyAdHocTask:', error);
    throw error;
  }
};

/**
 * Copy multiple tasks (both recurring and ad-hoc) to another client
 */
export const copyClientTasks = async (
  recurringTaskIds: string[],
  adHocTaskIds: string[],
  targetClientId: string
): Promise<{ recurring: RecurringTask[], adHoc: TaskInstance[] }> => {
  try {
    const copiedRecurringTasks: RecurringTask[] = [];
    const copiedAdHocTasks: TaskInstance[] = [];
    
    // Copy recurring tasks
    if (recurringTaskIds.length > 0) {
      for (const taskId of recurringTaskIds) {
        try {
          const copiedTask = await copyRecurringTask(taskId, targetClientId);
          copiedRecurringTasks.push(copiedTask);
        } catch (error) {
          console.error(`Failed to copy recurring task ${taskId}:`, error);
          // Continue with other tasks even if one fails
        }
      }
    }
    
    // Copy ad-hoc tasks
    if (adHocTaskIds.length > 0) {
      for (const taskId of adHocTaskIds) {
        try {
          const copiedTask = await copyAdHocTask(taskId, targetClientId);
          copiedAdHocTasks.push(copiedTask);
        } catch (error) {
          console.error(`Failed to copy ad-hoc task ${taskId}:`, error);
          // Continue with other tasks even if one fails
        }
      }
    }
    
    return {
      recurring: copiedRecurringTasks,
      adHoc: copiedAdHocTasks
    };
  } catch (error) {
    console.error('Error in copyClientTasks:', error);
    throw error;
  }
};
