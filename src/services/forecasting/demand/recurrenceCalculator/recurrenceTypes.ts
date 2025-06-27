import { RecurringTaskDB } from '@/types/task';
import { MonthlyDemandResult } from './recurrenceCalculator';
import { WeekdayUtils } from './weekdayUtils';
import { MonthUtils } from './monthUtils';
import { AnnualTaskCalculator } from './annualTaskCalculator';
import { QuarterlyTaskCalculator } from './quarterlyTaskCalculator';

/**
 * Enhanced Recurrence Type Calculator with Accurate Quarterly Calculations
 * 
 * ENHANCED QUARTERLY CALCULATION LOGIC:
 * 
 * This calculator now implements accurate quarterly task calculations that
 * allocate hours only to the months when the task is actually due, rather
 * than distributing hours across all months using a static formula.
 * 
 * CALCULATION METHODOLOGY BY TYPE:
 * 
 * 1. QUARTERLY (ENHANCED):
 *    - Uses QuarterlyTaskCalculator for accurate due month determination
 *    - Allocates full hours only to due months (0 or estimated_hours)
 *    - Respects recurrence intervals (quarterly, semi-annually, etc.)
 *    - Example: Q1 task with 10 hours shows 10h in March, 0h in other months
 * 
 * 2. WEEKLY WITH WEEKDAYS (EXISTING ENHANCEMENT):
 *    - Uses WeekdayUtils.calculateWeeklyOccurrences()
 *    - Formula: numberOfWeekdays × 4.35 weeks/month ÷ interval
 * 
 * 3. OTHER RECURRENCE TYPES (UNCHANGED):
 *    - Monthly: 1 occurrence per interval months
 *    - Annual: Uses AnnualTaskCalculator for month-specific logic
 *    - Daily: Uses average days per month calculation
 */

export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly demand based on recurrence type with enhanced quarterly support
   * 
   * This method serves as the main routing hub for different recurrence types,
   * with special enhanced handling for quarterly tasks that include accurate
   * due month calculations and weekly tasks with weekday specifications.
   * 
   * @param task The recurring task to calculate
   * @param startDate Start of calculation period
   * @param endDate End of calculation period
   * @returns MonthlyDemandResult with occurrences and total hours
   */
  static calculateForType(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): MonthlyDemandResult {
    const taskId = task.id;
    const recurrenceType = task.recurrence_type?.toLowerCase() || '';
    const estimatedHours = task.estimated_hours || 0;
    const interval = task.recurrence_interval || 1;

    console.log(`🔄 [RECURRENCE TYPES] Calculating for task ${taskId}:`, {
      recurrenceType,
      estimatedHours,
      interval,
      hasWeekdays: !!(task.weekdays && Array.isArray(task.weekdays) && task.weekdays.length > 0),
      weekdays: task.weekdays,
      dueDate: task.due_date
    });

    try {
      let monthlyOccurrences = 0;

      /**
       * ENHANCED QUARTERLY CALCULATION WITH ACCURATE DUE MONTH LOGIC
       * 
       * This is the core enhancement that provides accurate quarterly recurring
       * task calculations based on the task's due_date and recurrence interval,
       * allocating hours only to the months when the task is actually due.
       */
      if (recurrenceType === 'quarterly') {
        monthlyOccurrences = this.calculateQuarterlyOccurrences(task, startDate);
      }
      /**
       * ENHANCED WEEKLY CALCULATION WITH WEEKDAY SUPPORT
       */
      else if (recurrenceType === 'weekly') {
        monthlyOccurrences = this.calculateWeeklyOccurrences(task, interval);
      }
      /**
       * ANNUAL TASK CALCULATION
       */
      else if (recurrenceType.includes('annual')) {
        monthlyOccurrences = AnnualTaskCalculator.calculateAnnualOccurrences(
          task,
          startDate,
          endDate
        );
      }
      /**
       * STANDARD RECURRENCE TYPE CALCULATIONS
       */
      else if (recurrenceType === 'monthly') {
        monthlyOccurrences = 1 / interval;
      }
      else if (recurrenceType === 'daily') {
        // Daily tasks: ~30.44 days per month / interval
        monthlyOccurrences = 30.44 / interval;
      }
      else {
        // Fallback for unknown recurrence types
        console.warn(`⚠️ [RECURRENCE TYPES] Unknown recurrence type: ${recurrenceType} for task ${taskId}`);
        monthlyOccurrences = 0;
      }

      // Calculate total monthly hours
      const monthlyHours = monthlyOccurrences * estimatedHours;

      // Enhanced logging with calculation breakdown
      console.log(`✅ [RECURRENCE TYPES] Calculated for task ${taskId}:`, {
        recurrenceType,
        monthlyOccurrences: monthlyOccurrences.toFixed(3),
        estimatedHours,
        monthlyHours: monthlyHours.toFixed(2),
        calculationMethod: recurrenceType === 'quarterly' 
          ? 'Enhanced due-month based'
          : recurrenceType === 'weekly' && task.weekdays 
          ? 'Enhanced weekday-based'
          : 'Standard recurrence formula'
      });

      return {
        monthlyOccurrences,
        monthlyHours,
        taskId
      };

    } catch (error) {
      console.error(`❌ [RECURRENCE TYPES] Error calculating for task ${taskId}:`, error);
      
      // Graceful error recovery
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0,
        taskId
      };
    }
  }

  /**
   * Calculate quarterly occurrences using the new enhanced logic
   * 
   * This method uses the QuarterlyTaskCalculator to determine if the
   * current month is a due month for the quarterly task, providing
   * accurate hour allocation instead of distributing across all months.
   * 
   * @param task The quarterly recurring task
   * @param startDate The calculation period start date
   * @returns Number of monthly occurrences (0 or 1)
   */
  private static calculateQuarterlyOccurrences(
    task: RecurringTaskDB,
    startDate: Date
  ): number {
    const taskId = task.id;
    const targetMonth = startDate.getMonth(); // 0-based
    const targetYear = startDate.getFullYear();

    console.log(`📅 [QUARTERLY CALCULATION] Using enhanced calculation for task ${taskId}:`, {
      targetMonth: targetMonth + 1, // Convert to 1-based for logging
      targetYear,
      interval: task.recurrence_interval,
      dueDate: task.due_date
    });

    try {
      // Use the new QuarterlyTaskCalculator for accurate calculation
      const result = QuarterlyTaskCalculator.calculateQuarterlyOccurrences(
        task,
        targetMonth,
        targetYear
      );

      console.log(`✅ [QUARTERLY CALCULATION] Enhanced calculation complete for task ${taskId}:`, {
        targetMonth: targetMonth + 1,
        targetYear,
        monthlyOccurrences: result,
        description: QuarterlyTaskCalculator.getQuarterlyDescription(task)
      });

      return result;

    } catch (error) {
      console.error(`❌ [QUARTERLY CALCULATION] Error in enhanced calculation for task ${taskId}:`, error);
      
      // Fall back to zero occurrences on error
      console.warn(`⚠️ [QUARTERLY CALCULATION] Falling back to zero occurrences for task ${taskId}`);
      return 0;
    }
  }

  /**
   * Calculate weekly occurrences with enhanced weekday logic
   * 
   * This method implements the core weekly calculation enhancement,
   * providing accurate weekday-based calculations while maintaining
   * backward compatibility for tasks without weekday specifications.
   * 
   * CALCULATION LOGIC:
   * 1. If weekdays are specified and valid: Use WeekdayUtils for precise calculation
   * 2. If weekdays are missing/invalid: Fall back to legacy 4.33 weeks/month
   * 3. All calculations respect the recurrence interval (weekly, bi-weekly, etc.)
   * 
   * EXAMPLES:
   * - Task with weekdays [1,3,5], interval 1: 3 × 4.35 ÷ 1 = 13.05 occurrences
   * - Task with weekdays [2,4], interval 2: 2 × 4.35 ÷ 2 = 4.35 occurrences  
   * - Task without weekdays, interval 1: 4.33 ÷ 1 = 4.33 occurrences (legacy)
   * 
   * @param task The weekly recurring task
   * @param interval The recurrence interval (1=weekly, 2=bi-weekly, etc.)
   * @returns Number of monthly occurrences
   */
  private static calculateWeeklyOccurrences(
    task: RecurringTaskDB,
    interval: number
  ): number {
    const taskId = task.id;
    const weekdays = task.weekdays;

    if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
      console.log(`📅 [WEEKLY CALCULATION] Using enhanced weekday calculation for task ${taskId}:`, {
        weekdays,
        interval,
        weekdayCount: weekdays.length
      });

      try {
        const validation = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
        
        if (!validation.isValid) {
          console.warn(`⚠️ [WEEKLY CALCULATION] Invalid weekdays for task ${taskId}:`, {
            errors: validation.errors,
            originalWeekdays: weekdays,
            fallbackBehavior: 'Using legacy calculation'
          });
          
          return 4.33 / interval;
        }

        if (validation.warnings.length > 0) {
          console.info(`ℹ️ [WEEKLY CALCULATION] Weekday warnings for task ${taskId}:`, validation.warnings);
        }

        const result = WeekdayUtils.calculateWeeklyOccurrences(
          validation.validWeekdays,
          interval
        );

        console.log(`✅ [WEEKLY CALCULATION] Enhanced calculation complete for task ${taskId}:`, {
          originalWeekdays: weekdays,
          validWeekdays: validation.validWeekdays,
          weekdayNames: result.details.weekdayNames,
          calculation: result.calculation,
          monthlyOccurrences: result.occurrences.toFixed(3)
        });

        return result.occurrences;

      } catch (error) {
        console.error(`❌ [WEEKLY CALCULATION] Error in enhanced calculation for task ${taskId}:`, error);
        console.warn(`⚠️ [WEEKLY CALCULATION] Falling back to legacy calculation for task ${taskId}`);
        return 4.33 / interval;
      }
    }

    console.log(`📅 [WEEKLY CALCULATION] Using legacy calculation for task ${taskId}:`, {
      reason: !weekdays ? 'No weekdays specified' : 
              !Array.isArray(weekdays) ? 'Weekdays not an array' :
              'Weekdays array is empty',
      interval,
      legacyFormula: `4.33 / ${interval} = ${(4.33 / interval).toFixed(3)}`
    });

    return 4.33 / interval;
  }

  /**
   * Calculate monthly occurrences for different recurrence types (for testing)
   * 
   * @param recurrenceType The type of recurrence
   * @param interval The interval between recurrences
   * @param periodMonth Current month being calculated (0-based)
   * @param startMonth Starting month for calculation context
   * @param weekdays Optional weekdays for weekly recurrence
   * @returns Number of monthly occurrences
   */
  static calculateMonthlyOccurrences(
    recurrenceType: string,
    interval: number,
    periodMonth: number,
    startMonth: number,
    weekdays?: number[]
  ): number {
    const type = recurrenceType.toLowerCase();

    if (type === 'weekly') {
      if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
        const validation = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
        if (validation.isValid) {
          const result = WeekdayUtils.calculateWeeklyOccurrences(validation.validWeekdays, interval);
          return result.occurrences;
        }
      }
      return 4.33 / interval;
    }

    if (type === 'monthly') {
      return 1 / interval;
    }

    if (type === 'quarterly') {
      // For testing: simple quarterly logic based on month alignment
      const quarterMonth = Math.floor(periodMonth / 3) * 3;
      const startQuarter = Math.floor(startMonth / 3) * 3;
      
      if (quarterMonth === startQuarter) {
        return 1 / interval;
      }
      return 0;
    }

    if (type === 'daily') {
      return 30 / interval;
    }

    return 0;
  }

  /**
   * Get weekly recurrence description for display purposes
   * 
   * @param interval Recurrence interval
   * @param weekdays Optional weekdays array
   * @returns Human-readable description
   */
  static getWeeklyRecurrenceDescription(interval: number, weekdays?: number[]): string {
    const intervalText = interval === 1 ? 'week' : `${interval} weeks`;
    
    if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
      const validation = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
      if (validation.isValid) {
        const description = WeekdayUtils.getWeekdaysDescription(validation.validWeekdays);
        return `${description} every ${intervalText}`;
      }
    }
    
    return `Every ${intervalText}`;
  }

  /**
   * Get quarterly recurrence description for display purposes
   * 
   * @param task The quarterly task
   * @returns Human-readable description
   */
  static getQuarterlyRecurrenceDescription(task: RecurringTaskDB): string {
    return QuarterlyTaskCalculator.getQuarterlyDescription(task);
  }
}
