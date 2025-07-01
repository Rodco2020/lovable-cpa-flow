
import { RecurringTaskDB } from '@/types/task';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { debugLog } from '../../logger';

/**
 * Monthly Demand Calculation Service
 * 
 * Calculates monthly demand for tasks based on their recurrence patterns,
 * ensuring tasks only appear in months when they are actually due.
 */
export class MonthlyDemandCalculationService {
  /**
   * Calculate monthly demand for a task in a specific month
   * Returns 0 if the task is not due in that month
   */
  static calculateTaskDemandForMonth(
    task: RecurringTaskDB,
    monthKey: string // Format: 'YYYY-MM'
  ): { monthlyHours: number; monthlyOccurrences: number } {
    try {
      // Parse month to get start and end dates
      const [year, month] = monthKey.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      debugLog(`Calculating demand for task ${task.id} in month ${monthKey}`, {
        taskName: task.name,
        recurrenceType: task.recurrence_type,
        recurrenceInterval: task.recurrence_interval,
        estimatedHours: task.estimated_hours,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Use RecurrenceCalculator for accurate monthly demand
      const demandResult = RecurrenceCalculator.calculateMonthlyDemand(
        task,
        startDate,
        endDate
      );

      debugLog(`Monthly demand calculated for task ${task.id}:`, {
        monthlyOccurrences: demandResult.monthlyOccurrences,
        monthlyHours: demandResult.monthlyHours
      });

      return {
        monthlyHours: demandResult.monthlyHours,
        monthlyOccurrences: demandResult.monthlyOccurrences
      };

    } catch (error) {
      console.error(`Error calculating monthly demand for task ${task.id} in month ${monthKey}:`, error);
      return {
        monthlyHours: 0,
        monthlyOccurrences: 0
      };
    }
  }

  /**
   * Check if a task should appear in a specific month based on its recurrence pattern
   */
  static shouldTaskAppearInMonth(
    task: RecurringTaskDB,
    monthKey: string
  ): boolean {
    const demand = this.calculateTaskDemandForMonth(task, monthKey);
    return demand.monthlyHours > 0;
  }

  /**
   * Get all months where a task should appear within a date range
   */
  static getTaskMonths(
    task: RecurringTaskDB,
    startMonth: string,
    endMonth: string
  ): string[] {
    const taskMonths: string[] = [];
    
    // Generate all months in range
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    
    const current = new Date(start);
    
    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      
      if (this.shouldTaskAppearInMonth(task, monthKey)) {
        taskMonths.push(monthKey);
      }
      
      current.setMonth(current.getMonth() + 1);
    }

    debugLog(`Task ${task.id} appears in months:`, taskMonths);
    return taskMonths;
  }
}
