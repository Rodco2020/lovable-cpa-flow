
import { RecurringTask } from '@/types/task';
import { FormattedTask } from '../types';
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
 * TaskMetrics Interface
 * Represents comprehensive task metrics
 */
export interface TaskMetrics {
  totalTasks: number;
  totalEstimatedHours: number;
  averageHoursPerTask: number;
  requiredHoursBySkill: { skill: string; hours: number }[];
  taskDistributionByClient: { clientName: string; taskCount: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recurringVsAdHoc: { recurring: number; adHoc: number };
}

/**
 * Enhanced Task Metrics Service
 * Provides comprehensive task analytics with skill resolution
 */
export class EnhancedTaskMetricsService {
  /**
   * Calculate comprehensive task metrics
   */
  static calculateTaskMetrics(tasks: FormattedTask[]): TaskMetrics {
    if (!tasks || tasks.length === 0) {
      return {
        totalTasks: 0,
        totalEstimatedHours: 0,
        averageHoursPerTask: 0,
        requiredHoursBySkill: [],
        taskDistributionByClient: [],
        tasksByPriority: [],
        recurringVsAdHoc: { recurring: 0, adHoc: 0 }
      };
    }

    // Calculate basic metrics
    const totalTasks = tasks.length;
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const averageHoursPerTask = totalEstimatedHours / totalTasks;

    // Calculate skill hours aggregation
    const skillHoursMap = new Map<string, number>();
    tasks.forEach(task => {
      task.requiredSkills.forEach(skill => {
        skillHoursMap.set(skill, (skillHoursMap.get(skill) || 0) + task.estimatedHours);
      });
    });

    const requiredHoursBySkill = Array.from(skillHoursMap.entries())
      .map(([skill, hours]) => ({ skill, hours }))
      .sort((a, b) => b.hours - a.hours);

    // Calculate client distribution
    const clientTasksMap = new Map<string, number>();
    tasks.forEach(task => {
      clientTasksMap.set(task.clientName, (clientTasksMap.get(task.clientName) || 0) + 1);
    });

    const taskDistributionByClient = Array.from(clientTasksMap.entries())
      .map(([clientName, taskCount]) => ({ clientName, taskCount }))
      .sort((a, b) => b.taskCount - a.taskCount);

    // Calculate priority distribution
    const priorityMap = new Map<string, number>();
    tasks.forEach(task => {
      priorityMap.set(task.priority, (priorityMap.get(task.priority) || 0) + 1);
    });

    const tasksByPriority = Array.from(priorityMap.entries())
      .map(([priority, count]) => ({ priority, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate recurring vs ad-hoc
    const recurringCount = tasks.filter(task => task.taskType === 'Recurring').length;
    const adHocCount = tasks.filter(task => task.taskType === 'Ad-hoc').length;

    return {
      totalTasks,
      totalEstimatedHours,
      averageHoursPerTask,
      requiredHoursBySkill,
      taskDistributionByClient,
      tasksByPriority,
      recurringVsAdHoc: { recurring: recurringCount, adHoc: adHocCount }
    };
  }

  /**
   * Debug skill processing for troubleshooting
   */
  static debugSkillProcessing(tasks: FormattedTask[]): void {
    console.log('=== Skill Processing Debug ===');
    console.log(`Total tasks: ${tasks.length}`);
    
    const allSkills = tasks.flatMap(task => task.requiredSkills);
    console.log(`Total skill references: ${allSkills.length}`);
    
    const uniqueSkills = [...new Set(allSkills)];
    console.log(`Unique skills: ${uniqueSkills.length}`, uniqueSkills);
    
    tasks.slice(0, 3).forEach((task, index) => {
      console.log(`Task ${index + 1}: "${task.name}" - Skills:`, task.requiredSkills);
    });
  }

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
    // Since RecurringTask doesn't have completionStatus, we'll assume all active tasks are in progress
    const activeTasks = tasks.filter(task => task.isActive);
    return (activeTasks.length / tasks.length) * 100;
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
    // Since RecurringTask doesn't have completionStatus, we'll categorize based on isActive
    const completed: RecurringTask[] = [];
    const inProgress = tasks.filter(task => task.isActive);
    const notStarted = tasks.filter(task => !task.isActive);
    const blocked: RecurringTask[] = [];

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
