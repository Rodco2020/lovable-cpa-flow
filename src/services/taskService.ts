import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { 
  TaskTemplate, 
  RecurringTask, 
  TaskInstance, 
  TaskStatus, 
  RecurrencePattern,
  SkillType,
  TaskPriority,
  TaskCategory
} from '@/types/task';

// Mock data storage for non-migrated functions
let taskInstances: TaskInstance[] = [];

// Helper function to normalize skill IDs or names
// Previously this attempted to filter skills against a fixed list of names,
// which caused valid skill IDs to be removed when reading from the database.
// Now we simply cast each entry to a string and return the array unchanged.
const validateSkillType = (skills: string[] = []): SkillType[] => {
  if (!Array.isArray(skills)) return [];
  return skills.map(s => s.toString()) as SkillType[];
};

// Helper function to validate and convert priority
const validatePriority = (priority: string): TaskPriority => {
  const validPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
  return validPriorities.includes(priority as TaskPriority) 
    ? (priority as TaskPriority) 
    : "Medium";
};

// Helper function to validate and convert category
const validateCategory = (category: string): TaskCategory => {
  const validCategories: TaskCategory[] = ["Tax", "Audit", "Advisory", "Compliance", "Bookkeeping", "Other"];
  return validCategories.includes(category as TaskCategory) 
    ? (category as TaskCategory) 
    : "Other";
};

// Task Template CRUD operations
export const getTaskTemplates = async (includeArchived: boolean = false): Promise<TaskTemplate[]> => {
  try {
    let query = supabase
      .from('task_templates')
      .select('*');
    
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching task templates:', error);
      return [];
    }
    
    // Map Supabase data to TaskTemplate type with proper type conversions
    return data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: validateSkillType(template.required_skills),
      defaultPriority: validatePriority(template.default_priority),
      category: validateCategory(template.category),
      isArchived: template.is_archived,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      version: template.version
    }));
  } catch (err) {
    console.error('Unexpected error fetching task templates:', err);
    return [];
  }
};

export const getTaskTemplateById = async (id: string): Promise<TaskTemplate | undefined> => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching task template by ID:', error);
      return undefined;
    }
    
    // Map Supabase data to TaskTemplate type with proper type conversions
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: validateSkillType(data.required_skills),
      defaultPriority: validatePriority(data.default_priority),
      category: validateCategory(data.category),
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      version: data.version
    };
  } catch (err) {
    console.error('Unexpected error fetching task template by ID:', err);
    return undefined;
  }
};

export const createTaskTemplate = async (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'version'>): Promise<TaskTemplate | null> => {
  try {
    // Prepare the data for Supabase
    const newTemplateData = {
      name: template.name,
      description: template.description,
      default_estimated_hours: template.defaultEstimatedHours,
      required_skills: template.requiredSkills,
      default_priority: template.defaultPriority,
      category: template.category,
      is_archived: false,
      version: 1
    };
    
    const { data, error } = await supabase
      .from('task_templates')
      .insert(newTemplateData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating task template:', error);
      return null;
    }
    
    // Return the created template with typed format
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: validateSkillType(data.required_skills),
      defaultPriority: validatePriority(data.default_priority),
      category: validateCategory(data.category),
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      version: data.version
    };
  } catch (err) {
    console.error('Unexpected error creating task template:', err);
    return null;
  }
};

export const updateTaskTemplate = async (id: string, updates: Partial<Omit<TaskTemplate, 'id' | 'createdAt' | 'version'>>): Promise<TaskTemplate | null> => {
  try {
    // First get the current template to determine the version
    const currentTemplate = await getTaskTemplateById(id);
    if (!currentTemplate) {
      console.error('Template not found for update');
      return null;
    }
    
    // Prepare the data for Supabase
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.defaultEstimatedHours !== undefined) updateData.default_estimated_hours = updates.defaultEstimatedHours;
    if (updates.requiredSkills !== undefined) updateData.required_skills = updates.requiredSkills;
    if (updates.defaultPriority !== undefined) updateData.default_priority = updates.defaultPriority;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;
    
    // Increment version
    updateData.version = currentTemplate.version + 1;
    
    const { data, error } = await supabase
      .from('task_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating task template:', error);
      return null;
    }
    
    // Return the updated template with typed format
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: validateSkillType(data.required_skills),
      defaultPriority: validatePriority(data.default_priority),
      category: validateCategory(data.category),
      isArchived: data.is_archived,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      version: data.version
    };
  } catch (err) {
    console.error('Unexpected error updating task template:', err);
    return null;
  }
};

export const archiveTaskTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('task_templates')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error archiving task template:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error archiving task template:', err);
    return false;
  }
};

// Helper function to map Supabase recurring task to our RecurringTask type
const mapSupabaseToRecurringTask = (data: any): RecurringTask => {
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
    requiredSkills: validateSkillType(data.required_skills),
    priority: validatePriority(data.priority),
    category: validateCategory(data.category),
    status: data.status as TaskStatus,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    recurrencePattern,
    lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : null,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes || undefined
  };
};

// Helper function to map RecurringTask to Supabase format
const mapRecurringTaskToSupabase = (task: RecurringTask | Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive' | 'status'>): any => {
  // Validate required fields are present
  if (!task.templateId) {
    throw new Error('Template ID is required');
  }
  
  if (!task.clientId) {
    throw new Error('Client ID is required');
  }
  
  if (!task.name || task.name.trim() === '') {
    throw new Error('Task name is required');
  }
  
  if (!task.recurrencePattern || !task.recurrencePattern.type) {
    throw new Error('Recurrence pattern type is required');
  }
  
  return {
    template_id: task.templateId,
    client_id: task.clientId,
    name: task.name,
    description: task.description || null,
    estimated_hours: task.estimatedHours,
    required_skills: task.requiredSkills,
    priority: task.priority,
    category: task.category,
    status: 'status' in task ? task.status : 'Unscheduled',
    due_date: task.dueDate ? task.dueDate.toISOString() : null,
    recurrence_type: task.recurrencePattern.type,
    recurrence_interval: task.recurrencePattern.interval || null,
    weekdays: task.recurrencePattern.weekdays || null,
    day_of_month: task.recurrencePattern.dayOfMonth || null,
    month_of_year: task.recurrencePattern.monthOfYear || null,
    end_date: task.recurrencePattern.endDate ? task.recurrencePattern.endDate.toISOString() : null,
    custom_offset_days: task.recurrencePattern.customOffsetDays || null,
    is_active: 'isActive' in task ? task.isActive : true,
    notes: task.notes || null,
  };
};

// Recurring Task operations
export const getRecurringTasks = async (activeOnly: boolean = true): Promise<RecurringTask[]> => {
  try {
    let query = supabase
      .from('recurring_tasks')
      .select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching recurring tasks:', error);
      return [];
    }
    
    // Map Supabase data to RecurringTask type
    return data.map(mapSupabaseToRecurringTask);
  } catch (err) {
    console.error('Unexpected error fetching recurring tasks:', err);
    return [];
  }
};

export const getRecurringTaskById = async (id: string): Promise<RecurringTask | null> => {
  try {
    console.log(`Fetching recurring task with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching recurring task by ID:', error);
      return null;
    }
    
    return mapSupabaseToRecurringTask(data);
  } catch (err) {
    console.error('Error in getRecurringTaskById:', err);
    throw err;
  }
};

export const createRecurringTask = async (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive' | 'status'>): Promise<RecurringTask | null> => {
  try {
    console.log('Creating recurring task with data:', JSON.stringify(task, null, 2));
    
    // Additional validation for recurrence-specific fields
    if (task.recurrencePattern.type === 'Weekly' && 
        (!task.recurrencePattern.weekdays || task.recurrencePattern.weekdays.length === 0)) {
      throw new Error('Weekdays must be specified for weekly recurrence');
    }
    
    if (['Monthly', 'Quarterly', 'Annually'].includes(task.recurrencePattern.type) && 
        !task.recurrencePattern.dayOfMonth) {
      throw new Error('Day of month must be specified for monthly, quarterly, or annual recurrence');
    }
    
    if (task.recurrencePattern.type === 'Annually' && !task.recurrencePattern.monthOfYear) {
      console.warn('Month of year not specified for annual recurrence, defaulting to January');
      task.recurrencePattern.monthOfYear = 1;
    }
    
    // Convert task to Supabase format
    const newTaskData = mapRecurringTaskToSupabase(task);
    
    console.log('Mapped task data for Supabase:', JSON.stringify(newTaskData, null, 2));
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert(newTaskData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating recurring task:', error);
      throw new Error(`Failed to create recurring task: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from recurring task creation');
    }
    
    console.log('Successfully created recurring task:', data.id);
    return mapSupabaseToRecurringTask(data);
  } catch (err) {
    console.error('Error in createRecurringTask:', err);
    throw err; // Rethrow to allow caller to handle the error
  }
};

export const updateRecurringTask = async (id: string, updates: Partial<Omit<RecurringTask, 'id' | 'createdAt'>>): Promise<RecurringTask | null> => {
  try {
    // Prepare the update data for Supabase
    const updateData: any = {};
    
    if (updates.templateId !== undefined) updateData.template_id = updates.templateId;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours;
    if (updates.requiredSkills !== undefined) updateData.required_skills = updates.requiredSkills;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate ? updates.dueDate.toISOString() : null;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    // Handle recurrence pattern updates
    if (updates.recurrencePattern) {
      if (updates.recurrencePattern.type !== undefined) updateData.recurrence_type = updates.recurrencePattern.type;
      if (updates.recurrencePattern.interval !== undefined) updateData.recurrence_interval = updates.recurrencePattern.interval;
      if (updates.recurrencePattern.weekdays !== undefined) updateData.weekdays = updates.recurrencePattern.weekdays;
      if (updates.recurrencePattern.dayOfMonth !== undefined) updateData.day_of_month = updates.recurrencePattern.dayOfMonth;
      if (updates.recurrencePattern.monthOfYear !== undefined) updateData.month_of_year = updates.recurrencePattern.monthOfYear;
      if (updates.recurrencePattern.endDate !== undefined) {
        updateData.end_date = updates.recurrencePattern.endDate ? updates.recurrencePattern.endDate.toISOString() : null;
      }
      if (updates.recurrencePattern.customOffsetDays !== undefined) updateData.custom_offset_days = updates.recurrencePattern.customOffsetDays;
    }
    
    // Handle lastGeneratedDate updates
    if (updates.lastGeneratedDate !== undefined) {
      updateData.last_generated_date = updates.lastGeneratedDate ? updates.lastGeneratedDate.toISOString() : null;
    }
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating recurring task:', error);
      return null;
    }
    
    return mapSupabaseToRecurringTask(data);
  } catch (err) {
    console.error('Unexpected error updating recurring task:', err);
    return null;
  }
};

export const deactivateRecurringTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recurring_tasks')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deactivating recurring task:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error deactivating recurring task:', err);
    return false;
  }
};

// Helper function to map Supabase task instance to our TaskInstance type
const mapSupabaseToTaskInstance = (data: any): TaskInstance => {
  return {
    id: data.id,
    templateId: data.template_id,
    recurringTaskId: data.recurring_task_id || undefined,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: validateSkillType(data.required_skills),
    priority: validatePriority(data.priority),
    category: validateCategory(data.category),
    status: data.status as TaskStatus,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    assignedStaffId: data.assigned_staff_id || undefined,
    scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
    scheduledEndTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes || undefined
  };
};

// Helper function to map TaskInstance to Supabase format
const mapTaskInstanceToSupabase = (task: TaskInstance | Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>): any => {
  // Validate required fields
  if (!task.templateId) {
    throw new Error('Template ID is required');
  }
  
  if (!task.clientId) {
    throw new Error('Client ID is required');
  }
  
  if (!task.name || task.name.trim() === '') {
    throw new Error('Task name is required');
  }
  
  return {
    template_id: task.templateId,
    recurring_task_id: task.recurringTaskId || null,
    client_id: task.clientId,
    name: task.name,
    description: task.description || null,
    estimated_hours: task.estimatedHours,
    required_skills: task.requiredSkills,
    priority: task.priority,
    category: task.category,
    status: task.status,
    due_date: task.dueDate ? task.dueDate.toISOString() : null,
    completed_at: 'completedAt' in task && task.completedAt ? task.completedAt.toISOString() : null,
    assigned_staff_id: 'assignedStaffId' in task ? task.assignedStaffId || null : null,
    scheduled_start_time: 'scheduledStartTime' in task && task.scheduledStartTime ? task.scheduledStartTime.toISOString() : null,
    scheduled_end_time: 'scheduledEndTime' in task && task.scheduledEndTime ? task.scheduledEndTime.toISOString() : null,
    notes: 'notes' in task ? task.notes || null : null
  };
};

// Task Instance operations
export const getTaskInstances = async (filters?: {
  status?: TaskStatus[],
  clientId?: string,
  dueAfter?: Date,
  dueBefore?: Date,
  requiredSkills?: string[]
}): Promise<TaskInstance[]> => {
  try {
    let query = supabase
      .from('task_instances')
      .select('*');
    
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters.dueAfter && filters.dueAfter instanceof Date) {
        query = query.gte('due_date', filters.dueAfter.toISOString());
      }
      if (filters.dueBefore && filters.dueBefore instanceof Date) {
        query = query.lte('due_date', filters.dueBefore.toISOString());
      }
      if (filters.requiredSkills && filters.requiredSkills.length > 0) {
        // For skills, we need to check if any of the task's required skills match any of the filter skills
        // This is more complex in SQL, we'll handle it with a contains operator
        query = query.overlaps('required_skills', filters.requiredSkills);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching task instances:', error);
      return [];
    }
    
    // Map Supabase data to TaskInstance type
    return data.map(mapSupabaseToTaskInstance);
  } catch (err) {
    console.error('Unexpected error fetching task instances:', err);
    return [];
  }
};

export const getUnscheduledTaskInstances = async (): Promise<TaskInstance[]> => {
  return getTaskInstances({ status: ['Unscheduled'] });
};

export const createAdHocTask = async (task: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<TaskInstance | null> => {
  try {
    console.log('Creating ad-hoc task with data:', JSON.stringify(task, null, 2));
    
    // Ensure task has required fields
    if (!task.dueDate) {
      throw new Error('Due date is required for ad-hoc tasks');
    }
    
    const newTaskData = mapTaskInstanceToSupabase({
      ...task,
      status: 'Unscheduled'
    });
    
    console.log('Mapped ad-hoc task data for Supabase:', JSON.stringify(newTaskData, null, 2));
    
    const { data, error } = await supabase
      .from('task_instances')
      .insert(newTaskData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating ad-hoc task:', error);
      throw new Error(`Failed to create ad-hoc task: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from ad-hoc task creation');
    }
    
    console.log('Successfully created ad-hoc task:', data.id);
    return mapSupabaseToTaskInstance(data);
  } catch (err) {
    console.error('Error in createAdHocTask:', err);
    throw err; // Rethrow to allow caller to handle the error
  }
};

/**
 * Fetches a single task instance (ad-hoc task) by ID
 */
export const getTaskInstanceById = async (id: string): Promise<TaskInstance | null> => {
  try {
    console.log(`Fetching task instance with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching task instance:', error);
      throw new Error(`Failed to fetch task instance: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    // Convert dates and format data
    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
      scheduledEndTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskInstance;
  } catch (err) {
    console.error('Error in getTaskInstanceById:', err);
    throw err;
  }
};

/**
 * Updates an existing ad-hoc task instance
 */
export const updateTaskInstance = async (id: string, taskData: Partial<TaskInstance>): Promise<void> => {
  try {
    console.log(`Updating task instance with ID: ${id}`, taskData);
    
    // Prepare data for database (convert Date objects to ISO strings)
    const dbData: any = {
      ...taskData,
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      completed_at: taskData.completedAt ? new Date(taskData.completedAt).toISOString() : null,
      scheduled_start_time: taskData.scheduledStartTime ? new Date(taskData.scheduledStartTime).toISOString() : null,
      scheduled_end_time: taskData.scheduledEndTime ? new Date(taskData.scheduledEndTime).toISOString() : null,
    };
    
    // Remove fields that shouldn't be updated directly
    delete dbData.id;
    delete dbData.dueDate;
    delete dbData.completedAt;
    delete dbData.scheduledStartTime;
    delete dbData.scheduledEndTime;
    delete dbData.createdAt;
    delete dbData.updatedAt;
    
    const { error } = await supabase
      .from('task_instances')
      .update(dbData)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating task instance:', error);
      throw new Error(`Failed to update task instance: ${error.message}`);
    }
    
    console.log('Task instance updated successfully');
  } catch (err) {
    console.error('Error in updateTaskInstance:', err);
    throw err;
  }
};

// Task Generation Engine
export const generateTaskInstances = async (
  fromDate: Date,
  toDate: Date,
  leadTimeDays: number = 14
): Promise<TaskInstance[]> => {
  const newInstances: TaskInstance[] = [];
  
  try {
    // Get all active recurring tasks
    const recurringTasks = await getRecurringTasks(true);
    
    // Process each recurring task
    for (const recurringTask of recurringTasks) {
      // Generate due dates based on recurrence pattern
      const dueDates = calculateDueDates(
        recurringTask.recurrencePattern,
        fromDate,
        toDate,
        recurringTask.lastGeneratedDate
      );
      
      // For each due date, check if we already have a task instance
      for (const dueDate of dueDates) {
        // Check for duplicates in Supabase
        const { data: existingInstances, error: checkError } = await supabase
          .from('task_instances')
          .select('id')
          .eq('recurring_task_id', recurringTask.id)
          .eq('due_date', dueDate.toISOString());
          
        if (checkError) {
          console.error('Error checking for duplicate task instances:', checkError);
          continue;
        }
        
        // If no duplicate found, create a new task instance
        if (!existingInstances || existingInstances.length === 0) {
          const newTaskData = {
            template_id: recurringTask.templateId,
            recurring_task_id: recurringTask.id,
            client_id: recurringTask.clientId,
            name: recurringTask.name,
            description: recurringTask.description || null,
            estimated_hours: recurringTask.estimatedHours,
            required_skills: recurringTask.requiredSkills,
            priority: recurringTask.priority,
            category: recurringTask.category,
            status: 'Unscheduled' as TaskStatus,
            due_date: dueDate.toISOString(),
            completed_at: null,
            assigned_staff_id: null,
            scheduled_start_time: null,
            scheduled_end_time: null,
            notes: null
          };
          
          // Insert the new task instance into Supabase
          const { data, error } = await supabase
            .from('task_instances')
            .insert(newTaskData)
            .select()
            .single();
            
          if (error) {
            console.error('Error creating task instance:', error);
          } else if (data) {
            // Add to our return list
            const newInstance = mapSupabaseToTaskInstance(data);
            newInstances.push(newInstance);
          }
        }
      }
      
      // Update last generated date for the recurring task if any due dates were processed
      if (dueDates.length > 0) {
        const latestDueDate = new Date(Math.max(...dueDates.map(d => d.getTime())));
        await updateRecurringTask(recurringTask.id, {
          lastGeneratedDate: latestDueDate
        });
      }
    }
    
    return newInstances;
    
  } catch (err) {
    console.error('Error generating task instances:', err);
    return [];
  }
};

// Helper functions
function calculateDueDates(
  pattern: RecurrencePattern,
  fromDate: Date,
  toDate: Date,
  lastGeneratedDate: Date | null
): Date[] {
  const dueDates: Date[] = [];
  let currentDate = lastGeneratedDate ? new Date(lastGeneratedDate) : new Date(fromDate);
  
  // Ensure we start from the beginning of our range if lastGeneratedDate is before fromDate
  if (currentDate < fromDate) {
    currentDate = new Date(fromDate);
  }
  
  switch (pattern.type) {
    case 'Daily':
      while (currentDate <= toDate) {
        dueDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
      }
      break;
      
    case 'Weekly':
      // Handle weekly recurrence with specific weekdays
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        while (currentDate <= toDate) {
          const dayOfWeek = currentDate.getDay();
          if (pattern.weekdays.includes(dayOfWeek)) {
            dueDates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Simple weekly recurrence
        while (currentDate <= toDate) {
          dueDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 7 * (pattern.interval || 1));
        }
      }
      break;
      
    case 'Monthly':
      // Find the target day of month
      const dayOfMonth = pattern.dayOfMonth || currentDate.getDate();
      
      // Ensure the current date is at the target day of month
      currentDate.setDate(1); // Start at beginning of month
      
      while (currentDate <= toDate) {
        // Set to the target day of month (or last day if month is shorter)
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        
        currentDate.setDate(targetDay);
        
        // Only add if within our range
        if (currentDate >= fromDate && currentDate <= toDate) {
          dueDates.push(new Date(currentDate));
        }
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
        currentDate.setDate(1); // Reset to first day of month for next iteration
      }
      break;
      
    case 'Quarterly':
      // Similar to monthly, but with 3-month intervals
      const quarterDayOfMonth = pattern.dayOfMonth || currentDate.getDate();
      
      // Make sure we're at the start of a quarter if needed
      if (pattern.interval && pattern.interval > 0) {
        const currentMonth = currentDate.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        currentDate.setMonth(quarterStartMonth);
        currentDate.setDate(1);
      }
      
      while (currentDate <= toDate) {
        // Set to the target day of month
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(quarterDayOfMonth, lastDayOfMonth);
        
        currentDate.setDate(targetDay);
        
        // Only add if within our range
        if (currentDate >= fromDate && currentDate <= toDate) {
          dueDates.push(new Date(currentDate));
        }
        
        // Move to next quarter (3 months)
        currentDate.setMonth(currentDate.getMonth() + 3 * (pattern.interval || 1));
        currentDate.setDate(1); // Reset to first day of month for next iteration
      }
      break;
      
    case 'Annually':
      // Handle annual recurrence, potentially with specific month/day
      const annualMonth = pattern.monthOfYear ? pattern.monthOfYear - 1 : currentDate.getMonth();
      const annualDay = pattern.dayOfMonth || currentDate.getDate();
      
      // Ensure we're on the right day
      currentDate.setMonth(annualMonth);
      
      while (currentDate <= toDate) {
        // Set to the target day of month
        const lastDayOfMonth = new Date(currentDate.getFullYear(), annualMonth + 1, 0).getDate();
        const targetDay = Math.min(annualDay, lastDayOfMonth);
        
        currentDate.setDate(targetDay);
        
        // Only add if within our range
        if (currentDate >= fromDate && currentDate <= toDate) {
          dueDates.push(new Date(currentDate));
        }
        
        // Move to next year
        currentDate.setFullYear(currentDate.getFullYear() + (pattern.interval || 1));
        currentDate.setMonth(annualMonth);
        currentDate.setDate(1); // Reset to first day of month for next iteration
      }
      break;
      
    case 'Custom':
      // Handle custom offsets, like "X days after month-end"
      if (pattern.customOffsetDays !== undefined) {
        while (currentDate <= toDate) {
          // Find month-end (or other reference point)
          const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          
          // Calculate target date with offset
          const targetDate = new Date(monthEnd);
          targetDate.setDate(monthEnd.getDate() + pattern.customOffsetDays);
          
          // Only add if within our range
          if (targetDate >= fromDate && targetDate <= toDate) {
            dueDates.push(new Date(targetDate));
          }
          
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
          currentDate.setDate(1); // Reset to first day of month for next iteration
        }
      }
      break;
  }
  
  return dueDates;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Initialize with some sample data
export const initializeTaskData = async () => {
  try {
    // Check if we already have task templates in Supabase
    const { data: existingTemplates, error: checkError } = await supabase
      .from('task_templates')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing templates:', checkError);
      return;
    }
    
    // If we already have templates, don't initialize those
    if (existingTemplates && existingTemplates.length > 0) {
      console.log('Task templates already exist, skipping initialization');
    } else {
      // Create sample task templates
      const templatePromises = [
        createTaskTemplate({
          name: "Monthly Bookkeeping",
          description: "Reconcile accounts and prepare monthly financial statements",
          defaultEstimatedHours: 3,
          requiredSkills: ["Junior", "Bookkeeping"],
          defaultPriority: "Medium",
          category: "Bookkeeping"
        }),
        createTaskTemplate({
          name: "Quarterly Tax Filing",
          description: "Prepare and submit quarterly tax returns",
          defaultEstimatedHours: 5,
          requiredSkills: ["Senior", "Tax Specialist"],
          defaultPriority: "High",
          category: "Tax"
        }),
        createTaskTemplate({
          name: "Annual Audit",
          description: "Complete annual audit procedures",
          defaultEstimatedHours: 40,
          requiredSkills: ["CPA", "Audit"],
          defaultPriority: "High",
          category: "Audit"
        })
      ];
      
      const createdTemplates = await Promise.all(templatePromises);
      const templateIds = createdTemplates.map(template => template?.id).filter(Boolean) as string[];
      
      if (templateIds.length !== 3) {
        console.error('Failed to create all task templates');
        return;
      }
      
      console.log('Task templates initialized successfully');
      
      // Check if we already have recurring tasks in Supabase
      const { data: existingRecurringTasks, error: recCheckError } = await supabase
        .from('recurring_tasks')
        .select('id')
        .limit(1);
        
      if (recCheckError) {
        console.error('Error checking for existing recurring tasks:', recCheckError);
        return;
      }
      
      // If we already have recurring tasks, don't initialize
      if (existingRecurringTasks && existingRecurringTasks.length > 0) {
        console.log('Recurring tasks already exist, skipping initialization');
        return;
      }
      
      // Create sample recurring tasks
      await createRecurringTask({
        templateId: templateIds[0],
        clientId: "client-001",
        name: "ABC Corp Monthly Bookkeeping",
        description: "Reconcile accounts and prepare monthly financial statements for ABC Corp",
        estimatedHours: 3,
        requiredSkills: ["Junior", "Bookkeeping"],
        priority: "Medium",
        category: "Bookkeeping",
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
        recurrencePattern: {
          type: "Monthly",
          dayOfMonth: 15
        }
      });
      
      await createRecurringTask({
        templateId: templateIds[1],
        clientId: "client-002",
        name: "XYZ Inc Quarterly Taxes",
        description: "Prepare and submit quarterly tax returns for XYZ Inc",
        estimatedHours: 6,  // Overridden from template
        requiredSkills: ["Senior", "Tax Specialist"],
        priority: "High",
        category: "Tax",
        dueDate: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 15),
        recurrencePattern: {
          type: "Quarterly",
          dayOfMonth: 15
        }
      });
      
      console.log('Sample recurring tasks created successfully');
    }
    
    // Check if we already have task instances in Supabase
    const { data: existingTaskInstances, error: taskCheckError } = await supabase
      .from('task_instances')
      .select('id')
      .limit(1);
      
    if (taskCheckError) {
      console.error('Error checking for existing task instances:', taskCheckError);
      return;
    }
    
    // If we already have task instances, don't initialize those
    if (existingTaskInstances && existingTaskInstances.length > 0) {
      console.log('Task instances already exist, skipping initialization');
      return;
    }
    
    // Create sample ad-hoc task
    await createAdHocTask({
      templateId: "00000000-0000-0000-0000-000000000001", // Placeholder template ID
      clientId: "00000000-0000-0000-0000-000000000003", // Placeholder client ID
      name: "Special Advisory Project",
      description: "One-time strategic advisory session",
      estimatedHours: 10,
      requiredSkills: ["CPA", "Advisory"],
      priority: "Medium",
      category: "Advisory",
      dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });
    
    // Generate some task instances for the next 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await generateTaskInstances(now, thirtyDaysLater, 14);
    
    console.log('Sample tasks and task instances initialized');
    
  } catch (err) {
    console.error('Error initializing task data:', err);
  }
};

// Initialize data on module import
initializeTaskData();
