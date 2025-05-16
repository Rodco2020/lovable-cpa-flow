import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { 
  TaskTemplate, 
  RecurringTask, 
  TaskInstance, 
  TaskStatus, 
  RecurrencePattern 
} from '@/types/task';

// Mock data storage for non-migrated functions
let recurringTasks: RecurringTask[] = [];
let taskInstances: TaskInstance[] = [];

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
    
    // Map Supabase data to TaskTemplate type
    return data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: template.required_skills,
      defaultPriority: template.default_priority,
      category: template.category,
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
    
    // Map Supabase data to TaskTemplate type
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      defaultEstimatedHours: data.default_estimated_hours,
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority,
      category: data.category,
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
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority,
      category: data.category,
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
      requiredSkills: data.required_skills,
      defaultPriority: data.default_priority,
      category: data.category,
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

// Recurring Task operations
export const getRecurringTasks = (activeOnly: boolean = true): RecurringTask[] => {
  // ... keep existing code (in-memory implementation for recurring tasks)
  return activeOnly ? recurringTasks.filter(t => t.isActive) : recurringTasks;
};

export const createRecurringTask = (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive' | 'status'>): RecurringTask => {
  // ... keep existing code (in-memory implementation for creating recurring tasks)
  const newTask: RecurringTask = {
    ...task,
    id: uuidv4(),
    status: 'Unscheduled',
    isActive: true,
    lastGeneratedDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  recurringTasks.push(newTask);
  return newTask;
};

export const updateRecurringTask = (id: string, updates: Partial<Omit<RecurringTask, 'id' | 'createdAt'>>): RecurringTask | null => {
  // ... keep existing code (in-memory implementation for updating recurring tasks)
  const index = recurringTasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  recurringTasks[index] = {
    ...recurringTasks[index],
    ...updates,
    updatedAt: new Date()
  };
  
  return recurringTasks[index];
};

export const deactivateRecurringTask = (id: string): boolean => {
  // ... keep existing code (in-memory implementation for deactivating recurring tasks)
  const index = recurringTasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  recurringTasks[index] = {
    ...recurringTasks[index],
    isActive: false,
    updatedAt: new Date()
  };
  return true;
};

// Task Instance operations
export const getTaskInstances = (filters?: {
  status?: TaskStatus[],
  clientId?: string,
  dueAfter?: Date,
  dueBefore?: Date,
  requiredSkills?: string[]
}): TaskInstance[] => {
  // ... keep existing code (in-memory implementation for fetching task instances)
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
  // ... keep existing code (in-memory implementation for fetching unscheduled task instances)
  return taskInstances.filter(t => t.status === 'Unscheduled');
};

export const createAdHocTask = (task: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt' | 'status'>): TaskInstance => {
  // ... keep existing code (in-memory implementation for creating ad-hoc tasks)
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
  // ... keep existing code (in-memory implementation for updating task instances)
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
  // ... keep existing code (in-memory implementation for generating task instances)
  const newInstances: TaskInstance[] = [];
  
  // Generate tasks for each active recurring task
  recurringTasks
    .filter(rt => rt.isActive)
    .forEach(recurringTask => {
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
        const recurringTaskIndex = recurringTasks.findIndex(rt => rt.id === recurringTask.id);
        if (recurringTaskIndex !== -1) {
          recurringTasks[recurringTaskIndex] = {
            ...recurringTasks[recurringTaskIndex],
            lastGeneratedDate: latestDueDate,
            updatedAt: new Date()
          };
        }
      }
    });
  
  // Add the new instances to our storage
  taskInstances.push(...newInstances);
  return newInstances;
};

// Helper functions
function calculateDueDates(
  pattern: RecurrencePattern,
  fromDate: Date,
  toDate: Date,
  lastGeneratedDate: Date | null
): Date[] {
  // ... keep existing code (helper function for calculating due dates)
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
  // ... keep existing code (helper function for comparing dates)
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
      return;
    }
    
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
    
    // Create sample recurring tasks (still using in-memory implementation)
    createRecurringTask({
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
    
    createRecurringTask({
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
    
    // Create sample ad-hoc task
    createAdHocTask({
      templateId: templateIds[2],
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
