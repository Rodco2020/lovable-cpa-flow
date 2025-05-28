
import { FormattedTask } from '../types';

/**
 * Utility functions for task data transformation and processing
 */
export class TaskDataUtils {
  /**
   * Sort tasks by due date (ascending, with null dates at the end)
   */
  static sortTasksByDueDate(tasks: FormattedTask[]): FormattedTask[] {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  /**
   * Convert Sets to sorted arrays for filter options
   */
  static generateFilterOptions(skills: Set<string>, priorities: Set<string>) {
    return {
      availableSkills: Array.from(skills).sort(),
      availablePriorities: Array.from(priorities).sort()
    };
  }

  /**
   * Validate that task data is complete and consistent
   */
  static validateTaskData(tasks: FormattedTask[]): boolean {
    return tasks.every(task => {
      return (
        task.id &&
        task.clientId &&
        task.clientName &&
        task.taskName &&
        task.taskType &&
        typeof task.estimatedHours === 'number' &&
        Array.isArray(task.requiredSkills) &&
        task.priority &&
        task.status
      );
    });
  }

  /**
   * Log task data statistics for debugging
   */
  static logTaskStatistics(tasks: FormattedTask[]): void {
    const stats = {
      total: tasks.length,
      recurring: tasks.filter(t => t.taskType === 'Recurring').length,
      adHoc: tasks.filter(t => t.taskType === 'Ad-hoc').length,
      active: tasks.filter(t => t.taskType === 'Recurring' ? t.isActive : t.status !== 'Canceled').length,
      uniqueClients: new Set(tasks.map(t => t.clientId)).size,
      uniqueSkills: new Set(tasks.flatMap(t => t.requiredSkills)).size
    };
    
    console.log('Task data loaded:', stats);
  }
}
