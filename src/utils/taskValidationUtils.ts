
import { RecurrencePattern } from "@/types/task";

/**
 * Validates a recurrence pattern to ensure it has all required fields for its type
 */
export function validateRecurrencePattern(pattern: RecurrencePattern): boolean {
  // All patterns must have a type
  if (!pattern.type) return false;
  
  switch (pattern.type) {
    case 'Daily':
      // Daily patterns should have an interval
      return typeof pattern.interval === 'number' && pattern.interval > 0;
      
    case 'Weekly':
      // Weekly patterns should have an interval and weekdays array
      return (
        typeof pattern.interval === 'number' && 
        pattern.interval > 0 && 
        Array.isArray(pattern.weekdays) && 
        pattern.weekdays.length > 0
      );
      
    case 'Monthly':
      // Monthly patterns should have an interval and dayOfMonth
      return (
        typeof pattern.interval === 'number' && 
        pattern.interval > 0 && 
        typeof pattern.dayOfMonth === 'number' &&
        pattern.dayOfMonth >= 1 &&
        pattern.dayOfMonth <= 31
      );
      
    case 'Quarterly':
      // Quarterly patterns should have a dayOfMonth
      return (
        typeof pattern.dayOfMonth === 'number' &&
        pattern.dayOfMonth >= 1 &&
        pattern.dayOfMonth <= 31
      );
      
    case 'Annually':
      // Annually patterns should have a monthOfYear and dayOfMonth
      return (
        typeof pattern.monthOfYear === 'number' &&
        pattern.monthOfYear >= 1 &&
        pattern.monthOfYear <= 12 &&
        typeof pattern.dayOfMonth === 'number' &&
        pattern.dayOfMonth >= 1 &&
        pattern.dayOfMonth <= 31
      );
      
    case 'Custom':
      // Custom patterns should have customOffsetDays
      return typeof pattern.customOffsetDays === 'number';
      
    default:
      return false;
  }
}

/**
 * Calculates the next occurrence date for a recurring task
 */
export function calculateNextOccurrence(
  pattern: RecurrencePattern, 
  startDate: Date = new Date()
): Date | null {
  try {
    const baseDate = new Date(startDate);
    
    switch (pattern.type) {
      case 'Daily':
        if (!pattern.interval) return null;
        baseDate.setDate(baseDate.getDate() + pattern.interval);
        return baseDate;
        
      case 'Weekly':
        if (!pattern.interval || !pattern.weekdays?.length) return null;
        
        // Find the next weekday that's in our pattern.weekdays array
        let daysToAdd = 1;
        let currentDay = baseDate.getDay();
        
        while (daysToAdd < 8) {
          const nextDay = (currentDay + daysToAdd) % 7;
          if (pattern.weekdays.includes(nextDay)) {
            baseDate.setDate(baseDate.getDate() + daysToAdd);
            return baseDate;
          }
          daysToAdd++;
        }
        
        // If we didn't find a day in this week, add interval weeks and use first day
        baseDate.setDate(baseDate.getDate() + 7 * pattern.interval);
        currentDay = baseDate.getDay();
        daysToAdd = 0;
        
        while (daysToAdd < 7) {
          const checkDay = (currentDay + daysToAdd) % 7;
          if (pattern.weekdays.includes(checkDay)) {
            baseDate.setDate(baseDate.getDate() + daysToAdd);
            return baseDate;
          }
          daysToAdd++;
        }
        
        return null;
        
      case 'Monthly':
        if (!pattern.interval || !pattern.dayOfMonth) return null;
        
        const currentMonth = baseDate.getMonth();
        const targetMonth = (currentMonth + pattern.interval) % 12;
        const targetYear = baseDate.getFullYear() + Math.floor((currentMonth + pattern.interval) / 12);
        
        const result = new Date(targetYear, targetMonth, pattern.dayOfMonth);
        return result;
        
      case 'Quarterly':
        if (!pattern.dayOfMonth) return null;
        
        const currentQuarterMonth = Math.floor(baseDate.getMonth() / 3) * 3;
        const nextQuarterMonth = (currentQuarterMonth + 3) % 12;
        const yearOffset = Math.floor((currentQuarterMonth + 3) / 12);
        
        return new Date(
          baseDate.getFullYear() + yearOffset,
          nextQuarterMonth,
          pattern.dayOfMonth
        );
        
      case 'Annually':
        if (!pattern.monthOfYear || !pattern.dayOfMonth) return null;
        
        const nextYear = baseDate.getMonth() >= pattern.monthOfYear - 1 ? 
          baseDate.getFullYear() + 1 : 
          baseDate.getFullYear();
          
        return new Date(
          nextYear,
          pattern.monthOfYear - 1,
          pattern.dayOfMonth
        );
        
      case 'Custom':
        if (typeof pattern.customOffsetDays !== 'number') return null;
        
        // Calculate month-end and add offset days
        const currentMonth = baseDate.getMonth();
        const lastDay = new Date(baseDate.getFullYear(), currentMonth + 1, 0);
        
        lastDay.setDate(lastDay.getDate() + pattern.customOffsetDays);
        return lastDay;
        
      default:
        return null;
    }
  } catch (error) {
    console.error("Error calculating next occurrence date:", error);
    return null;
  }
}
