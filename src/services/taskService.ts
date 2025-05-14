
import { v4 as uuidv4 } from 'uuid';
import { 
  TaskTemplate, 
  RecurringTask, 
  TaskInstance, 
  TaskStatus, 
  RecurrencePattern 
} from '@/types/task';

// Mock data storage
let taskTemplates: TaskTemplate[] = [];
let recurringTasks: RecurringTask[] = [];
let taskInstances: TaskInstance[] = [];

// Task Template CRUD operations
export const getTaskTemplates = (includeArchived: boolean = false): TaskTemplate[] => {
  return includeArchived ? taskTemplates : taskTemplates.filter(t => !t.isArchived);
};

export const getTaskTemplateById = (id: string): TaskTemplate | undefined => {
  return taskTemplates.find(t => t.id === id);
};

export const createTaskTemplate = (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'version'>): TaskTemplate => {
  const newTemplate: TaskTemplate = {
    ...template,
    id: uuidv4(),
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  };
  taskTemplates.push(newTemplate);
  return newTemplate;
};

export const updateTaskTemplate = (id: string, updates: Partial<Omit<TaskTemplate, 'id' | 'createdAt' | 'version'>>): TaskTemplate | null => {
  const index = taskTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  // Create a new version
  const currentTemplate = taskTemplates[index];
  const updatedTemplate: TaskTemplate = {
    ...currentTemplate,
    ...updates,
    updatedAt: new Date(),
    version: currentTemplate.version + 1
  };
  
  taskTemplates[index] = updatedTemplate;
  return updatedTemplate;
};

export const archiveTaskTemplate = (id: string): boolean => {
  const index = taskTemplates.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  taskTemplates[index] = {
    ...taskTemplates[index],
    isArchived: true,
    updatedAt: new Date()
  };
  return true;
};

// Recurring Task operations
export const getRecurringTasks = (activeOnly: boolean = true): RecurringTask[] => {
  return activeOnly ? recurringTasks.filter(t => t.isActive) : recurringTasks;
};

export const createRecurringTask = (task: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive' | 'status'>): RecurringTask => {
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
export const initializeTaskData = () => {
  // Create sample task templates
  const templateIds = [
    createTaskTemplate({
      name: "Monthly Bookkeeping",
      description: "Reconcile accounts and prepare monthly financial statements",
      defaultEstimatedHours: 3,
      requiredSkills: ["Junior", "Bookkeeping"],
      defaultPriority: "Medium",
      category: "Bookkeeping"
    }).id,
    createTaskTemplate({
      name: "Quarterly Tax Filing",
      description: "Prepare and submit quarterly tax returns",
      defaultEstimatedHours: 5,
      requiredSkills: ["Senior", "Tax Specialist"],
      defaultPriority: "High",
      category: "Tax"
    }).id,
    createTaskTemplate({
      name: "Annual Audit",
      description: "Complete annual audit procedures",
      defaultEstimatedHours: 40,
      requiredSkills: ["CPA", "Audit"],
      defaultPriority: "High",
      category: "Audit"
    }).id
  ];
  
  // Create sample recurring tasks
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
};

// Initialize data on module import
initializeTaskData();
