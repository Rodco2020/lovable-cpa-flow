
/**
 * Due Date Calculator Service
 * 
 * Handles calculation of next due dates for recurring tasks based on
 * their recurrence patterns and intervals.
 */

/**
 * Calculate next due date for a recurring task
 * 
 * @param recurringTask - The recurring task object with recurrence settings
 * @returns Next due date or null if calculation fails
 */
export const calculateNextDueDate = (recurringTask: any): Date | null => {
  const now = new Date();
  
  switch (recurringTask.recurrence_type) {
    case 'Daily':
      return new Date(now.getTime() + (recurringTask.recurrence_interval || 1) * 24 * 60 * 60 * 1000);
    case 'Weekly':
      return new Date(now.getTime() + (recurringTask.recurrence_interval || 1) * 7 * 24 * 60 * 60 * 1000);
    case 'Monthly':
      const monthlyDate = new Date(now);
      monthlyDate.setMonth(monthlyDate.getMonth() + (recurringTask.recurrence_interval || 1));
      if (recurringTask.day_of_month) {
        monthlyDate.setDate(recurringTask.day_of_month);
      }
      return monthlyDate;
    case 'Quarterly':
      const quarterlyDate = new Date(now);
      quarterlyDate.setMonth(quarterlyDate.getMonth() + 3 * (recurringTask.recurrence_interval || 1));
      return quarterlyDate;
    case 'Annually':
      const annualDate = new Date(now);
      annualDate.setFullYear(annualDate.getFullYear() + (recurringTask.recurrence_interval || 1));
      if (recurringTask.month_of_year) {
        annualDate.setMonth(recurringTask.month_of_year - 1);
      }
      if (recurringTask.day_of_month) {
        annualDate.setDate(recurringTask.day_of_month);
      }
      return annualDate;
    default:
      return null;
  }
};
