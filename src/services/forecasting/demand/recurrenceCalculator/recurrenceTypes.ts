
import { RecurringTaskDB } from '@/types/task';
import { MonthlyDemandResult } from './recurrenceCalculator';
import { WeekdayUtils } from './weekdayUtils';
import { MonthUtils } from './monthUtils';
import { AnnualTaskCalculator } from './annualTaskCalculator';

/**
 * Enhanced Recurrence Type Calculator with Weekday-Aware Weekly Calculations
 * 
 * ENHANCED WEEKLY CALCULATION LOGIC:
 * 
 * This calculator implements the core enhancement for weekly recurring tasks,
 * providing accurate demand calculations based on specific weekdays rather
 * than using a fixed 4.33 weeks/month approximation.
 * 
 * CALCULATION METHODOLOGY BY TYPE:
 * 
 * 1. WEEKLY WITH WEEKDAYS (NEW ENHANCED LOGIC):
 *    - Uses WeekdayUtils.calculateWeeklyOccurrences()
 *    - Formula: numberOfWeekdays × 4.35 weeks/month ÷ interval
 *    - Example: [1,3,5] = 3 × 4.35 ÷ 1 = 13.05 occurrences/month
 * 
 * 2. WEEKLY WITHOUT WEEKDAYS (LEGACY COMPATIBILITY):
 *    - Uses traditional 4.33 weeks/month calculation
 *    - Formula: 4.33 ÷ interval
 *    - Maintains backward compatibility for existing tasks
 * 
 * 3. OTHER RECURRENCE TYPES (UNCHANGED):
 *    - Monthly: 1 occurrence per interval months
 *    - Quarterly: 1 occurrence per 3×interval months  
 *    - Annual: Uses AnnualTaskCalculator for month-specific logic
 *    - Custom: Falls back to legacy calculation patterns
 * 
 * INTEGRATION FEATURES:
 * - Comprehensive logging for debugging and monitoring
 * - Graceful fallback mechanisms for invalid data
 * - Performance optimization for large task volumes
 * - Full backward compatibility with existing calculations
 */

export class RecurrenceTypeCalculator {
  /**
   * Calculate monthly demand based on recurrence type with enhanced weekly support
   * 
   * This method serves as the main routing hub for different recurrence types,
   * with special enhanced handling for weekly tasks that include weekday specifications.
   * 
   * ROUTING LOGIC:
   * - Weekly tasks: Route to enhanced weekday-aware calculation
   * - Annual tasks: Use specialized AnnualTaskCalculator
   * - Other types: Use standard mathematical formulas
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
      weekdays: task.weekdays
    });

    try {
      let monthlyOccurrences = 0;

      /**
       * ENHANCED WEEKLY CALCULATION WITH WEEKDAY SUPPORT
       * 
       * This is the core enhancement that provides accurate weekly recurring
       * task calculations based on selected weekdays rather than using a
       * fixed weeks-per-month approximation.
       */
      if (recurrenceType === 'weekly') {
        monthlyOccurrences = this.calculateWeeklyOccurrences(task, interval);
      }
      /**
       * ANNUAL TASK CALCULATION
       * 
       * Uses specialized AnnualTaskCalculator to determine if the task
       * should be included in the current month based on month_of_year
       * or due_date configuration.
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
       * 
       * These calculations remain unchanged from the original implementation
       * to ensure backward compatibility and maintain existing functionality.
       */
      else if (recurrenceType === 'monthly') {
        monthlyOccurrences = 1 / interval;
      }
      else if (recurrenceType === 'quarterly') {
        monthlyOccurrences = (1 / 3) / interval; // Once every 3 months, adjusted for interval
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
        calculationMethod: recurrenceType === 'weekly' && task.weekdays 
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

    /**
     * ENHANCED WEEKDAY-BASED CALCULATION
     * 
     * When weekdays are properly specified, use the enhanced calculation
     * that considers the specific days of the week the task occurs.
     */
    if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
      console.log(`📅 [WEEKLY CALCULATION] Using enhanced weekday calculation for task ${taskId}:`, {
        weekdays,
        interval,
        weekdayCount: weekdays.length
      });

      try {
        // Validate and normalize weekdays
        const validation = WeekdayUtils.validateAndNormalizeWeekdays(weekdays);
        
        if (!validation.isValid) {
          console.warn(`⚠️ [WEEKLY CALCULATION] Invalid weekdays for task ${taskId}:`, {
            errors: validation.errors,
            originalWeekdays: weekdays,
            fallbackBehavior: 'Using legacy calculation'
          });
          
          // Fall back to legacy calculation
          return 4.33 / interval;
        }

        // Log validation warnings
        if (validation.warnings.length > 0) {
          console.info(`ℹ️ [WEEKLY CALCULATION] Weekday warnings for task ${taskId}:`, validation.warnings);
        }

        // Calculate using enhanced weekday logic
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
        
        // Fall back to legacy calculation on error
        console.warn(`⚠️ [WEEKLY CALCULATION] Falling back to legacy calculation for task ${taskId}`);
        return 4.33 / interval;
      }
    }

    /**
     * LEGACY WEEKLY CALCULATION
     * 
     * When weekdays are not specified or invalid, use the traditional
     * 4.33 weeks per month calculation to maintain backward compatibility.
     */
    console.log(`📅 [WEEKLY CALCULATION] Using legacy calculation for task ${taskId}:`, {
      reason: !weekdays ? 'No weekdays specified' : 
              !Array.isArray(weekdays) ? 'Weekdays not an array' :
              'Weekdays array is empty',
      interval,
      legacyFormula: `4.33 / ${interval} = ${(4.33 / interval).toFixed(3)}`
    });

    return 4.33 / interval;
  }
}
