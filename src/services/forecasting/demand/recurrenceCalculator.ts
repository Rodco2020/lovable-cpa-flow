
import { addMonths, endOfMonth } from 'date-fns';
import { RecurringTaskDB } from '@/types/task';
import { RecurrenceCalculation } from '@/types/demand';

/**
 * Recurrence Calculator Service
 * Handles all recurrence pattern calculations for demand forecasting
 */
export class RecurrenceCalculator {
  /**
   * Calculate monthly demand from recurrence patterns
   */
  static calculateMonthlyDemand(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    const monthlyOccurrences = this.calculateRecurrenceFrequency(task);
    const monthlyHours = monthlyOccurrences * task.estimated_hours;

    return {
      taskId: task.id,
      monthlyOccurrences,
      monthlyHours,
      nextDueDates: this.generateOccurrenceDates(task, startDate, endDate)
    };
  }

  /**
   * Calculate how many times a task occurs per month based on recurrence pattern
   */
  private static calculateRecurrenceFrequency(task: RecurringTaskDB): number {
    const { recurrence_type, recurrence_interval = 1 } = task;

    switch (recurrence_type) {
      case 'Daily':
        return 30 / recurrence_interval; // Approximate monthly occurrences
      case 'Weekly':
        return 4 / recurrence_interval; // Approximate weekly to monthly
      case 'Monthly':
        return 1 / recurrence_interval;
      case 'Quarterly':
        return (1 / recurrence_interval) / 3; // Convert quarterly to monthly
      case 'Annually':
        return (1 / recurrence_interval) / 12; // Convert annually to monthly
      default:
        return 1; // Default to monthly
    }
  }

  /**
   * Generate specific occurrence dates for a task within the forecast period
   */
  private static generateOccurrenceDates(
    task: RecurringTaskDB,
    startDate: Date,
    endDate: Date
  ): Date[] {
    const dates: Date[] = [];
    const { recurrence_type, recurrence_interval = 1, due_date } = task;
    
    if (!due_date) return dates;

    let currentDate = new Date(due_date);
    
    // Ensure we start within the forecast period
    while (currentDate < startDate) {
      currentDate = this.getNextOccurrence(currentDate, recurrence_type, recurrence_interval);
    }

    // Generate dates within the period
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = this.getNextOccurrence(currentDate, recurrence_type, recurrence_interval);
    }

    return dates;
  }

  /**
   * Calculate the next occurrence date based on recurrence pattern
   */
  private static getNextOccurrence(
    currentDate: Date,
    recurrenceType: string,
    interval: number
  ): Date {
    switch (recurrenceType) {
      case 'Daily':
        return addMonths(currentDate, 0); // For daily, we'll use monthly approximation
      case 'Weekly':
        return addMonths(currentDate, interval * 0.25); // Weekly to monthly approximation
      case 'Monthly':
        return addMonths(currentDate, interval);
      case 'Quarterly':
        return addMonths(currentDate, interval * 3);
      case 'Annually':
        return addMonths(currentDate, interval * 12);
      default:
        return addMonths(currentDate, 1);
    }
  }
}
