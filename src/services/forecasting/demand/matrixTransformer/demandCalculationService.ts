
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { format, eachMonthOfInterval, endOfMonth } from 'date-fns';
import { debugLog } from '../../logger';

/**
 * Demand Calculation Service
 * 
 * Core service for calculating demand metrics from recurring tasks
 * with enhanced accuracy and consistency.
 */
export class DemandCalculationService {
  /**
   * Calculate comprehensive demand metrics from recurring tasks
   */
  static calculateDemandMetrics(
    tasks: RecurringTaskDB[],
    startDate: Date,
    endDate: Date
  ): DemandDataPoint[] {
    debugLog('Calculating demand metrics', { 
      tasksCount: tasks.length,
      dateRange: { startDate, endDate }
    });

    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const demandPoints: DemandDataPoint[] = [];

    months.forEach(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthKey = format(monthStart, 'yyyy-MM');
      const monthLabel = format(monthStart, 'MMM yyyy');

      // Group tasks by skill type for aggregation
      const skillGroups = new Map<string, ClientTaskDemand[]>();

      tasks.forEach(task => {
        // Use correct property names from RecurringTaskDB
        const skillType = task.required_skills || 'General';
        
        // Calculate monthly task occurrences
        const occurrences = this.calculateTaskOccurrences(
          task.recurrence_type,
          monthStart,
          monthEnd
        );

        if (occurrences > 0) {
          const monthlyHours = (task.estimated_hours || 0) * occurrences;

          const taskDemand: ClientTaskDemand = {
            clientTaskDemandId: `${task.id}-${monthKey}`,
            taskName: task.name,
            clientId: task.client_id,
            clientName: 'Unknown Client', // Would need client lookup
            monthlyHours,
            skillType,
            estimatedHours: task.estimated_hours || 0,
            recurrencePattern: task.recurrence_type || 'monthly',
            recurringTaskId: task.id,
            preferredStaff: task.preferred_staff_id ? {
              staffId: task.preferred_staff_id,
              full_name: task.preferred_staff_id // Would need staff lookup
            } : null
          };

          if (!skillGroups.has(skillType)) {
            skillGroups.set(skillType, []);
          }
          skillGroups.get(skillType)!.push(taskDemand);
        }
      });

      // Create demand points for each skill group
      skillGroups.forEach((taskBreakdown, skillType) => {
        const demandHours = taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
        const uniqueClients = new Set(taskBreakdown.map(task => task.clientId));

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

    return demandPoints;
  }

  /**
   * Calculate task occurrences based on recurrence pattern
   */
  private static calculateTaskOccurrences(
    recurrenceType: string | null,
    monthStart: Date,
    monthEnd: Date
  ): number {
    if (!recurrenceType) return 1;

    const pattern = recurrenceType.toLowerCase();
    const daysInMonth = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));

    if (pattern.includes('daily')) {
      return daysInMonth;
    }
    
    if (pattern.includes('weekly')) {
      return Math.floor(daysInMonth / 7);
    }
    
    if (pattern.includes('bi-weekly') || pattern.includes('biweekly')) {
      return Math.floor(daysInMonth / 14);
    }
    
    if (pattern.includes('monthly')) {
      return 1;
    }
    
    if (pattern.includes('quarterly')) {
      return 1/3;
    }
    
    if (pattern.includes('annually') || pattern.includes('yearly')) {
      return 1/12;
    }

    // Try to extract numeric intervals
    const numericMatch = pattern.match(/every\s+(\d+)\s+(day|week|month)/);
    if (numericMatch) {
      const interval = parseInt(numericMatch[1]);
      const unit = numericMatch[2];
      
      switch (unit) {
        case 'day':
          return Math.floor(daysInMonth / interval);
        case 'week':
          return Math.floor(daysInMonth / (interval * 7));
        case 'month':
          return 1 / interval;
      }
    }

    return 1; // Default to once per month
  }

  /**
   * Aggregate demand data across all skills and periods
   */
  static aggregateDemandTotals(dataPoints: DemandDataPoint[]): {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
  } {
    const totalDemand = dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const totalTasks = dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    
    const allClients = new Set<string>();
    dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        allClients.add(task.clientId);
      });
    });

    return {
      totalDemand,
      totalTasks,
      totalClients: allClients.size
    };
  }
}
