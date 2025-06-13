
import { debugLog } from '../../logger';
import { RecurrenceCalculation } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { ValidationUtils } from './validationUtils';
import { MonthUtils } from './monthUtils';
import { AnnualTaskCalculator } from './annualTaskCalculator';
import { RecurrenceTypeCalculator } from './recurrenceTypes';

/**
 * Enhanced Recurrence Calculator with modular architecture
 * 
 * This calculator handles different types of recurring tasks:
 * - Annual tasks: Only generate hours for their specific target month
 * - Non-annual tasks: Distribute hours based on recurrence pattern
 * 
 * Key behaviors:
 * - Annual tasks use month_of_year (primary) or due_date (fallback) for month targeting
 * - Annual tasks return full hours only in target month, zero elsewhere
 * - Interval adjustments apply to all recurrence types
 * 
 * ENHANCED: Added detailed debugging for Bloom Advisory LLC investigation
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand with proper annual task month-specific logic
   * ENHANCED: Added detailed debugging for Bloom Advisory LLC CPA investigation
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    const isBloomTask = task.name && task.name.toLowerCase().includes('bloom');
    const clientId = task.client_id;
    
    console.log(`🔄 [RECURRENCE CALC] Calculating for task ${task.id}:`, {
      taskName: task.name,
      estimatedHours: task.estimated_hours,
      recurrenceType: task.recurrence_type,
      recurrenceInterval: task.recurrence_interval,
      dueDate: task.due_date,
      monthOfYear: task.month_of_year,
      dayOfMonth: task.day_of_month,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      isBloomTask,
      clientId
    });

    try {
      // Enhanced input validation
      const validationResult = ValidationUtils.validateTaskInputs(task);
      if (!validationResult.isValid) {
        console.warn(`⚠️ [RECURRENCE CALC] Validation failed for task ${task.id}:`, validationResult.errors);
        return this.createEmptyResult(task.id);
      }

      const recurrenceType = task.recurrence_type.toLowerCase();
      const interval = Math.max(1, task.recurrence_interval || 1);
      const periodMonth = startDate.getMonth(); // 0-11

      console.log(`📅 [RECURRENCE CALC] Processing ${recurrenceType} task for period month ${periodMonth} (${MonthUtils.getMonthName(periodMonth)})`);

      // Handle annual tasks with month-specific logic
      if (RecurrenceTypeCalculator.isAnnualRecurrence(recurrenceType)) {
        const result = AnnualTaskCalculator.calculateAnnualTaskDemand(task, periodMonth, interval);
        
        // ENHANCED: Special debugging for Bloom Advisory tasks
        if (isBloomTask) {
          console.log(`🧐 [BLOOM ANNUAL DEBUG] Annual task calculation for Bloom:`, {
            taskId: task.id,
            taskName: task.name,
            result,
            explanation: 'Annual tasks only generate hours in their target month'
          });
        }
        
        return result;
      }

      // Determine start month for quarterly and other patterns that rely on a base month
      let startMonth = 0;
      if (task.month_of_year !== null && task.month_of_year !== undefined) {
        startMonth = task.month_of_year - 1; // convert 1-12 to 0-11
      } else if (task.due_date) {
        startMonth = MonthUtils.getMonthFromDate(task.due_date);
      }

      // Handle other recurrence types
      const result = this.calculateNonAnnualTaskDemand(
        task,
        recurrenceType,
        interval,
        periodMonth,
        startMonth
      );
      
      // ENHANCED: Special debugging for Bloom Advisory tasks
      if (isBloomTask) {
        console.log(`🧐 [BLOOM NON-ANNUAL DEBUG] Non-annual task calculation for Bloom:`, {
          taskId: task.id,
          taskName: task.name,
          recurrenceType,
          interval,
          periodMonth,
          startMonth,
          result,
          explanation: `${recurrenceType} task with interval ${interval}, calculated ${result.monthlyOccurrences} occurrences × ${task.estimated_hours}h = ${result.monthlyHours}h`
        });
        
        // SPECIAL: Daily recurrence investigation for 1-hour daily tasks
        if (recurrenceType === 'daily' && task.estimated_hours === 1) {
          console.log(`🧐 [BLOOM DAILY DEBUG] Daily 1-hour task analysis:`, {
            taskId: task.id,
            expectedManualCalc: '1h × 5 days/week × ~4.3 weeks/month = ~22h/month',
            systemCalculation: `${result.monthlyOccurrences} occurrences × ${task.estimated_hours}h = ${result.monthlyHours}h`,
            discrepancy: result.monthlyHours > 22 ? 'System calculating more than expected' : 'System calculating as expected',
            possibleCause: result.monthlyOccurrences > 22 ? 'System may be counting weekends or using 30-day month' : 'Calculation appears correct'
          });
        }
      }
      
      return result;

    } catch (error) {
      console.error(`❌ [RECURRENCE CALC] Error calculating recurrence for task ${task.id}:`, error);
      return this.createEmptyResult(task.id);
    }
  }

  /**
   * Calculate demand for non-annual recurring tasks
   * ENHANCED: Added detailed debugging for daily recurrence patterns
   */
  private static calculateNonAnnualTaskDemand(
    task: RecurringTaskDB,
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth: number
  ): RecurrenceCalculation {
    const monthlyOccurrences = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
      recurrenceType,
      interval,
      periodMonth,
      startMonth
    );
    const monthlyHours = Number(task.estimated_hours) * monthlyOccurrences;

    // ENHANCED: Special debugging for daily tasks that might explain the 30h calculation
    if (recurrenceType === 'daily') {
      console.log(`🧐 [DAILY TASK DEBUG] Daily recurrence calculation details:`, {
        taskId: task.id,
        taskName: task.name,
        recurrenceType,
        interval,
        monthlyOccurrences,
        estimatedHours: task.estimated_hours,
        monthlyHours,
        calculation: `${task.estimated_hours}h × ${monthlyOccurrences} occurrences = ${monthlyHours}h`,
        note: 'For daily tasks, system may count all days in month (30-31) rather than business days (20-22)'
      });
    }

    console.log(`✅ [RECURRENCE CALC] Non-annual calculation complete:`, {
      taskId: task.id,
      recurrenceType: task.recurrence_type,
      monthlyOccurrences,
      monthlyHours,
      calculation: `${task.estimated_hours} × ${monthlyOccurrences} = ${monthlyHours}`
    });

    return {
      monthlyOccurrences: Math.max(0, monthlyOccurrences),
      monthlyHours: Math.max(0, monthlyHours),
      taskId: task.id,
      nextDueDates: []
    };
  }

  /**
   * Create an empty result for failed calculations
   */
  private static createEmptyResult(taskId: string): RecurrenceCalculation {
    return {
      monthlyOccurrences: 0,
      monthlyHours: 0,
      taskId,
      nextDueDates: []
    };
  }

  // Re-export utility methods for backward compatibility
  static isDateInPeriod = MonthUtils.isDateInPeriod;
  static getMonthFromDate = MonthUtils.getMonthFromDate;
}
