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

// Helper function to validate and convert skill types
const validateSkillType = (skills: string[]): SkillType[] => {
  const validSkillTypes: SkillType[] = ["Junior", "Senior", "CPA", "Tax Specialist", "Audit", "Advisory", "Bookkeeping"];
  return skills.filter(skill => validSkillTypes.includes(skill as SkillType)) as SkillType[];
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
  return {
    template_id: task.templateId,
    client_id: task.clientId,
    name: task.name,
    description: task.description,
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
    console.error('Unexpected error fetching recurring task by ID:', err);
    return null;
  }
};

export const createRecurringTask = async (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive' | 'status'>): Promise<RecurringTask | null> => {
  try {
    const newTaskData = mapRecurringTaskToSupabase(task);
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert(newTaskData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating recurring task:', error);
      return null;
    }
    
    return mapSupabaseToRecurringTask(data);
  } catch (err) {
    console.error('Unexpected error creating recurring task:', err);
    return null;
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

// Task Instance operations
export const getTaskInstances = (filters?: {
  status?: TaskStatus[],
  clientId?: string,
  dueAfter?: Date,
  dueBefore?: Date,
  requiredSkills?: string[]
}): TaskInstance[] => {
  let filteredTasks = [...taskInstances];
  
  if (filters) {
    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => filters.status?.includes(t.status));
    }
    if (filters.clientId) {
      filteredTasks = filteredTasks.filter(t => t.clientId === filters.clientId);
    }
    if (filters.dueAfter && filters.dueAfter instanceof Date) {
      filteredTasks = filteredTasks.filter(t => t.dueDate && t.dueDate >= filters.dueAfter!);
    }
    if (filters.dueBefore && filters.dueBefore instanceof Date) {
      filteredTasks = filteredTasks.filter(t => t.dueDate && t.dueDate <= filters.dueBefore!);
    }
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
      filteredTasks = filteredTasks.filter(t => 
        t.requiredSkills.some(skill => filters.requiredSkills?.includes(skill))
      );
    }
  }
  
  return filteredTasks;
};

export const getUnscheduledTaskInstances = (): TaskInstance[] => {
  return taskInstances.filter(t => t.status === 'Unscheduled');
};

export const createAdHocTask = (task: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt' | 'status'>): TaskInstance => {
  const newTask: TaskInstance = {
    ...task,
    id: uuidv4(),
    status: 'Unscheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  taskInstances.push(newTask);
  return newTask;
};

export const updateTaskInstance = (id: string, updates: Partial<Omit<TaskInstance, 'id' | 'createdAt'>>): TaskInstance | null => {
  const index = taskInstances.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  taskInstances[index] = {
    ...taskInstances[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return taskInstances[index];
};

// Task Generation Engine
export const generateTaskInstances = (
  fromDate: Date,
  toDate: Date,
  leadTimeDays: number = 14
): TaskInstance[] => {
  const newInstances: TaskInstance[] = [];
  
  // Generate tasks for each active recurring task
  getRecurringTasks(true)
    .then(recurringTasks => {
      recurringTasks.forEach(recurringTask => {
        // Generate instances based on recurrence pattern
        const dueDates = calculateDueDates(
          recurringTask.recurrencePattern,
          fromDate,
          toDate,
          recurringTask.lastGeneratedDate
        );
        
        // Create task instances for each due date
        dueDates.forEach(dueDate => {
          // Check for duplicates (avoid regenerating tasks)
          const isDuplicate = taskInstances.some(
            ti => ti.recurringTaskId === recurringTask.id && 
                 ti.dueDate && 
                 isSameDay(ti.dueDate, dueDate)
          );
          
          if (!isDuplicate) {
            const newTaskInstance: TaskInstance = {
              id: uuidv4(),
              templateId: recurringTask.templateId,
              clientId: recurringTask.clientId,
              name: recurringTask.name,
              description: recurringTask.description,
              estimatedHours: recurringTask.estimatedHours,
              requiredSkills: [...recurringTask.requiredSkills],
              priority: recurringTask.priority,
              category: recurringTask.category,
              status: 'Unscheduled',
              dueDate: dueDate,
              recurringTaskId: recurringTask.id,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            newInstances.push(newTaskInstance);
          }
        });
        
        // Update last generated date for the recurring task
        if (dueDates.length > 0) {
          const latestDueDate = new Date(Math.max(...dueDates.map(d => d.getTime())));
          updateRecurringTask(recurringTask.id, {
            lastGeneratedDate: latestDueDate
          });
        }
      });
      
      // Add the new instances to our storage
      taskInstances.push(...newInstances);
    })
    .catch(err => {
      console.error('Error generating task instances:', err);
    });
  
  return newInstances;
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
  
  // Simple implementation for now - can be expanded with more complex recurrence patterns
  switch (pattern.type) {
    case 'Daily':
      while (currentDate <= toDate) {
        dueDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
      }
      break;
      
    case 'Weekly':
      while (currentDate <= toDate) {
        if (!pattern.weekdays || pattern.weekdays.includes(currentDate.getDay())) {
          dueDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      break;
      
    case 'Monthly':
      while (currentDate <= toDate) {
        if (pattern.dayOfMonth && currentDate.getDate() === pattern.dayOfMonth) {
          dueDates.push(new Date(currentDate));
          // Skip to next month
          currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
          currentDate.setDate(pattern.dayOfMonth);
        } else {
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      break;
      
    // Additional patterns can be implemented (Quarterly, Annually, Custom)
    default:
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
    
    // If we already have templates, don't initialize
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
    
    // Create sample ad-hoc task
    createAdHocTask({
      templateId: "template-id", // This would be replaced with a real template ID in production
      clientId: "client-003",
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
    generateTaskInstances(now, thirtyDaysLater, 14);
  } catch (err) {
    console.error('Error initializing task data:', err);
  }
};

// Initialize data on module import
initializeTaskData();
