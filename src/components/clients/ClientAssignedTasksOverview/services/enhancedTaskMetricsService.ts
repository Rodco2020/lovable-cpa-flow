
import { FormattedTask } from '../types';
import { normalizeSkills } from '@/services/skillNormalizationService';

/**
 * Enhanced Task Metrics Service with improved skill aggregation
 * 
 * Features:
 * - Proper skill normalization and aggregation
 * - Debugging capabilities for troubleshooting
 * - Data validation and error handling
 * - Consistent skill type mapping
 */
export class EnhancedTaskMetricsService {
  private static DEBUG_MODE = true;

  /**
   * Log debug information when enabled
   */
  private static debugLog(message: string, data?: any) {
    if (this.DEBUG_MODE) {
      console.log(`[Enhanced Task Metrics] ${message}`, data || '');
    }
  }

  /**
   * Calculate comprehensive metrics for a given set of tasks with enhanced skill aggregation
   */
  static calculateTaskMetrics(tasks: FormattedTask[]) {
    this.debugLog(`Calculating metrics for ${tasks.length} tasks`);
    
    const totalTasks = tasks.length;
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    
    return {
      totalTasks,
      totalEstimatedHours,
      averageHoursPerTask: totalTasks > 0 ? totalEstimatedHours / totalTasks : 0,
      estimatedHoursByStaffLiaison: this.calculateHoursByStaffLiaison(tasks),
      requiredHoursBySkill: this.calculateHoursBySkillEnhanced(tasks),
      taskDistributionByClient: this.calculateTaskDistributionByClient(tasks),
      tasksByPriority: this.calculateTasksByPriority(tasks),
      tasksByStatus: this.calculateTasksByStatus(tasks),
      recurringVsAdHoc: this.calculateRecurringVsAdHoc(tasks)
    };
  }

  /**
   * Enhanced skill aggregation with proper normalization
   * This fixes the duplicate skill issue by normalizing and properly aggregating skills
   */
  static calculateHoursBySkillEnhanced(tasks: FormattedTask[]) {
    this.debugLog('Starting enhanced skill aggregation');
    
    // Use a Map to properly aggregate normalized skills
    const normalizedSkillHours = new Map<string, number>();
    
    // Track original skills for debugging
    const originalSkillsDebug: string[] = [];
    
    tasks.forEach((task, taskIndex) => {
      this.debugLog(`Processing task ${taskIndex + 1}: "${task.name}"`, {
        originalSkills: task.requiredSkills,
        estimatedHours: task.estimatedHours
      });
      
      // Track original skills for debugging
      originalSkillsDebug.push(...task.requiredSkills);
      
      // Normalize the skills for this task
      const normalizedSkills = normalizeSkills(task.requiredSkills);
      
      this.debugLog(`Normalized skills for task "${task.name}":`, {
        original: task.requiredSkills,
        normalized: normalizedSkills
      });
      
      // Add hours for each normalized skill
      normalizedSkills.forEach(normalizedSkill => {
        const currentHours = normalizedSkillHours.get(normalizedSkill) || 0;
        const newHours = currentHours + task.estimatedHours;
        
        this.debugLog(`Updating skill "${normalizedSkill}": ${currentHours}h + ${task.estimatedHours}h = ${newHours}h`);
        
        normalizedSkillHours.set(normalizedSkill, newHours);
      });
    });

    // Debug summary
    this.debugLog('Skill aggregation summary:', {
      totalOriginalSkills: originalSkillsDebug.length,
      uniqueOriginalSkills: [...new Set(originalSkillsDebug)],
      normalizedSkillsMap: Object.fromEntries(normalizedSkillHours)
    });

    // Convert to array and sort by hours (descending)
    const result = Array.from(normalizedSkillHours.entries())
      .map(([skill, hours]) => ({ skill, hours }))
      .sort((a, b) => b.hours - a.hours);

    this.debugLog('Final skill aggregation result:', result);

    return result;
  }

  /**
   * Calculate estimated hours grouped by staff liaison
   */
  static calculateHoursByStaffLiaison(tasks: FormattedTask[]) {
    const hoursByStaff = new Map<string, number>();
    
    tasks.forEach(task => {
      const key = task.clientName;
      const currentHours = hoursByStaff.get(key) || 0;
      hoursByStaff.set(key, currentHours + task.estimatedHours);
    });
    
    return Array.from(hoursByStaff.entries())
      .map(([staffName, hours]) => ({ staffName, hours }))
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

  /**
   * Toggle debug mode on/off
   */
  static setDebugMode(enabled: boolean) {
    this.DEBUG_MODE = enabled;
    this.debugLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get debug information about skill processing for a specific set of tasks
   */
  static debugSkillProcessing(tasks: FormattedTask[]) {
    const debugInfo = {
      totalTasks: tasks.length,
      skillProcessingDetails: [] as any[],
      aggregationSummary: {} as any
    };

    tasks.forEach((task, index) => {
      const originalSkills = task.requiredSkills;
      const normalizedSkills = normalizeSkills(originalSkills);
      
      debugInfo.skillProcessingDetails.push({
        taskIndex: index,
        taskName: task.name,
        originalSkills,
        normalizedSkills,
        estimatedHours: task.estimatedHours
      });
    });

    // Calculate final aggregation
    const skillHours = this.calculateHoursBySkillEnhanced(tasks);
    debugInfo.aggregationSummary = {
      uniqueNormalizedSkills: skillHours.length,
      skillBreakdown: skillHours
    };

    return debugInfo;
  }
}
