
import { DemandDataPoint, ClientTaskDemand, RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { debugLog } from '../../logger';

/**
 * Consistent Demand Calculation Service
 * 
 * Provides unified demand calculation logic ensuring consistency across
 * all matrix transformation operations.
 */
export class ConsistentDemandCalculation {
  /**
   * Calculate monthly demand from recurring tasks with proper recurrence handling
   */
  static calculateMonthlyDemand(
    tasks: RecurringTaskDB[],
    startDate: Date,
    endDate: Date
  ): DemandDataPoint[] {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const demandPoints: DemandDataPoint[] = [];

    months.forEach(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthKey = format(monthStart, 'yyyy-MM');
      const monthLabel = format(monthStart, 'MMM yyyy');

      // Group tasks by skill type for this month
      const skillGroups = new Map<string, ClientTaskDemand[]>();

      tasks.forEach(task => {
        // Fix: Use correct property names from RecurringTaskDB
        const skillType = task.required_skills || 'General';
        
        // Calculate occurrences for this month
        const monthlyOccurrences = this.calculateMonthlyOccurrences(
          task.recurrence_type,
          monthStart,
          monthEnd
        );

        if (monthlyOccurrences > 0) {
          const monthlyHours = (task.estimated_hours || 0) * monthlyOccurrences;

          const demandItem: ClientTaskDemand = {
            clientTaskDemandId: `${task.id}-${monthKey}`,
            taskName: task.name,
            clientId: task.client_id,
            clientName: 'Unknown Client', // This would need to be fetched separately
            monthlyHours,
            skillType,
            estimatedHours: task.estimated_hours || 0,
            recurrencePattern: task.recurrence_type || 'monthly',
            recurringTaskId: task.id,
            preferredStaff: task.preferred_staff_id ? {
              staffId: task.preferred_staff_id,
              full_name: task.preferred_staff_id // This would need staff lookup
            } : null
          };

          if (!skillGroups.has(skillType)) {
            skillGroups.set(skillType, []);
          }
          skillGroups.get(skillType)!.push(demandItem);
        }
      });

      // Create demand points for each skill type
      skillGroups.forEach((taskBreakdown, skillType) => {
        const demandHours = taskBreakdown.reduce((sum, item) => sum + item.monthlyHours, 0);
        const uniqueClients = new Set(taskBreakdown.map(item => item.clientId));

        demandPoints.push({
          month: monthKey,
          monthLabel,
          skillType,
          demandHours,
          taskCount: taskBreakdown.length,
          clientCount: uniqueClients.size,
          taskBreakdown
        });
      });
    });

    debugLog(`Generated ${demandPoints.length} demand points`);
    return demandPoints;
  }

  /**
   * Calculate how many times a task occurs in a given month
   */
  private static calculateMonthlyOccurrences(
    recurrenceType: string | null,
    monthStart: Date,
    monthEnd: Date
  ): number {
    if (!recurrenceType) return 1; // Default to once per month

    try {
      // Parse recurrence pattern
      const pattern = this.parseRecurrencePattern(recurrenceType);
      
      switch (pattern.type.toLowerCase()) {
        case 'daily':
          // For daily tasks, calculate based on interval
          const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
          return Math.floor(daysInMonth / (pattern.interval || 1));
          
        case 'weekly':
          // For weekly tasks
          return Math.floor(4 / (pattern.interval || 1)); // Approximate 4 weeks per month
          
        case 'monthly':
          return pattern.interval === 1 ? 1 : (pattern.interval === 2 ? 0.5 : 1 / (pattern.interval || 1));
          
        case 'quarterly':
          return 1 / 3; // Once every 3 months
          
        case 'annually':
          return 1 / 12; // Once every 12 months
          
        default:
          return 1;
      }
    } catch (error) {
      debugLog('Error parsing recurrence pattern, defaulting to monthly', { recurrenceType, error });
      return 1;
    }
  }

  /**
   * Parse recurrence pattern string into structured data
   */
  private static parseRecurrencePattern(pattern: string): { type: string; interval: number; frequency: number } {
    // Handle simple patterns
    const lowerPattern = pattern.toLowerCase();
    
    if (lowerPattern.includes('daily')) {
      return { type: 'daily', interval: 1, frequency: 1 };
    }
    if (lowerPattern.includes('weekly')) {
      return { type: 'weekly', interval: 1, frequency: 1 };
    }
    if (lowerPattern.includes('monthly')) {
      return { type: 'monthly', interval: 1, frequency: 1 };
    }
    if (lowerPattern.includes('quarterly')) {
      return { type: 'quarterly', interval: 3, frequency: 1 };
    }
    if (lowerPattern.includes('annually') || lowerPattern.includes('yearly')) {
      return { type: 'annually', interval: 12, frequency: 1 };
    }

    // Default to monthly
    return { type: 'monthly', interval: 1, frequency: 1 };
  }
}
