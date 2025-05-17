import { v4 as uuidv4 } from 'uuid';
import { 
  TaskTemplate, 
  TaskInstance, 
  RecurringTask, 
  RecurringTaskCreateParams, 
  AdHocTaskCreateParams,
  RecurrencePattern
} from '@/types/task';

// Mock database of tasks
const taskTemplates: TaskTemplate[] = [];
const taskInstances: TaskInstance[] = [];
const recurringTasks: RecurringTask[] = [];

// Add a new updateRecurringTask function
export async function updateRecurringTask(
  taskId: string, 
  updates: Partial<Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<RecurringTask | null> {
  try {
    // Find the task to update
    const taskIndex = recurringTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      console.error(`Recurring task with ID ${taskId} not found`);
      return null;
    }

    // Update the task
    const updatedTask = {
      ...recurringTasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    // Replace the task in the array
    recurringTasks[taskIndex] = updatedTask;
    
    console.log(`Updated recurring task ${taskId}:`, updatedTask);
    return updatedTask;
  } catch (error) {
    console.error("Error updating recurring task:", error);
    return null;
  }
}

// Get all task templates
export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    // Mock data for task templates
    const templates: TaskTemplate[] = [
      {
        id: '1',
        name: 'Monthly Bookkeeping',
        description: 'Reconcile accounts and prepare financial statements',
        defaultEstimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        defaultPriority: 'Medium',
        category: 'Bookkeeping',
        version: 1,
        isArchived: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '2',
        name: 'Quarterly Tax Filing',
        description: 'Prepare and submit quarterly tax returns',
        defaultEstimatedHours: 5,
        requiredSkills: ['Tax'],
        defaultPriority: 'High',
        category: 'Tax',
        version: 1,
        isArchived: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '3',
        name: 'Annual Tax Return',
        description: 'Prepare and submit annual tax returns',
        defaultEstimatedHours: 10,
        requiredSkills: ['Tax', 'Advisory'],
        defaultPriority: 'High',
        category: 'Tax',
        version: 1,
        isArchived: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ];
    
    return templates;
  } catch (error) {
    console.error('Error fetching task templates:', error);
    return [];
  }
};

// Get task template by ID
export const getTaskTemplate = async (id: string): Promise<TaskTemplate | null> => {
  try {
    const templates = await getTaskTemplates();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Error fetching task template:', error);
    return null;
  }
};

// Create task template
export const createTaskTemplate = async (template: Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "version">): Promise<TaskTemplate | null> => {
  try {
    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      ...template,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, this would save to the database
    console.log('Created task template:', newTemplate);
    return newTemplate;
  } catch (error) {
    console.error('Error creating task template:', error);
    return null;
  }
};

// Update task template
export const updateTaskTemplate = async (id: string, updates: Partial<Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "version">>): Promise<TaskTemplate | null> => {
  try {
    const template = await getTaskTemplate(id);
    if (!template) return null;
    
    const updatedTemplate: TaskTemplate = {
      ...template,
      ...updates,
      version: template.version + 1,
      updatedAt: new Date()
    };
    
    // In a real app, this would update the database
    console.log('Updated task template:', updatedTemplate);
    return updatedTemplate;
  } catch (error) {
    console.error('Error updating task template:', error);
    return null;
  }
};

// Archive task template
export const archiveTaskTemplate = async (id: string): Promise<boolean> => {
  try {
    const template = await getTaskTemplate(id);
    if (!template) return false;
    
    const updatedTemplate: TaskTemplate = {
      ...template,
      isArchived: true,
      updatedAt: new Date()
    };
    
    // In a real app, this would update the database
    console.log('Archived task template:', updatedTemplate);
    return true;
  } catch (error) {
    console.error('Error archiving task template:', error);
    return false;
  }
};

// Get recurring tasks
export const getRecurringTasks = async (includeInactive: boolean = false): Promise<RecurringTask[]> => {
  try {
    // Mock data for recurring tasks
    const tasks: RecurringTask[] = [
      {
        id: '1',
        templateId: '1',
        clientId: 'client1',
        name: 'Monthly Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Unscheduled',
        dueDate: new Date('2023-06-15'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Monthly',
          dayOfMonth: 15
        },
        lastGeneratedDate: null,
        isActive: true
      },
      {
        id: '2',
        templateId: '2',
        clientId: 'client1',
        name: 'Quarterly Tax Filing - ABC Corp',
        description: 'Prepare and submit quarterly tax returns',
        estimatedHours: 5,
        requiredSkills: ['Tax'],
        priority: 'High',
        category: 'Tax',
        status: 'Unscheduled',
        dueDate: new Date('2023-07-15'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Quarterly',
          dayOfMonth: 15
        },
        lastGeneratedDate: null,
        isActive: true
      },
      {
        id: '3',
        templateId: '1',
        clientId: 'client2',
        name: 'Monthly Bookkeeping - XYZ Inc',
        description: 'Reconcile accounts and prepare monthly financial statements',
        estimatedHours: 4,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Unscheduled',
        dueDate: new Date('2023-06-20'),
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15'),
        recurrencePattern: {
          type: 'Monthly',
          dayOfMonth: 20
        },
        lastGeneratedDate: null,
        isActive: false
      }
    ];
    
    return includeInactive ? tasks : tasks.filter(t => t.isActive);
  } catch (error) {
    console.error('Error fetching recurring tasks:', error);
    return [];
  }
};

// Create recurring task
export async function createRecurringTask(params: RecurringTaskCreateParams): Promise<RecurringTask> {
  // Mock implementation
  const newTask: RecurringTask = {
    id: uuidv4(),
    templateId: params.templateId,
    clientId: params.clientId,
    name: params.name,
    description: params.description || '',
    requiredSkills: params.requiredSkills,
    estimatedHours: params.estimatedHours,
    priority: params.priority,
    category: params.category,
    dueDate: params.dueDate,
    status: params.status || 'Unscheduled',
    recurrencePattern: params.recurrencePattern,
    lastGeneratedDate: null,
    isActive: true, // Adding the missing isActive field
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  recurringTasks.push(newTask);
  return newTask;
}

// Deactivate recurring task
export const deactivateRecurringTask = async (id: string): Promise<boolean> => {
  try {
    // In a real app, this would update the database
    console.log('Deactivated recurring task:', id);
    return true;
  } catch (error) {
    console.error('Error deactivating recurring task:', error);
    return false;
  }
};

// Get task instances
export const getTaskInstances = async (filter: { clientId?: string, status?: TaskStatus }): Promise<TaskInstance[]> => {
  try {
    // Mock data for task instances
    const tasks: TaskInstance[] = [
      {
        id: '1',
        templateId: '1',
        clientId: 'client1',
        name: 'May Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements for May',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Completed',
        dueDate: new Date('2023-05-15'),
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date('2023-05-16'),
        completedAt: new Date('2023-05-14'),
        recurringTaskId: '1'
      },
      {
        id: '2',
        templateId: '1',
        clientId: 'client1',
        name: 'June Bookkeeping - ABC Corp',
        description: 'Reconcile accounts and prepare monthly financial statements for June',
        estimatedHours: 3,
        requiredSkills: ['Bookkeeping'],
        priority: 'Medium',
        category: 'Bookkeeping',
        status: 'Scheduled',
        dueDate: new Date('2023-06-15'),
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
        recurringTaskId: '1',
        assignedStaffId: 'staff1',
        scheduledStartTime: new Date('2023-06-14T10:00:00'),
        scheduledEndTime: new Date('2023-06-14T13:00:00')
      },
      {
        id: '3',
        templateId: '2',
        clientId: 'client1',
        name: 'Q2 Tax Filing - ABC Corp',
        description: 'Prepare and submit Q2 tax returns',
        estimatedHours: 5,
        requiredSkills: ['Tax'],
        priority: 'High',
        category: 'Tax',
        status: 'Unscheduled',
        dueDate: new Date('2023-07-15'),
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2023-06-15'),
        recurringTaskId: '2'
      },
      {
        id: '4',
        templateId: '3',
        clientId: 'client1',
        name: 'Special Advisory Project',
        description: 'One-time strategic advisory session',
        estimatedHours: 10,
        requiredSkills: ['Advisory'],
        priority: 'Medium',
        category: 'Advisory',
        status: 'Scheduled',
        dueDate: new Date('2023-06-20'),
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-02'),
        assignedStaffId: 'staff2',
        scheduledStartTime: new Date('2023-06-19T09:00:00'),
        scheduledEndTime: new Date('2023-06-19T19:00:00')
      }
    ];
    
    return tasks.filter(t => {
      if (filter.clientId && t.clientId !== filter.clientId) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching task instances:', error);
    return [];
  }
};

// Create ad-hoc task
export async function createAdHocTask(params: AdHocTaskCreateParams): Promise<TaskInstance> {
  // Mock implementation
  const newTask: TaskInstance = {
    id: uuidv4(),
    templateId: params.templateId,
    clientId: params.clientId,
    name: params.name,
    description: params.description || '',
    requiredSkills: params.requiredSkills,
    estimatedHours: params.estimatedHours,
    priority: params.priority,
    category: params.category,
    dueDate: params.dueDate,
    status: params.status || 'Unscheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  taskInstances.push(newTask);
  return newTask;
}

// Generate task instances from recurring tasks
export async function generateTaskInstances(recurringTaskIds: string[]): Promise<TaskInstance[]> {
  // Mock implementation
  const generatedTasks: TaskInstance[] = [];
  
  for (const taskId of recurringTaskIds) {
    const recurringTask = recurringTasks.find(rt => rt.id === taskId);
    if (recurringTask && recurringTask.isActive) {
      // Generate an instance
      const instance: TaskInstance = {
        id: uuidv4(),
        templateId: recurringTask.templateId,
        clientId: recurringTask.clientId,
        recurringTaskId: recurringTask.id,
        name: recurringTask.name,
        description: recurringTask.description,
        requiredSkills: recurringTask.requiredSkills,
        estimatedHours: recurringTask.estimatedHours,
        priority: recurringTask.priority,
        category: recurringTask.category,
        dueDate: new Date(recurringTask.dueDate || new Date()),
        status: 'Unscheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      taskInstances.push(instance);
      generatedTasks.push(instance);
      
      // Update last generated date
      recurringTask.lastGeneratedDate = new Date();
    }
  }
  
  return generatedTasks;
}

// Get unscheduled task instances
export async function getUnscheduledTaskInstances(): Promise<TaskInstance[]> {
  // Mock implementation
  return taskInstances.filter(task => task.status === 'Unscheduled');
}
