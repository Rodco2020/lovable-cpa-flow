
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { debugLog } from '../../logger';
import { SkillResolutionService } from '../skillResolutionService';

/**
 * Data Point Generation Service
 * 
 * Handles the generation of matrix data points from recurring tasks
 * with proper skill resolution and demand calculation.
 */
export class DataPointGenerationService {
  /**
   * Generate matrix data points from recurring tasks
   */
  static async generateDataPoints(
    tasks: RecurringTaskDB[],
    startDate: Date,
    endDate: Date
  ): Promise<DemandDataPoint[]> {
    debugLog('Generating data points', { 
      tasksCount: tasks.length, 
      dateRange: { startDate, endDate } 
    });

    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const dataPoints: DemandDataPoint[] = [];

    for (const monthStart of months) {
      const monthEnd = endOfMonth(monthStart);
      const monthKey = format(monthStart, 'yyyy-MM');
      const monthLabel = format(monthStart, 'MMM yyyy');

      // Group tasks by resolved skill type
      const skillGroups = new Map<string, ClientTaskDemand[]>();

      for (const task of tasks) {
        // Resolve skill type using the skill resolution service
        const resolvedSkill = await SkillResolutionService.resolveSkillType(task.required_skill);
        
        // Calculate monthly occurrences
        const monthlyOccurrences = this.calculateTaskOccurrences(
          task.recurrence_pattern,
          monthStart,
          monthEnd
        );

        if (monthlyOccurrences > 0) {
          const monthlyHours = (task.default_estimated_hours || 0) * monthlyOccurrences;

          const taskDemand: ClientTaskDemand = {
            clientTaskDemandId: `${task.id}-${monthKey}`,
            clientId: task.client_id,
            clientName: task.client_name || 'Unknown Client',
            recurringTaskId: task.id,
            taskName: task.task_name,
            skillType: resolvedSkill,
            estimatedHours: task.default_estimated_hours || 0,
            monthlyHours,
            recurrencePattern: task.recurrence_pattern || 'monthly', // Keep as string
            preferredStaff: task.preferred_staff_id ? {
              staffId: task.preferred_staff_id,
              full_name: task.preferred_staff_name || task.preferred_staff_id
            } : null
          };

          if (!skillGroups.has(resolvedSkill)) {
            skillGroups.set(resolvedSkill, []);
          }
          skillGroups.get(resolvedSkill)!.push(taskDemand);
        }
      }

      // Create data points for each skill group
      skillGroups.forEach((taskBreakdown, skillType) => {
        const demandHours = taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
        const uniqueClients = new Set(taskBreakdown.map(task => task.clientId));

        dataPoints.push({
          month: monthKey,
          monthLabel,
          skillType,
          demandHours,
          taskCount: taskBreakdown.length,
          clientCount: uniqueClients.size,
          taskBreakdown
        });
      });
    }

    debugLog(`Generated ${dataPoints.length} data points across ${months.length} months`);
    return dataPoints;
  }

  /**
   * Calculate task occurrences within a month based on recurrence pattern
   */
  private static calculateTaskOccurrences(
    recurrencePattern: string | null,
    monthStart: Date,
    monthEnd: Date
  ): number {
    if (!recurrencePattern) return 1;

    const pattern = recurrencePattern.toLowerCase();
    
    if (pattern.includes('daily')) {
      const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      return daysInMonth;
    }
    
    if (pattern.includes('weekly')) {
      return 4; // Approximate weeks per month
    }
    
    if (pattern.includes('monthly')) {
      return 1;
    }
    
    if (pattern.includes('quarterly')) {
      return 1/3; // Once every 3 months
    }
    
    if (pattern.includes('annually') || pattern.includes('yearly')) {
      return 1/12; // Once every 12 months
    }

    return 1; // Default
  }
}
