
import { debugLog } from '../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

/**
 * Enhanced Recurrence Calculator with diagnostic logging
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand from recurrence patterns with detailed tracing
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

      console.log(`📅 [RECURRENCE CALC] Processing recurrence for task ${task.id}:`, {
        type: task.recurrence_type,
        interval: interval
      });

      switch (task.recurrence_type.toLowerCase()) {
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
          
        case 'annually':
          // Annual = every 12 months
          monthlyOccurrences = (1 / interval) / 12;
          console.log(`📆 [RECURRENCE CALC] Annual calculation: (1 ÷ ${interval}) ÷ 12 = ${monthlyOccurrences}`);
          break;
          
        default:
          console.warn(`⚠️ [RECURRENCE CALC] Unknown recurrence type for task ${task.id}: ${task.recurrence_type}`);
          monthlyOccurrences = 1; // Default fallback
          break;
      }

      // Calculate monthly hours
      const monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;

      console.log(`✅ [RECURRENCE CALC] Final calculation for task ${task.id}:`, {
        estimatedHours: task.estimated_hours,
        monthlyOccurrences: monthlyOccurrences,
        monthlyHours: monthlyHours,
        calculation: `${task.estimated_hours} × ${monthlyOccurrences} = ${monthlyHours}`
      });

      const result: RecurrenceCalculation = {
        monthlyOccurrences: Math.max(0, monthlyOccurrences),
        monthlyHours: Math.max(0, monthlyHours),
        taskId: task.id,
        nextDueDates: [] // Simplified for now
      };

      if (result.monthlyHours === 0) {
        console.warn(`⚠️ [RECURRENCE CALC] Zero hours calculated for task ${task.id}!`, result);
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
}
