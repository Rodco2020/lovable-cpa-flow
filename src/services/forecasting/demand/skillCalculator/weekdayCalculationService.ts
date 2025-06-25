
import { debugLog } from '../../logger';

/**
 * Weekday Calculation Service
 * 
 * Focused service for handling weekday-specific calculations in recurring tasks.
 * Extracted from skillCalculatorCore to provide specialized weekday logic
 * with enhanced accuracy and maintainability.
 * 
 * WEEKDAY CALCULATION DOCUMENTATION:
 * 
 * The system supports accurate weekday-specific calculations for weekly recurring tasks.
 * Instead of using a fixed 4.33 weeks/month approximation, the system calculates based on:
 * 
 * Formula: estimatedHours × numberOfSelectedWeekdays × (30.44 days/month ÷ 7 days/week) ÷ recurrenceInterval
 * 
 * Examples:
 * - Task: 5 hours, Weekly (every 1 week), Weekdays: [1, 3, 5] (Mon, Wed, Fri)
 *   Calculation: 5 × 3 × 4.35 ÷ 1 = 65.25 hours/month
 * 
 * - Task: 8 hours, Bi-weekly (every 2 weeks), Weekdays: [2, 4] (Tue, Thu)
 *   Calculation: 8 × 2 × 4.35 ÷ 2 = 34.8 hours/month
 */
export class WeekdayCalculationService {
  private static readonly DAYS_PER_MONTH = 30.44; // Average days per month
  private static readonly DAYS_PER_WEEK = 7;
  private static readonly WEEKS_PER_MONTH_LEGACY = 4.33; // Legacy fallback calculation

  /**
   * Calculate monthly occurrences for weekly tasks with weekday awareness
   */
  static calculateWeeklyTaskOccurrences(
    task: {
      recurrence_type?: string;
      recurrence_interval?: number;
      weekdays?: number[];
      estimated_hours: number;
      id: string;
      name: string;
    }
  ): {
    monthlyOccurrences: number;
    monthlyHours: number;
    calculationMethod: string;
    usedWeekdayCalculation: boolean;
  } {
    const isWeeklyTask = task.recurrence_type?.toLowerCase() === 'weekly';
    
    if (!isWeeklyTask) {
      return {
        monthlyOccurrences: 0,
        monthlyHours: 0,
        calculationMethod: 'Not a weekly task',
        usedWeekdayCalculation: false
      };
    }

    const interval = task.recurrence_interval || 1;
    const estimatedHours = task.estimated_hours || 0;

    // Check if weekdays are specified and valid
    const hasValidWeekdays = this.validateWeekdays(task.weekdays);
    
    if (hasValidWeekdays && task.weekdays && task.weekdays.length > 0) {
      // Use enhanced weekday-based calculation
      return this.calculateWithWeekdays(task.weekdays, interval, estimatedHours, task);
    } else {
      // Fall back to legacy calculation
      return this.calculateWithLegacyMethod(interval, estimatedHours, task);
    }
  }

  /**
   * Calculate using weekday-aware method
   */
  private static calculateWithWeekdays(
    weekdays: number[],
    interval: number,
    estimatedHours: number,
    task: any
  ): {
    monthlyOccurrences: number;
    monthlyHours: number;
    calculationMethod: string;
    usedWeekdayCalculation: boolean;
  } {
    const numberOfWeekdays = weekdays.length;
    const weeksPerMonth = this.DAYS_PER_MONTH / this.DAYS_PER_WEEK; // ≈ 4.35
    
    // Formula: numberOfWeekdays × weeksPerMonth ÷ interval
    const monthlyOccurrences = (numberOfWeekdays * weeksPerMonth) / interval;
    const monthlyHours = estimatedHours * monthlyOccurrences;

    const calculationMethod = `Weekday-based: ${estimatedHours}h × ${numberOfWeekdays} weekdays × ${weeksPerMonth.toFixed(2)} weeks/month ÷ ${interval} interval = ${monthlyHours.toFixed(2)}h`;

    console.log(`📅 [WEEKDAY CALC] Enhanced calculation for task ${task.id}:`, {
      taskName: task.name,
      weekdays: weekdays,
      weekdayNames: this.getWeekdayNames(weekdays),
      numberOfWeekdays,
      interval,
      estimatedHours,
      weeksPerMonth: weeksPerMonth.toFixed(2),
      monthlyOccurrences: monthlyOccurrences.toFixed(2),
      monthlyHours: monthlyHours.toFixed(2),
      calculationMethod
    });

    return {
      monthlyOccurrences,
      monthlyHours,
      calculationMethod,
      usedWeekdayCalculation: true
    };
  }

  /**
   * Calculate using legacy method (fallback)
   */
  private static calculateWithLegacyMethod(
    interval: number,
    estimatedHours: number,
    task: any
  ): {
    monthlyOccurrences: number;
    monthlyHours: number;
    calculationMethod: string;
    usedWeekdayCalculation: boolean;
  } {
    // Legacy formula: weeksPerMonth ÷ interval
    const monthlyOccurrences = this.WEEKS_PER_MONTH_LEGACY / interval;
    const monthlyHours = estimatedHours * monthlyOccurrences;

    const calculationMethod = `Legacy: ${estimatedHours}h × ${this.WEEKS_PER_MONTH_LEGACY} weeks/month ÷ ${interval} interval = ${monthlyHours.toFixed(2)}h`;

    console.log(`📅 [WEEKDAY CALC] Legacy calculation for task ${task.id}:`, {
      taskName: task.name,
      reason: 'No valid weekdays specified',
      interval,
      estimatedHours,
      weeksPerMonth: this.WEEKS_PER_MONTH_LEGACY,
      monthlyOccurrences: monthlyOccurrences.toFixed(2),
      monthlyHours: monthlyHours.toFixed(2),
      calculationMethod
    });

    return {
      monthlyOccurrences,
      monthlyHours,
      calculationMethod,
      usedWeekdayCalculation: false
    };
  }

  /**
   * Validate weekdays array
   */
  private static validateWeekdays(weekdays?: number[]): boolean {
    if (!Array.isArray(weekdays) || weekdays.length === 0) {
      return false;
    }

    // Check if all weekdays are valid (0-6, Sunday-Saturday)
    return weekdays.every(day => 
      typeof day === 'number' && 
      day >= 0 && 
      day <= 6 && 
      Number.isInteger(day)
    );
  }

  /**
   * Get human-readable weekday names
   */
  private static getWeekdayNames(weekdays: number[]): string[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays.map(day => dayNames[day] || `Unknown(${day})`);
  }

  /**
   * Get calculation statistics for reporting
   */
  static getCalculationStats(tasks: any[]): {
    totalWeeklyTasks: number;
    weekdayCalculationTasks: number;
    legacyCalculationTasks: number;
    weekdayCalculationRate: string;
    averageWeekdaysPerTask: number;
  } {
    const weeklyTasks = tasks.filter(task => 
      task.recurrence_type?.toLowerCase() === 'weekly'
    );

    const weekdayCalculationTasks = weeklyTasks.filter(task => 
      this.validateWeekdays(task.weekdays)
    );

    const legacyCalculationTasks = weeklyTasks.length - weekdayCalculationTasks.length;

    const totalWeekdays = weekdayCalculationTasks.reduce((sum, task) => 
      sum + (task.weekdays?.length || 0), 0
    );

    const averageWeekdaysPerTask = weekdayCalculationTasks.length > 0 
      ? totalWeekdays / weekdayCalculationTasks.length 
      : 0;

    const weekdayCalculationRate = weeklyTasks.length > 0 
      ? `${((weekdayCalculationTasks.length / weeklyTasks.length) * 100).toFixed(1)}%` 
      : '0%';

    return {
      totalWeeklyTasks: weeklyTasks.length,
      weekdayCalculationTasks: weekdayCalculationTasks.length,
      legacyCalculationTasks,
      weekdayCalculationRate,
      averageWeekdaysPerTask: Math.round(averageWeekdaysPerTask * 100) / 100
    };
  }

  /**
   * Log weekday calculation summary for debugging
   */
  static logCalculationSummary(tasks: any[], periodMonth: string): void {
    const stats = this.getCalculationStats(tasks);
    
    if (stats.totalWeeklyTasks > 0) {
      console.log('📅 [WEEKDAY CALC] Calculation summary:', {
        periodMonth,
        weeklyTaskBreakdown: {
          total: stats.totalWeeklyTasks,
          weekdayCalculation: stats.weekdayCalculationTasks,
          legacyCalculation: stats.legacyCalculationTasks,
          weekdayCalculationRate: stats.weekdayCalculationRate
        },
        averageWeekdaysPerTask: stats.averageWeekdaysPerTask,
        enhancementOpportunity: stats.legacyCalculationTasks > 0 
          ? `${stats.legacyCalculationTasks} tasks could benefit from weekday specification`
          : 'All weekly tasks use enhanced weekday calculations'
      });
    }
  }
}
