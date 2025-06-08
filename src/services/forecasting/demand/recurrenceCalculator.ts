
import { addMonths, addDays, addWeeks, addYears, isValid, differenceInDays } from 'date-fns';
import { RecurringTaskDB } from '@/types/task';
import { RecurrenceCalculation } from '@/types/demand';

/**
 * Enhanced Recurrence Calculator Service
 * Now includes robust input validation, circuit breakers, and error handling
 */
export class RecurrenceCalculator {
  // Circuit breaker constants to prevent infinite loops
  private static readonly MAX_ITERATIONS = 1000;
  private static readonly MAX_DATE_RANGE_DAYS = 5000; // ~13.7 years
  private static readonly MIN_INTERVAL = 1;
  private static readonly MAX_INTERVAL = 100;

  /**
   * Calculate monthly demand from recurrence patterns with comprehensive validation
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    try {
      // Input validation
      const validationResult = this.validateInputs(task, startDate, endDate);
      if (!validationResult.isValid) {
        console.warn(`RecurrenceCalculator: Invalid inputs for task ${task.id}:`, validationResult.errors);
        return this.createEmptyCalculation(task.id);
      }

      // Calculate with safeguards
      const monthlyOccurrences = this.calculateRecurrenceFrequencySafe(task);
      const monthlyHours = monthlyOccurrences * task.estimated_hours;

      // Generate occurrence dates with circuit breaker
      const nextDueDates = this.generateOccurrenceDatesSafe(task, startDate, endDate);

      return {
        taskId: task.id,
        monthlyOccurrences,
        monthlyHours,
        nextDueDates
      };
    } catch (error) {
      console.error(`RecurrenceCalculator: Error calculating monthly demand for task ${task.id}:`, error);
      return this.createEmptyCalculation(task.id);
    }
  }

  /**
   * Comprehensive input validation
   */
  private static validateInputs(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate task object
    if (!task || !task.id) {
      errors.push('Task object is invalid or missing ID');
    }

    if (!task.recurrence_type) {
      errors.push('Recurrence type is missing');
    }

    if (task.estimated_hours < 0 || task.estimated_hours > 1000) {
      errors.push(`Invalid estimated hours: ${task.estimated_hours}`);
    }

    // Validate dates
    if (!isValid(startDate)) {
      errors.push('Start date is invalid');
    }

    if (!isValid(endDate)) {
      errors.push('End date is invalid');
    }

    if (isValid(startDate) && isValid(endDate)) {
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }

      const daysDifference = differenceInDays(endDate, startDate);
      if (daysDifference > this.MAX_DATE_RANGE_DAYS) {
        errors.push(`Date range too large: ${daysDifference} days (max: ${this.MAX_DATE_RANGE_DAYS})`);
      }
    }

    // Validate recurrence interval
    const interval = task.recurrence_interval || 1;
    if (interval < this.MIN_INTERVAL || interval > this.MAX_INTERVAL) {
      errors.push(`Invalid recurrence interval: ${interval} (must be between ${this.MIN_INTERVAL} and ${this.MAX_INTERVAL})`);
    }

    // Validate recurrence type
    const validTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'];
    if (!validTypes.includes(task.recurrence_type)) {
      errors.push(`Invalid recurrence type: ${task.recurrence_type}`);
    }

    // Validate due date if present
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      if (!isValid(dueDate)) {
        errors.push('Due date is invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate recurrence frequency with bounds checking
   */
  private static calculateRecurrenceFrequencySafe(task: RecurringTaskDB): number {
    const interval = Math.max(this.MIN_INTERVAL, Math.min(this.MAX_INTERVAL, task.recurrence_interval || 1));
    
    let frequency: number;
    
    switch (task.recurrence_type) {
      case 'Daily':
        frequency = 30 / interval;
        break;
      case 'Weekly':
        frequency = 4 / interval;
        break;
      case 'Monthly':
        frequency = 1 / interval;
        break;
      case 'Quarterly':
        frequency = (1 / interval) / 3;
        break;
      case 'Annually':
        frequency = (1 / interval) / 12;
        break;
      default:
        console.warn(`Unknown recurrence type: ${task.recurrence_type}, defaulting to monthly`);
        frequency = 1;
    }

    // Ensure reasonable bounds
    return Math.max(0, Math.min(100, frequency));
  }

  /**
   * Generate occurrence dates with circuit breaker protection
   */
  private static generateOccurrenceDatesSafe(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): Date[] {
    const dates: Date[] = [];
    
    if (!task.due_date) {
      return dates;
    }

    let currentDate: Date;
    try {
      currentDate = new Date(task.due_date);
      if (!isValid(currentDate)) {
        console.warn(`Invalid due date for task ${task.id}: ${task.due_date}`);
        return dates;
      }
    } catch (error) {
      console.warn(`Error parsing due date for task ${task.id}:`, error);
      return dates;
    }

    const interval = Math.max(this.MIN_INTERVAL, Math.min(this.MAX_INTERVAL, task.recurrence_interval || 1));
    let iterations = 0;

    // Move to start of forecast period
    while (currentDate < startDate && iterations < this.MAX_ITERATIONS) {
      currentDate = this.getNextOccurrenceSafe(currentDate, task.recurrence_type, interval);
      iterations++;
    }

    if (iterations >= this.MAX_ITERATIONS) {
      console.warn(`Circuit breaker triggered while advancing to start date for task ${task.id}`);
      return dates;
    }

    // Generate dates within the forecast period
    iterations = 0;
    while (currentDate <= endDate && iterations < this.MAX_ITERATIONS) {
      if (isValid(currentDate)) {
        dates.push(new Date(currentDate));
      }
      
      currentDate = this.getNextOccurrenceSafe(currentDate, task.recurrence_type, interval);
      iterations++;

      // Additional safety check: ensure we're making progress
      if (dates.length > 1) {
        const lastTwo = dates.slice(-2);
        if (lastTwo[1].getTime() <= lastTwo[0].getTime()) {
          console.warn(`Date progression stalled for task ${task.id}, breaking loop`);
          break;
        }
      }
    }

    if (iterations >= this.MAX_ITERATIONS) {
      console.warn(`Circuit breaker triggered during date generation for task ${task.id}, generated ${dates.length} dates`);
    }

    return dates;
  }

  /**
   * Calculate next occurrence with bounds checking and error handling
   */
  private static getNextOccurrenceSafe(
    currentDate: Date,
    recurrenceType: string,
    interval: number
  ): Date {
    try {
      // Validate inputs
      if (!isValid(currentDate)) {
        throw new Error('Invalid current date');
      }

      if (interval < this.MIN_INTERVAL || interval > this.MAX_INTERVAL) {
        throw new Error(`Invalid interval: ${interval}`);
      }

      let nextDate: Date;

      switch (recurrenceType) {
        case 'Daily':
          nextDate = addDays(currentDate, interval);
          break;
        case 'Weekly':
          nextDate = addWeeks(currentDate, interval);
          break;
        case 'Monthly':
          nextDate = addMonths(currentDate, interval);
          break;
        case 'Quarterly':
          nextDate = addMonths(currentDate, interval * 3);
          break;
        case 'Annually':
          nextDate = addYears(currentDate, interval);
          break;
        default:
          console.warn(`Unknown recurrence type: ${recurrenceType}, defaulting to monthly`);
          nextDate = addMonths(currentDate, 1);
      }

      // Validate result
      if (!isValid(nextDate)) {
        throw new Error('Generated invalid next date');
      }

      // Ensure we're moving forward in time
      if (nextDate <= currentDate) {
        throw new Error('Next date is not after current date');
      }

      return nextDate;
    } catch (error) {
      console.error(`Error calculating next occurrence:`, error);
      // Fallback: add one month to current date
      return addMonths(currentDate, 1);
    }
  }

  /**
   * Create empty calculation result for error cases
   */
  private static createEmptyCalculation(taskId: string): RecurrenceCalculation {
    return {
      taskId,
      monthlyOccurrences: 0,
      monthlyHours: 0,
      nextDueDates: []
    };
  }
}
