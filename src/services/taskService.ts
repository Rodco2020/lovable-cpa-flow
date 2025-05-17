
import { TaskTemplate, RecurringTask, TaskInstance, SkillType, TaskPriority, TaskCategory } from '@/types/task';

/**
 * Fetches all task templates from local storage.
 * @returns Promise resolving to an array of task templates.
 */
export async function getTaskTemplates(): Promise<TaskTemplate[]> {
  const templates = localStorage.getItem('taskTemplates');
  return templates ? JSON.parse(templates) : [];
}

/**
 * Fetches a single task template by its ID.
 * @param id The ID of the task template to retrieve.
 * @returns Promise resolving to the task template or null if not found.
 */
export async function getTaskTemplateById(id: string): Promise<TaskTemplate | null> {
  const templates = await getTaskTemplates();
  return templates.find(template => template.id === id) || null;
}

/**
 * Creates a new task template and saves it to local storage.
 * @param templateData The data for the new task template.
 * @returns Promise resolving to the newly created task template.
 */
export async function createTaskTemplate(templateData: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'isArchived'>): Promise<TaskTemplate> {
  const templates = await getTaskTemplates();
  const newTemplate: TaskTemplate = {
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    isArchived: false,
    ...templateData,
  };
  templates.push(newTemplate);
  localStorage.setItem('taskTemplates', JSON.stringify(templates));
  return newTemplate;
}

/**
 * Updates an existing task template in local storage.
 * @param id The ID of the task template to update.
 * @param templateData The updated data for the task template.
 * @returns Promise resolving to the updated task template or null if not found.
 */
export async function updateTaskTemplate(id: string, templateData: Partial<TaskTemplate>): Promise<TaskTemplate | null> {
  const templates = await getTaskTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);
  if (templateIndex === -1) {
    return null;
  }
  const updatedTemplate = {
    ...templates[templateIndex],
    ...templateData,
    updatedAt: new Date(),
    version: templates[templateIndex].version + 1,
  };
  templates[templateIndex] = updatedTemplate;
  localStorage.setItem('taskTemplates', JSON.stringify(templates));
  return updatedTemplate;
}

/**
 * Archives a task template by setting its isArchived property to true.
 * @param id The ID of the task template to archive.
 * @returns Promise resolving to true if the task template was successfully archived, false otherwise.
 */
export async function archiveTaskTemplate(id: string): Promise<boolean> {
  const templates = await getTaskTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);
  if (templateIndex === -1) {
    return false;
  }
  templates[templateIndex].isArchived = true;
  templates[templateIndex].updatedAt = new Date();
  templates[templateIndex].version = templates[templateIndex].version + 1;
  localStorage.setItem('taskTemplates', JSON.stringify(templates));
  return true;
}

/**
 * Unarchives a task template by setting its isArchived property to false.
 * @param id The ID of the task template to unarchive.
 * @returns Promise resolving to true if the task template was successfully unarchived, false otherwise.
 */
export async function unarchiveTaskTemplate(id: string): Promise<boolean> {
  const templates = await getTaskTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);
  if (templateIndex === -1) {
    return false;
  }
  templates[templateIndex].isArchived = false;
  templates[templateIndex].updatedAt = new Date();
  templates[templateIndex].version = templates[templateIndex].version + 1;
  localStorage.setItem('taskTemplates', JSON.stringify(templates));
  return true;
}

/**
 * Generates a unique ID for new tasks and templates.
 * @returns A unique string ID.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Fetches all recurring tasks from local storage.
 * @param includeInactive If true, includes inactive tasks in the result.
 * @returns Promise resolving to an array of recurring tasks.
 */
export async function getRecurringTasks(includeInactive: boolean = true): Promise<RecurringTask[]> {
  const tasks = localStorage.getItem('recurringTasks');
  let parsedTasks: RecurringTask[] = tasks ? JSON.parse(tasks) : [];
  
  if (!includeInactive) {
    parsedTasks = parsedTasks.filter(task => task.isActive);
  }
  
  return parsedTasks;
}

/**
 * Fetches a single recurring task by its ID.
 * @param id The ID of the recurring task to retrieve.
 * @returns Promise resolving to the recurring task or null if not found.
 */
export async function getRecurringTaskById(id: string): Promise<RecurringTask | null> {
    const tasks = await getRecurringTasks(true);
    return tasks.find(task => task.id === id) || null;
}

/**
 * Creates a new recurring task and saves it to local storage.
 * @param taskData The data for the new recurring task.
 * @returns Promise resolving to the newly created recurring task.
 */
export async function createRecurringTask(taskData: Omit<RecurringTask, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedDate' | 'isActive'>): Promise<RecurringTask> {
  const tasks = await getRecurringTasks(true);
  const newTask: RecurringTask = {
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    lastGeneratedDate: null,
    isActive: true,
    ...taskData,
  };
  tasks.push(newTask);
  localStorage.setItem('recurringTasks', JSON.stringify(tasks));
  return newTask;
}

/**
 * Updates an existing recurring task
 * @param taskId The ID of the task to update
 * @param taskData The updated task data
 * @returns Promise resolving to the updated task or null if unsuccessful
 */
export async function updateRecurringTask(taskId: string, taskData: Partial<RecurringTask>): Promise<RecurringTask | null> {
  try {
    // In a real application, this would be an API call
    // For this example, simulate API call with local data update
    
    // Get all tasks
    const allTasks = await getRecurringTasks(true);
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`Task with ID ${taskId} not found`);
      return null;
    }
    
    // Update task with new data
    const updatedTask = {
      ...allTasks[taskIndex],
      ...taskData,
      updatedAt: new Date()
    };
    
    // Save updated task in list
    allTasks[taskIndex] = updatedTask;
    
    // Save back to storage
    localStorage.setItem('recurringTasks', JSON.stringify(allTasks));
    
    return updatedTask;
  } catch (error) {
    console.error("Error updating recurring task:", error);
    throw new Error("Failed to update recurring task");
  }
}

/**
 * Deactivates a recurring task by setting its isActive property to false.
 * @param id The ID of the recurring task to deactivate.
 * @returns Promise resolving to true if the task was successfully deactivated, false otherwise.
 */
export async function deactivateRecurringTask(id: string): Promise<boolean> {
  const tasks = await getRecurringTasks(true);
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasks[taskIndex].isActive = false;
  tasks[taskIndex].updatedAt = new Date();
  localStorage.setItem('recurringTasks', JSON.stringify(tasks));
  return true;
}

/**
 * Reactivates a recurring task by setting its isActive property to true.
 * @param id The ID of the recurring task to reactivate.
 * @returns Promise resolving to true if the task was successfully reactivated, false otherwise.
 */
export async function reactivateRecurringTask(id: string): Promise<boolean> {
  const tasks = await getRecurringTasks(true);
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasks[taskIndex].isActive = true;
  tasks[taskIndex].updatedAt = new Date();
  localStorage.setItem('recurringTasks', JSON.stringify(tasks));
  return true;
}

/**
 * Fetches all task instances from local storage.
 * @returns Promise resolving to an array of task instances.
 */
export async function getTaskInstances(): Promise<TaskInstance[]> {
  const tasks = localStorage.getItem('taskInstances');
  return tasks ? JSON.parse(tasks) : [];
}

/**
 * Fetches all unscheduled task instances from local storage.
 * @returns Promise resolving to an array of unscheduled task instances.
 */
export async function getUnscheduledTaskInstances(): Promise<TaskInstance[]> {
  const tasks = await getTaskInstances();
  return tasks.filter(task => task.status === 'Unscheduled');
}

/**
 * Fetches a single task instance by its ID.
 * @param id The ID of the task instance to retrieve.
 * @returns Promise resolving to the task instance or null if not found.
 */
export async function getTaskInstanceById(id: string): Promise<TaskInstance | null> {
  const tasks = await getTaskInstances();
  return tasks.find(task => task.id === id) || null;
}

/**
 * Creates a new ad-hoc task instance and saves it to local storage.
 * @param taskData The data for the new task instance.
 * @returns Promise resolving to the newly created task instance.
 */
export async function createAdHocTask(taskData: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<TaskInstance> {
  const tasks = await getTaskInstances();
  const newTask: TaskInstance = {
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'Unscheduled',
    ...taskData,
  };
  tasks.push(newTask);
  localStorage.setItem('taskInstances', JSON.stringify(tasks));
  return newTask;
}

/**
 * Updates an existing task instance in local storage.
 * @param id The ID of the task instance to update.
 * @param taskData The updated data for the task instance.
 * @returns Promise resolving to the updated task instance or null if not found.
 */
export async function updateTaskInstance(id: string, taskData: Partial<TaskInstance>): Promise<TaskInstance | null> {
  const tasks = await getTaskInstances();
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return null;
  }
  const updatedTask = {
    ...tasks[taskIndex],
    ...taskData,
    updatedAt: new Date(),
  };
  tasks[taskIndex] = updatedTask;
  localStorage.setItem('taskInstances', JSON.stringify(tasks));
  return updatedTask;
}

/**
 * Deletes a task instance from local storage.
 * @param id The ID of the task instance to delete.
 * @returns Promise resolving to true if the task instance was successfully deleted, false otherwise.
 */
export async function deleteTaskInstance(id: string): Promise<boolean> {
  const tasks = await getTaskInstances();
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasks.splice(taskIndex, 1);
  localStorage.setItem('taskInstances', JSON.stringify(tasks));
  return true;
}

/**
 * Generates task instances from recurring tasks based on their recurrence pattern.
 * @returns Promise resolving to number of tasks generated
 */
export async function generateTaskInstances(): Promise<number> {
  // This is a placeholder implementation
  // In a real app, this would analyze recurring tasks and generate instances
  // based on their recurrence patterns
  return 0;
}
