interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
}

/**
 * Detail Matrix Utilities - Step 4
 * 
 * Pure utility functions for data transformation, sorting, and calculations.
 * No hooks or state - purely functional helpers.
 */

/**
 * Sort tasks by the specified field and direction
 */
export const sortTasks = (
  tasks: Task[], 
  field: keyof Task, 
  direction: 'asc' | 'desc'
): Task[] => {
  return [...tasks].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Group tasks by skill
 */
export const groupTasksBySkill = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((acc, task) => {
    const skill = task.skillRequired;
    if (!acc[skill]) {
      acc[skill] = [];
    }
    acc[skill].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
};

/**
 * Group tasks by client
 */
export const groupTasksByClient = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((acc, task) => {
    const client = task.clientName;
    if (!acc[client]) {
      acc[client] = [];
    }
    acc[client].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
};

/**
 * Calculate total hours for a set of tasks
 */
export const calculateTotalHours = (tasks: Task[]): number => {
  return tasks.reduce((sum, task) => sum + task.monthlyHours, 0);
};

/**
 * Get unique values from tasks for a specific field
 */
export const getUniqueValues = (tasks: Task[], field: keyof Task): string[] => {
  const values = tasks.map(task => String(task[field]));
  return Array.from(new Set(values)).sort();
};

/**
 * Calculate summary statistics for tasks
 */
export const calculateTaskSummary = (tasks: Task[]) => {
  const totalHours = calculateTotalHours(tasks);
  const uniqueClients = getUniqueValues(tasks, 'clientName').length;
  const uniqueSkills = getUniqueValues(tasks, 'skillRequired').length;
  const uniqueMonths = getUniqueValues(tasks, 'monthLabel').length;
  
  return {
    totalTasks: tasks.length,
    totalHours,
    uniqueClients,
    uniqueSkills,
    uniqueMonths
  };
};

/**
 * Filter tasks by search term across multiple fields
 */
export const searchTasks = (tasks: Task[], searchTerm: string): Task[] => {
  if (!searchTerm) return tasks;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task.taskName.toLowerCase().includes(lowerSearchTerm) ||
    task.clientName.toLowerCase().includes(lowerSearchTerm) ||
    task.skillRequired.toLowerCase().includes(lowerSearchTerm) ||
    task.category.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Create task groups with summary statistics
 */
export const createTaskGroupsWithStats = (
  tasks: Task[],
  groupingMode: 'skill' | 'client'
): Array<{
  groupName: string;
  tasks: Task[];
  totalHours: number;
  taskCount: number;
}> => {
  const grouped = groupingMode === 'skill' 
    ? groupTasksBySkill(tasks)
    : groupTasksByClient(tasks);
    
  return Object.entries(grouped).map(([groupName, groupTasks]) => ({
    groupName,
    tasks: groupTasks,
    totalHours: calculateTotalHours(groupTasks),
    taskCount: groupTasks.length
  }));
};