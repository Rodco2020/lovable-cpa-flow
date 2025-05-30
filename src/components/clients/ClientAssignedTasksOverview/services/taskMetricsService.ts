
import { FormattedTask } from '../types';

/**
 * Service for calculating task-based metrics
 * Provides statistical analysis of tasks for dashboard display
 */
export class TaskMetricsService {
  /**
   * Calculate comprehensive metrics for a given set of tasks
   */
  static calculateTaskMetrics(tasks: FormattedTask[]) {
    const totalTasks = tasks.length;
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    
    return {
      totalTasks,
      totalEstimatedHours,
      averageHoursPerTask: totalTasks > 0 ? totalEstimatedHours / totalTasks : 0,
      estimatedHoursByStaffLiaison: this.calculateHoursByStaffLiaison(tasks),
      requiredHoursBySkill: this.calculateHoursBySkill(tasks),
      taskDistributionByClient: this.calculateTaskDistributionByClient(tasks),
      tasksByPriority: this.calculateTasksByPriority(tasks),
      tasksByStatus: this.calculateTasksByStatus(tasks),
      recurringVsAdHoc: this.calculateRecurringVsAdHoc(tasks)
    };
  }

  /**
   * Calculate estimated hours grouped by staff liaison
   */
  static calculateHoursByStaffLiaison(tasks: FormattedTask[]) {
    const hoursByStaff = new Map<string, number>();
    
    tasks.forEach(task => {
      // For now, we'll use client name as a proxy for staff liaison
      // In a real implementation, we'd need client-staff liaison mapping
      const key = task.clientName;
      const currentHours = hoursByStaff.get(key) || 0;
      hoursByStaff.set(key, currentHours + task.estimatedHours);
    });
    
    return Array.from(hoursByStaff.entries())
      .map(([staffName, hours]) => ({ staffName, hours }))
      .sort((a, b) => b.hours - a.hours);
  }

  /**
   * Calculate required hours grouped by skill
   */
  static calculateHoursBySkill(tasks: FormattedTask[]) {
    const hoursBySkill = new Map<string, number>();
    
    tasks.forEach(task => {
      task.requiredSkills.forEach(skill => {
        const currentHours = hoursBySkill.get(skill) || 0;
        hoursBySkill.set(skill, currentHours + task.estimatedHours);
      });
    });
    
    return Array.from(hoursBySkill.entries())
      .map(([skill, hours]) => ({ skill, hours }))
      .sort((a, b) => b.hours - a.hours);
  }

  /**
   * Calculate task distribution by client
   */
  static calculateTaskDistributionByClient(tasks: FormattedTask[]) {
    const tasksByClient = new Map<string, number>();
    const hoursByClient = new Map<string, number>();
    
    tasks.forEach(task => {
      const clientName = task.clientName;
      
      // Count tasks
      const currentTasks = tasksByClient.get(clientName) || 0;
      tasksByClient.set(clientName, currentTasks + 1);
      
      // Sum hours
      const currentHours = hoursByClient.get(clientName) || 0;
      hoursByClient.set(clientName, currentHours + task.estimatedHours);
    });
    
    return Array.from(tasksByClient.entries())
      .map(([clientName, taskCount]) => ({
        clientName,
        taskCount,
        totalHours: hoursByClient.get(clientName) || 0
      }))
      .sort((a, b) => b.taskCount - a.taskCount);
  }

  /**
   * Calculate task distribution by priority
   */
  static calculateTasksByPriority(tasks: FormattedTask[]) {
    const priorityCount = new Map<string, number>();
    
    tasks.forEach(task => {
      const currentCount = priorityCount.get(task.priority) || 0;
      priorityCount.set(task.priority, currentCount + 1);
    });
    
    return Array.from(priorityCount.entries())
      .map(([priority, count]) => ({ priority, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate task distribution by status
   */
  static calculateTasksByStatus(tasks: FormattedTask[]) {
    const statusCount = new Map<string, number>();
    
    tasks.forEach(task => {
      const status = task.status || 'Unknown';
      const currentCount = statusCount.get(status) || 0;
      statusCount.set(status, currentCount + 1);
    });
    
    return Array.from(statusCount.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate recurring vs ad-hoc task distribution
   */
  static calculateRecurringVsAdHoc(tasks: FormattedTask[]) {
    const distribution = {
      recurring: 0,
      adHoc: 0,
      recurringHours: 0,
      adHocHours: 0
    };
    
    tasks.forEach(task => {
      if (task.taskType === 'Recurring') {
        distribution.recurring += 1;
        distribution.recurringHours += task.estimatedHours;
      } else {
        distribution.adHoc += 1;
        distribution.adHocHours += task.estimatedHours;
      }
    });
    
    return distribution;
  }
}
