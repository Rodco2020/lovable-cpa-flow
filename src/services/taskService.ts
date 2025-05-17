import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { 
  TaskTemplate, 
  TaskCategory, 
  TaskPriority, 
  RecurringTask, 
  TaskInstance, 
  RecurrencePattern,
  RecurrenceType,
  SkillType
} from '@/types/task';

export type RecurringTaskCreateParams = Omit<RecurringTask, "id" | "createdAt" | "updatedAt" | "lastGeneratedDate">;
export type RecurringTaskUpdateParams = Partial<Omit<RecurringTask, "id" | "createdAt" | "updatedAt">>;
export type AdHocTaskCreateParams = Omit<TaskInstance, "id" | "createdAt" | "updatedAt" | "completedAt" | "status">;

// Implement the task template functions
export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_archived', false)
      .order('name');
      
    if (error) throw error;
    
    return data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: template.required_skills,
      defaultPriority: template.default_priority as TaskPriority,
      category: template.category as TaskCategory,
      version: template.version,
      isArchived: template.is_archived,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return [];
  }
};

export const getTaskTemplate = async (id: string): Promise<TaskTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority as TaskPriority,
      category: data.category as TaskCategory,
      version: data.version,
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error fetching task template:', error);
    return null;
  }
};

export const createTaskTemplate = async (template: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "version">): Promise<TaskTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .insert([
        {
          name: template.name,
          description: template.description,
          default_estimated_hours: template.defaultEstimatedHours,
          required_skills: template.requiredSkills,
          default_priority: template.defaultPriority,
          category: template.category,
          is_archived: template.isArchived
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority as TaskPriority,
      category: data.category as TaskCategory,
      version: data.version,
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating task template:', error);
    return null;
  }
};

export const updateTaskTemplate = async (id: string, updates: Partial<Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "version">>): Promise<TaskTemplate | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.defaultEstimatedHours !== undefined) updateData.default_estimated_hours = updates.defaultEstimatedHours;
    if (updates.requiredSkills !== undefined) updateData.required_skills = updates.requiredSkills;
    if (updates.defaultPriority !== undefined) updateData.default_priority = updates.defaultPriority;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;
    
    // Increment version
    updateData.version = supabase.rpc('increment_version', { row_id: id });
    
    const { data, error } = await supabase
      .from('task_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority as TaskPriority,
      category: data.category as TaskCategory,
      version: data.version,
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating task template:', error);
    return null;
  }
};

export const archiveTaskTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_templates')
      .update({ is_archived: true })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error archiving task template:', error);
    return false;
  }
};

// Implement recurring task functions
export const createRecurringTask = async (task: RecurringTaskCreateParams): Promise<RecurringTask | null> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([
        {
          client_id: task.clientId,
          name: task.name,
          description: task.description,
          template_id: task.templateId,
          is_active: task.isActive,
          required_skills: task.requiredSkills,
          priority: task.priority,
          estimated_hours: task.estimatedHours,
          category: task.category,
          recurrence_type: task.recurrencePattern.type,
          recurrence_interval: task.recurrencePattern.interval,
          weekdays: task.recurrencePattern.weekdays,
          day_of_month: task.recurrencePattern.dayOfMonth,
          month_of_year: task.recurrencePattern.monthOfYear,
          custom_offset_days: task.recurrencePattern.customOffsetDays,
          due_date: task.dueDate,
          end_date: task.endDate,
          notes: task.notes
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      templateId: data.template_id,
      isActive: data.is_active,
      requiredSkills: data.required_skills,
      priority: data.priority as TaskPriority,
      estimatedHours: data.estimated_hours,
      category: data.category as TaskCategory,
      recurrencePattern: {
        type: data.recurrence_type as RecurrenceType,
        interval: data.recurrence_interval,
        weekdays: data.weekdays,
        dayOfMonth: data.day_of_month,
        monthOfYear: data.month_of_year,
        customOffsetDays: data.custom_offset_days
      },
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating recurring task:', error);
    return null;
  }
};

export const updateRecurringTask = async (id: string, updates: RecurringTaskUpdateParams): Promise<RecurringTask | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.requiredSkills !== undefined) updateData.required_skills = updates.requiredSkills;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.recurrencePattern) {
      if (updates.recurrencePattern.type !== undefined) updateData.recurrence_type = updates.recurrencePattern.type;
      if (updates.recurrencePattern.interval !== undefined) updateData.recurrence_interval = updates.recurrencePattern.interval;
      if (updates.recurrencePattern.weekdays !== undefined) updateData.weekdays = updates.recurrencePattern.weekdays;
      if (updates.recurrencePattern.dayOfMonth !== undefined) updateData.day_of_month = updates.recurrencePattern.dayOfMonth;
      if (updates.recurrencePattern.monthOfYear !== undefined) updateData.month_of_year = updates.recurrencePattern.monthOfYear;
      if (updates.recurrencePattern.customOffsetDays !== undefined) updateData.custom_offset_days = updates.recurrencePattern.customOffsetDays;
    }
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      templateId: data.template_id,
      isActive: data.is_active,
      requiredSkills: data.required_skills,
      priority: data.priority as TaskPriority,
      estimatedHours: data.estimated_hours,
      category: data.category as TaskCategory,
      recurrencePattern: {
        type: data.recurrence_type as RecurrenceType,
        interval: data.recurrence_interval,
        weekdays: data.weekdays,
        dayOfMonth: data.day_of_month,
        monthOfYear: data.month_of_year,
        customOffsetDays: data.custom_offset_days
      },
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating recurring task:', error);
    return null;
  }
};

export const getRecurringTask = async (id: string): Promise<RecurringTask | null> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      templateId: data.template_id,
      isActive: data.is_active,
      requiredSkills: data.required_skills,
      priority: data.priority as TaskPriority,
      estimatedHours: data.estimated_hours,
      category: data.category as TaskCategory,
      recurrencePattern: {
        type: data.recurrence_type as RecurrenceType,
        interval: data.recurrence_interval,
        weekdays: data.weekdays,
        dayOfMonth: data.day_of_month,
        monthOfYear: data.month_of_year,
        customOffsetDays: data.custom_offset_days
      },
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : undefined,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error fetching recurring task:', error);
    return null;
  }
};

export const getRecurringTasks = async (clientId?: string): Promise<RecurringTask[]> => {
  try {
    let query = supabase
      .from('recurring_tasks')
      .select('*');
      
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
      
    if (error) throw error;
    
    return data.map(task => ({
      id: task.id,
      clientId: task.client_id,
      name: task.name,
      description: task.description || '',
      templateId: task.template_id,
      isActive: task.is_active,
      requiredSkills: task.required_skills,
      priority: task.priority as TaskPriority,
      estimatedHours: task.estimated_hours,
      category: task.category as TaskCategory,
      recurrencePattern: {
        type: task.recurrence_type as RecurrenceType,
        interval: task.recurrence_interval,
        weekdays: task.weekdays,
        dayOfMonth: task.day_of_month,
        monthOfYear: task.month_of_year,
        customOffsetDays: task.custom_offset_days
      },
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      lastGeneratedDate: task.last_generated_date ? new Date(task.last_generated_date) : undefined,
      endDate: task.end_date ? new Date(task.end_date) : undefined,
      notes: task.notes || '',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return [];
  }
};

export const deactivateRecurringTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recurring_tasks')
      .update({ is_active: false })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deactivating recurring task:', error);
    return false;
  }
};

// Mock data and utility functions
const mockTaskTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Prepare Tax Return',
    description: 'Prepare and file annual tax return for client',
    defaultEstimatedHours: 4,
    requiredSkills: ['Tax'],
    defaultPriority: 'Medium',
    category: 'Tax',
    version: 1,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Monthly Bookkeeping',
    description: 'Record monthly financial transactions',
    defaultEstimatedHours: 8,
    requiredSkills: ['Bookkeeping'],
    defaultPriority: 'High',
    category: 'Bookkeeping',
    version: 1,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Conduct Audit',
    description: 'Perform annual audit of financial statements',
    defaultEstimatedHours: 40,
    requiredSkills: ['Audit'],
    defaultPriority: 'Urgent',
    category: 'Audit',
    version: 1,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Provide Financial Advisory',
    description: 'Advise client on financial planning and investments',
    defaultEstimatedHours: 2,
    requiredSkills: ['Advisory'],
    defaultPriority: 'Low',
    category: 'Advisory',
    version: 1,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getMockTaskTemplates = (): TaskTemplate[] => {
  return mockTaskTemplates;
};
