
import { v4 as uuidv4 } from 'uuid';
import { 
  TaskInstance, 
  TaskTemplate, 
  RecurringTask, 
  TaskStatus, 
  TaskCategory, 
  TaskPriority,
  RecurrenceType,
  RecurrencePattern,
  SkillType
} from '@/types/task';

export interface RecurringTaskCreateParams {
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: Date;
  recurrencePattern: RecurrencePattern;
  status?: TaskStatus;
  isActive: boolean;
}

export interface AdHocTaskCreateParams {
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: SkillType[];
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: Date;
  status?: TaskStatus;
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
export const createRecurringTask = async (taskData: RecurringTaskCreateParams): Promise<RecurringTask | null> => {
  try {
    const newTask: RecurringTask = {
      id: uuidv4(),
      ...taskData,
      status: taskData.status || 'Unscheduled',
      lastGeneratedDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, this would save to the database
    console.log('Created recurring task:', newTask);
    return newTask;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    return null;
  }
};

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
export const createAdHocTask = async (taskData: AdHocTaskCreateParams): Promise<TaskInstance | null> => {
  try {
    const newTask: TaskInstance = {
      id: uuidv4(),
      ...taskData,
      status: taskData.status || 'Unscheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, this would save to the database
    console.log('Created ad-hoc task:', newTask);
    return newTask;
  } catch (error) {
    console.error('Error creating ad-hoc task:', error);
    return null;
  }
};

// Generate task instances from recurring tasks
export const generateTaskInstances = async (): Promise<{ generated: number, errors: number }> => {
  try {
    // In a real app, this would generate task instances from recurring tasks
    // based on recurrence patterns and due dates
    console.log('Generating task instances from recurring tasks');
    return { generated: 3, errors: 0 };
  } catch (error) {
    console.error('Error generating task instances:', error);
    return { generated: 0, errors: 1 };
  }
};

// Get unscheduled task instances
export const getUnscheduledTaskInstances = async (): Promise<TaskInstance[]> => {
  try {
    return getTaskInstances({ status: 'Unscheduled' });
  } catch (error) {
    console.error('Error fetching unscheduled task instances:', error);
    return [];
  }
};
