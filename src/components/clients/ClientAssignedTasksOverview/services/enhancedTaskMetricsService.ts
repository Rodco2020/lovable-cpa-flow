import { RecurringTask } from '@/types/task';
import { resolveSkillNames } from '@/services/bulkOperations/skillResolver';

/**
 * SkillBreakdown Interface
 * Represents the breakdown of skills across tasks
 */
export interface SkillBreakdown {
  skill: string;
  count: number;
  percentage: number;
}

/**
 * TaskCompletionStatus Enum
 * Represents the completion status of a task
 */
export enum TaskCompletionStatus {
  COMPLETED = 'Completed',
  IN_PROGRESS = 'In Progress',
  NOT_STARTED = 'Not Started',
  BLOCKED = 'Blocked',
}

/**
 * Enhanced Task Metrics Service
 * Provides comprehensive task analytics with skill resolution
 */
export class EnhancedTaskMetricsService {
  /**
   * Calculate average task hours
   */
  static getAverageTaskHours(tasks: RecurringTask[]): number {
    if (!tasks || tasks.length === 0) return 0;
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    return totalHours / tasks.length;
  }

  /**
   * Get task completion rate
   */
  static getTaskCompletionRate(tasks: RecurringTask[]): number {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completionStatus === TaskCompletionStatus.COMPLETED);
    return (completedTasks.length / tasks.length) * 100;
  }

  /**
   * Get skill distribution across tasks with proper resolution
   */
  static async getSkillDistribution(tasks: RecurringTask[]): Promise<SkillBreakdown[]> {
    const skillCounts = new Map<string, number>();
    
    // Process tasks in parallel for better performance
    const skillPromises = tasks.map(async (task) => {
      try {
        const resolvedSkills = await resolveSkillNames(task.requiredSkills);
        return resolvedSkills;
      } catch (error) {
        console.warn(`Failed to resolve skills for task ${task.id}:`, error);
        return task.requiredSkills; // Fallback to original skills
      }
    });
    
    const allResolvedSkills = await Promise.all(skillPromises);
    
    // Count occurrences of each skill
    allResolvedSkills.forEach(resolvedSkills => {
      resolvedSkills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });
    
    // Convert to breakdown format
    return Array.from(skillCounts.entries()).map(([skill, count]) => ({
      skill,
      count,
      percentage: (count / tasks.length) * 100
    }));
  }

  /**
   * Get tasks by completion status
   */
  static getTasksByCompletionStatus(tasks: RecurringTask[]): {
    completed: RecurringTask[];
    inProgress: RecurringTask[];
    notStarted: RecurringTask[];
    blocked: RecurringTask[];
  } {
    const completed = tasks.filter(task => task.completionStatus === TaskCompletionStatus.COMPLETED);
    const inProgress = tasks.filter(task => task.completionStatus === TaskCompletionStatus.IN_PROGRESS);
    const notStarted = tasks.filter(task => task.completionStatus === TaskCompletionStatus.NOT_STARTED);
    const blocked = tasks.filter(task => task.completionStatus === TaskCompletionStatus.BLOCKED);

    return { completed, inProgress, notStarted, blocked };
  }

  /**
   * Get overdue tasks
   */
  static getOverdueTasks(tasks: RecurringTask[]): RecurringTask[] {
    return tasks.filter(task => task.dueDate && new Date(task.dueDate) < new Date());
  }

  /**
   * Get tasks due this week
   */
  static getTasksDueThisWeek(tasks: RecurringTask[]): RecurringTask[] {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() + 6));

    return tasks.filter(task => task.dueDate && new Date(task.dueDate) >= startOfWeek && new Date(task.dueDate) <= endOfWeek);
  }
}
