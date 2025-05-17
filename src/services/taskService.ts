
import { v4 as uuidv4 } from 'uuid';
import { 
  TaskTemplate, 
  RecurringTask, 
  RecurringTaskCreateParams,
  TaskInstance, 
  AdHocTaskCreateParams
} from '@/types/task';

// Simulated database of task templates
let taskTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Monthly Bookkeeping',
    description: 'Complete monthly bookkeeping tasks including reconciliation',
    defaultEstimatedHours: 3,
    defaultRequiredSkills: ['Bookkeeping'],
    category: 'Accounting',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Quarterly Tax Filing',
    description: 'Prepare and file quarterly tax returns',
    defaultEstimatedHours: 5,
    defaultRequiredSkills: ['CPA', 'Tax Specialist'],
    category: 'Tax',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Annual Audit',
    description: 'Conduct annual financial audit',
    defaultEstimatedHours: 20,
    defaultRequiredSkills: ['CPA', 'Audit'],
    category: 'Audit',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Financial Statement Preparation',
    description: 'Prepare financial statements for stakeholders',
    defaultEstimatedHours: 8,
    defaultRequiredSkills: ['CPA'],
    category: 'Accounting',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Business Advisory Meeting',
    description: 'Strategic planning and business advisory session',
    defaultEstimatedHours: 2,
    defaultRequiredSkills: ['Advisory'],
    category: 'Advisory',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Simulated database of recurring tasks
let recurringTasks: RecurringTask[] = [];

// Simulated database of task instances
let taskInstances: TaskInstance[] = [];

/**
 * Get all task templates
 * 
 * @returns Promise with array of task templates
 */
export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  // This would be a database query in a real application
  return Promise.resolve(taskTemplates);
};

/**
 * Get a specific task template by ID
 * 
 * @param id Template ID to retrieve
 * @returns Promise with the task template or null if not found
 */
export const getTaskTemplate = async (id: string): Promise<TaskTemplate | null> => {
  const template = taskTemplates.find(t => t.id === id);
  return Promise.resolve(template || null);
};

/**
 * Create a new recurring task
 * 
 * @param taskData Data for the new recurring task
 * @returns Promise with the created recurring task
 */
export const createRecurringTask = async (taskData: RecurringTaskCreateParams): Promise<RecurringTask> => {
  const now = new Date();
  
  // Create a new recurring task
  const newTask: RecurringTask = {
    id: uuidv4(),
    templateId: taskData.templateId,
    clientId: taskData.clientId,
    name: taskData.name,
    description: taskData.description,
    estimatedHours: taskData.estimatedHours,
    requiredSkills: taskData.requiredSkills,
    priority: taskData.priority,
    category: taskData.category,
    dueDate: taskData.dueDate,
    recurrencePattern: taskData.recurrencePattern,
    status: taskData.status || 'Unscheduled', // Set a default if not provided
    lastGeneratedDate: null,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
  
  // Add to our "database"
  recurringTasks.push(newTask);
  
  // Generate the initial task instance
  generateInitialTaskInstance(newTask);
  
  return Promise.resolve(newTask);
};

/**
 * Update an existing recurring task
 * 
 * @param taskId ID of the task to update
 * @param updates Partial data to update on the task
 * @returns Promise with the updated recurring task
 */
export const updateRecurringTask = async (
  taskId: string, 
  updates: Partial<RecurringTask>
): Promise<RecurringTask> => {
  // Find the task in our "database"
  const taskIndex = recurringTasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Recurring task with ID ${taskId} not found`);
  }
  
  // Update the task
  recurringTasks[taskIndex] = {
    ...recurringTasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  return Promise.resolve(recurringTasks[taskIndex]);
};

/**
 * Create a new ad-hoc task instance
 * 
 * @param taskData Data for the new ad-hoc task
 * @returns Promise with the created task instance
 */
export const createAdHocTask = async (taskData: AdHocTaskCreateParams): Promise<TaskInstance> => {
  const now = new Date();
  
  // Create a new task instance
  const newTask: TaskInstance = {
    id: uuidv4(),
    templateId: taskData.templateId,
    clientId: taskData.clientId,
    recurringTaskId: null, // Ad-hoc tasks don't have a recurring parent
    name: taskData.name,
    description: taskData.description,
    estimatedHours: taskData.estimatedHours,
    requiredSkills: taskData.requiredSkills,
    priority: taskData.priority,
    category: taskData.category,
    dueDate: taskData.dueDate,
    status: taskData.status || 'Unscheduled',
    assignedStaffId: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };
  
  // Add to our "database"
  taskInstances.push(newTask);
  
  return Promise.resolve(newTask);
};

/**
 * Helper function to generate the initial task instance from a recurring task
 * 
 * @param recurringTask The recurring task to generate an instance from
 */
function generateInitialTaskInstance(recurringTask: RecurringTask): void {
  const now = new Date();
  
  const taskInstance: TaskInstance = {
    id: uuidv4(),
    templateId: recurringTask.templateId,
    clientId: recurringTask.clientId,
    recurringTaskId: recurringTask.id,
    name: recurringTask.name,
    description: recurringTask.description,
    estimatedHours: recurringTask.estimatedHours,
    requiredSkills: recurringTask.requiredSkills,
    priority: recurringTask.priority,
    category: recurringTask.category,
    dueDate: new Date(recurringTask.dueDate),
    status: 'Unscheduled',
    assignedStaffId: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };
  
  // Add to our "database"
  taskInstances.push(taskInstance);
  
  // Update the last generated date on the recurring task
  recurringTasks = recurringTasks.map(task => {
    if (task.id === recurringTask.id) {
      return {
        ...task,
        lastGeneratedDate: now
      };
    }
    return task;
  });
}

/**
 * Get all task instances
 * 
 * @returns Promise with array of all task instances
 */
export const getTaskInstances = async (): Promise<TaskInstance[]> => {
  return Promise.resolve(taskInstances);
};

/**
 * Get a specific task instance by ID
 * 
 * @param id Task instance ID to retrieve
 * @returns Promise with the task instance or null if not found
 */
export const getTaskInstance = async (id: string): Promise<TaskInstance | null> => {
  const instance = taskInstances.find(t => t.id === id);
  return Promise.resolve(instance || null);
};

/**
 * Update an existing task instance
 * 
 * @param taskId ID of the task instance to update
 * @param updates Partial data to update on the task instance
 * @returns Promise with the updated task instance
 */
export const updateTaskInstance = async (
  taskId: string, 
  updates: Partial<TaskInstance>
): Promise<TaskInstance> => {
  // Find the task in our "database"
  const taskIndex = taskInstances.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Task instance with ID ${taskId} not found`);
  }
  
  // Update the task
  taskInstances[taskIndex] = {
    ...taskInstances[taskIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  return Promise.resolve(taskInstances[taskIndex]);
};

/**
 * Get all unscheduled task instances
 * 
 * @returns Promise with array of unscheduled task instances
 */
export const getUnscheduledTaskInstances = async (): Promise<TaskInstance[]> => {
  return Promise.resolve(taskInstances.filter(t => t.status === 'Unscheduled'));
};

/**
 * Generate task instances from active recurring tasks that are due
 * 
 * @returns Promise with array of newly generated task instances
 */
export const generateTaskInstances = async (): Promise<TaskInstance[]> => {
  const now = new Date();
  const newInstances: TaskInstance[] = [];
  
  // Find active recurring tasks
  const activeTasks = recurringTasks.filter(task => task.isActive);
  
  for (const task of activeTasks) {
    // Simplified logic - in a real app, you'd need to calculate the next due date
    // based on the recurrence pattern and last generated date
    const shouldGenerate = !task.lastGeneratedDate || 
      task.lastGeneratedDate.getTime() < now.getTime() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (shouldGenerate) {
      const taskInstance: TaskInstance = {
        id: uuidv4(),
        templateId: task.templateId,
        clientId: task.clientId,
        recurringTaskId: task.id,
        name: task.name,
        description: task.description,
        estimatedHours: task.estimatedHours,
        requiredSkills: task.requiredSkills,
        priority: task.priority,
        category: task.category,
        dueDate: new Date(task.dueDate), // In a real app, calculate the next due date
        status: 'Unscheduled',
        assignedStaffId: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now
      };
      
      // Add to our "database"
      taskInstances.push(taskInstance);
      newInstances.push(taskInstance);
      
      // Update the last generated date on the recurring task
      recurringTasks = recurringTasks.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            lastGeneratedDate: now
          };
        }
        return t;
      });
    }
  }
  
  return Promise.resolve(newInstances);
};

export default {
  getTaskTemplates,
  getTaskTemplate,
  createRecurringTask,
  updateRecurringTask,
  createAdHocTask,
  getTaskInstances,
  getTaskInstance,
  updateTaskInstance,
  getUnscheduledTaskInstances,
  generateTaskInstances
};
