
import { RecurringTaskDB } from '@/types/task';
import { debugLog } from '../../logger';
import { ValidationUtils } from './validationUtils';
import { RecurrenceTypeCalculator } from './recurrenceTypes';

/**
 * Enhanced Recurrence Calculator with Weekday-Aware Logic
 * 
 * WEEKDAY CALCULATION METHODOLOGY:
 * 
 * This calculator now provides accurate calculations for weekly recurring tasks
 * by considering the specific weekdays selected for each task. The enhanced
 * logic replaces the previous fixed 4.33 weeks/month approximation with a
 * more precise weekday-based calculation.
 * 
 * CALCULATION APPROACH:
 * 
 * 1. WEEKLY TASKS WITH WEEKDAYS:
 *    - Formula: estimatedHours × numberOfWeekdays × (30.44 days/month ÷ 7 days/week) ÷ interval
 *    - Example: 8 hours, every week, Mon/Wed/Fri = 8 × 3 × 4.35 ÷ 1 = 104.4 hours/month
 * 
 * 2. WEEKLY TASKS WITHOUT WEEKDAYS (Legacy):
 *    - Formula: estimatedHours × (4.33 weeks/month ÷ interval)
 *    - Example: 8 hours, every week = 8 × 4.33 = 34.64 hours/month
 * 
 * 3. OTHER RECURRENCE TYPES:
 *    - Uses existing specialized calculators (Monthly, Quarterly, Annual, etc.)
 *    - No changes to established calculation logic
 * 
 * INTEGRATION FEATURES:
 * - Comprehensive validation with fallback mechanisms
 * - Enhanced error handling and logging
 * - Performance monitoring integration
 * - Maintains backward compatibility
 */

export interface MonthlyDemandResult {
  monthlyOccurrences: number;
  monthlyHours: number;
  taskId: string;
}

export class RecurrenceCalculator {
  /**
   * Calculate monthly demand for a recurring task with enhanced weekday support
   * 
   * This method serves as the main entry point for demand calculations and
   * routes tasks to appropriate specialized calculators based on their
   * recurrence type and configuration.
   * 
   * WEEKDAY ENHANCEMENT LOGIC:
   * - Weekly tasks with valid weekdays: Uses WeekdayUtils for precise calculation
   * - Weekly tasks without weekdays: Falls back to legacy calculation
   * - Non-weekly tasks: Uses existing type-specific calculators
   * 
   * @param task The recurring task to calculate demand for
   * @param startDate Start of the calculation period
   * @param endDate End of the calculation period
   * @returns MonthlyDemandResult with occurrences and total hours
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB | null,
    startDate: Date,
    endDate: Date
  ): MonthlyDemandResult {
    // Enhanced null safety with detailed logging
    if (!task || !task.id) {
      console.warn('⚠️ [RECURRENCE CALCULATOR] Null or invalid task provided');
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0,
        taskId: task?.id || 'unknown'
      };
    }

    const taskId = task.id;

    try {
      // Enhanced input validation with detailed error reporting
      const validation = ValidationUtils.validateTaskInputs(task);
      if (!validation.isValid) {
        console.warn(`⚠️ [RECURRENCE CALCULATOR] Task ${taskId} validation failed:`, {
          errors: validation.errors,
          warnings: validation.warnings,
          fallbackBehavior: 'Returning zero demand'
        });
        return {
          monthlyOccurrences: 0,
          monthlyHours: 0,
          taskId
        };
      }

      // Log validation warnings for monitoring
      if (validation.warnings.length > 0) {
        console.info(`ℹ️ [RECURRENCE CALCULATOR] Task ${taskId} validation warnings:`, validation.warnings);
      }

      /**
       * ENHANCED RECURRENCE TYPE ROUTING WITH WEEKDAY SUPPORT
       * 
       * The routing logic now includes specific handling for weekly tasks
       * with weekdays, ensuring accurate demand calculations while maintaining
       * compatibility with existing recurrence types.
       */
      const result = RecurrenceTypeCalculator.calculateForType(
        task,
        startDate,
        endDate
      );

      // Enhanced result logging with calculation details
      debugLog(`Calculated monthly demand for task ${taskId}:`, {
        recurrenceType: task.recurrence_type,
        hasWeekdays: !!(task.weekdays && Array.isArray(task.weekdays) && task.weekdays.length > 0),
        weekdays: task.weekdays,
        monthlyOccurrences: result.monthlyOccurrences,
        monthlyHours: result.monthlyHours,
        estimatedHours: task.estimated_hours,
        calculationMethod: task.recurrence_type?.toLowerCase() === 'weekly' && task.weekdays 
          ? 'Enhanced weekday-based calculation'
          : 'Standard recurrence calculation'
      });

      return result;

    } catch (error) {
      console.error(`❌ [RECURRENCE CALCULATOR] Error calculating demand for task ${taskId}:`, error);
      
      // Graceful error recovery with zero demand
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0,
        taskId
      };
    }
  }

  /**
   * Calculate the next due date for a recurring task
   * 
   * @param task The recurring task
   * @param lastGeneratedDate The last generated date (optional)
   * @returns The next due date or null if calculation fails
   */
  static calculateNextDueDate(
    task: RecurringTaskDB,
    lastGeneratedDate: Date | null = null
  ): Date | null {
    if (!task.is_active) {
      return null;
    }

    try {
      const baseDate = lastGeneratedDate || new Date(task.due_date || new Date());
      const nextDate = new Date(baseDate);

      switch (task.recurrence_type.toLowerCase()) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + (task.recurrence_interval || 1));
          break;

        case 'weekly':
          if (task.weekdays && Array.isArray(task.weekdays) && task.weekdays.length > 0) {
            // Find next occurrence based on weekdays
            const currentWeekday = nextDate.getDay();
            const sortedWeekdays = [...task.weekdays].sort((a, b) => a - b);
            
            let nextWeekday = sortedWeekdays.find(day => day > currentWeekday);
            if (!nextWeekday) {
              // Move to next week, use first weekday
              nextWeekday = sortedWeekdays[0];
              nextDate.setDate(nextDate.getDate() + (7 - currentWeekday + nextWeekday));
              nextDate.setDate(nextDate.getDate() + (task.recurrence_interval - 1) * 7);
            } else {
              nextDate.setDate(nextDate.getDate() + (nextWeekday - currentWeekday));
            }
          } else {
            nextDate.setDate(nextDate.getDate() + (task.recurrence_interval || 1) * 7);
          }
          break;

        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + (task.recurrence_interval || 1));
          if (task.day_of_month) {
            const targetDay = Math.min(task.day_of_month, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate());
            nextDate.setDate(targetDay);
          }
          break;

        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3 * (task.recurrence_interval || 1));
          if (task.month_of_year) {
            nextDate.setMonth((task.month_of_year - 1) % 12);
          }
          break;

        case 'annually':
        case 'annual':
          nextDate.setFullYear(nextDate.getFullYear() + (task.recurrence_interval || 1));
          if (task.month_of_year) {
            nextDate.setMonth((task.month_of_year - 1) % 12);
          }
          if (task.day_of_month) {
            const targetDay = Math.min(task.day_of_month, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate());
            nextDate.setDate(targetDay);
          }
          break;

        default:
          console.warn(`Unknown recurrence type: ${task.recurrence_type}`);
          return null;
      }

      return nextDate;
    } catch (error) {
      console.error(`Error calculating next due date for task ${task.id}:`, error);
      return null;
    }
  }

  /**
   * Legacy method maintained for backward compatibility
   * 
   * This method provides a simplified interface for basic recurrence
   * calculations while routing to the enhanced calculation logic.
   * 
   * @deprecated Use calculateMonthlyDemand for enhanced weekday support
   */
  static calculateOccurrences(
    recurrenceType: string,
    interval: number = 1
  ): number {
    console.warn('⚠️ [RECURRENCE CALCULATOR] Using deprecated calculateOccurrences method');
    
    // Simple fallback calculation for legacy compatibility
    switch (recurrenceType.toLowerCase()) {
      case 'weekly':
        return 4.33 / interval; // Legacy weekly calculation
      case 'monthly':
        return 1 / interval;
      case 'quarterly':
        return 0.33 / interval;
      case 'annually':
      case 'annual':
        return 0.083 / interval;
      default:
        console.warn(`⚠️ [RECURRENCE CALCULATOR] Unknown recurrence type: ${recurrenceType}`);
        return 0;
    }
  }

  /**
   * Utility method to check if a date is within a given period
   * 
   * @param date The date to check
   * @param startDate Start of the period
   * @param endDate End of the period
   * @returns boolean indicating if date is in period
   */
  static isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
    const checkDate = new Date(date);
    return checkDate >= startDate && checkDate <= endDate;
  }

  /**
   * Utility method to get month from date
   * 
   * @param date Date object or date string
   * @returns 0-based month index (0=January, 11=December)
   */
  static getMonthFromDate(date: Date | string): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getMonth();
  }
}
