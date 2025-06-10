
import { debugLog } from '../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

/**
 * Enhanced Recurrence Calculator with date-specific annual task support
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand from recurrence patterns with date-specific logic for annual tasks
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    console.log(`🔄 [RECURRENCE CALC] Calculating for task ${task.id}:`, {
      taskName: task.name,
      estimatedHours: task.estimated_hours,
      recurrenceType: task.recurrence_type,
      recurrenceInterval: task.recurrence_interval,
      dueDate: task.due_date,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

    try {
      // Validate inputs
      if (!task || typeof task.estimated_hours !== 'number' || task.estimated_hours <= 0) {
        console.warn(`⚠️ [RECURRENCE CALC] Invalid task hours for ${task.id}:`, {
          estimated_hours: task.estimated_hours,
          type: typeof task.estimated_hours
        });
        return {
          monthlyOccurrences: 0,
          monthlyHours: 0,
          taskId: task.id,
          nextDueDates: []
        };
      }

      if (!task.recurrence_type) {
        console.warn(`⚠️ [RECURRENCE CALC] No recurrence type for task ${task.id}`);
        return {
          monthlyOccurrences: 0,
          monthlyHours: 0,
          taskId: task.id,
          nextDueDates: []
        };
      }

      // Calculate frequency based on recurrence type
      const interval = Math.max(1, task.recurrence_interval || 1);
      let monthlyOccurrences = 0;
      let monthlyHours = 0;

      console.log(`📅 [RECURRENCE CALC] Processing recurrence for task ${task.id}:`, {
        type: task.recurrence_type,
        interval: interval
      });

      const recurrenceType = task.recurrence_type.toLowerCase();

      // FIXED: Handle annual tasks with date-specific logic
      if (recurrenceType === 'annually' || recurrenceType === 'annual') {
        console.log(`📆 [RECURRENCE CALC] Annual task detected - checking if due in current period`);
        
        if (task.due_date) {
          const taskDueDate = new Date(task.due_date);
          const taskMonth = taskDueDate.getMonth(); // 0-11
          const periodMonth = startDate.getMonth(); // 0-11
          
          console.log(`📅 [RECURRENCE CALC] Annual task date comparison:`, {
            taskDueDate: taskDueDate.toISOString(),
            taskMonth: taskMonth,
            periodMonth: periodMonth,
            monthsMatch: taskMonth === periodMonth
          });
          
          // Only include hours if the task's due month matches the current period month
          if (taskMonth === periodMonth) {
            monthlyOccurrences = 1 / interval; // Account for interval (e.g., every 2 years = 0.5)
            monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;
            console.log(`✅ [RECURRENCE CALC] Annual task included in month ${periodMonth}: ${monthlyHours}h`);
          } else {
            monthlyOccurrences = 0;
            monthlyHours = 0;
            console.log(`❌ [RECURRENCE CALC] Annual task NOT included - due in month ${taskMonth}, current month ${periodMonth}`);
          }
        } else {
          // Fallback to old calculation if no due date
          console.warn(`⚠️ [RECURRENCE CALC] Annual task ${task.id} has no due_date, using fallback calculation`);
          monthlyOccurrences = (1 / interval) / 12;
          monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;
        }
      } else {
        // Handle other recurrence types with existing logic
        switch (recurrenceType) {
          case 'daily':
            // Approximate days in month: 30
            monthlyOccurrences = 30 / interval;
            console.log(`📆 [RECURRENCE CALC] Daily calculation: 30 days ÷ ${interval} = ${monthlyOccurrences}`);
            break;
            
          case 'weekly':
            // Approximate weeks in month: 4.33
            monthlyOccurrences = 4.33 / interval;
            console.log(`📆 [RECURRENCE CALC] Weekly calculation: 4.33 weeks ÷ ${interval} = ${monthlyOccurrences}`);
            break;
            
          case 'monthly':
            monthlyOccurrences = 1 / interval;
            console.log(`📆 [RECURRENCE CALC] Monthly calculation: 1 month ÷ ${interval} = ${monthlyOccurrences}`);
            break;
            
          case 'quarterly':
            // Quarterly = every 3 months
            monthlyOccurrences = (1 / interval) / 3;
            console.log(`📆 [RECURRENCE CALC] Quarterly calculation: (1 ÷ ${interval}) ÷ 3 = ${monthlyOccurrences}`);
            break;
            
          default:
            console.warn(`⚠️ [RECURRENCE CALC] Unknown recurrence type for task ${task.id}: ${task.recurrence_type}`);
            monthlyOccurrences = 1; // Default fallback
            break;
        }
        
        // Calculate monthly hours for non-annual tasks
        monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;
      }

      console.log(`✅ [RECURRENCE CALC] Final calculation for task ${task.id}:`, {
        estimatedHours: task.estimated_hours,
        monthlyOccurrences: monthlyOccurrences,
        monthlyHours: monthlyHours,
        calculation: `${task.estimated_hours} × ${monthlyOccurrences} = ${monthlyHours}`,
        recurrenceType: task.recurrence_type
      });

      const result: RecurrenceCalculation = {
        monthlyOccurrences: Math.max(0, monthlyOccurrences),
        monthlyHours: Math.max(0, monthlyHours),
        taskId: task.id,
        nextDueDates: [] // Simplified for now
      };

      if (result.monthlyHours === 0 && recurrenceType !== 'annually') {
        console.warn(`⚠️ [RECURRENCE CALC] Zero hours calculated for non-annual task ${task.id}!`, result);
      }

      return result;

    } catch (error) {
      console.error(`❌ [RECURRENCE CALC] Error calculating recurrence for task ${task.id}:`, error);
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0,
        taskId: task.id,
        nextDueDates: []
      };
    }
  }

  /**
   * Utility method to check if a date falls within a period
   */
  static isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Utility method to get the month number (0-11) from a date string or Date object
   */
  static getMonthFromDate(date: string | Date): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getMonth();
  }
}
