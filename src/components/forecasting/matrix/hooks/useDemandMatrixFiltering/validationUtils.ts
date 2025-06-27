
import { startOfMonth, endOfMonth, differenceInDays, addDays, format } from 'date-fns';
import { MonthRangeValidation, TimeHorizonResult } from './types';

/**
 * Validation utilities for demand matrix filtering
 * 
 * This module handles month range validation and time horizon creation
 * to ensure robust data filtering without out-of-bounds access.
 */

/**
 * Validate and correct month range to prevent out-of-bounds access
 */
export function validateMonthRange(monthRange: { start: number; end: number }, maxMonths: number): MonthRangeValidation {
  const safeStart = Math.max(0, Math.min(monthRange.start, maxMonths - 1));
  const safeEnd = Math.max(safeStart, Math.min(monthRange.end, maxMonths - 1));
  
  if (safeStart !== monthRange.start || safeEnd !== monthRange.end) {
    console.warn(`⚠️ [DEMAND MATRIX] Month range adjusted from [${monthRange.start}, ${monthRange.end}] to [${safeStart}, ${safeEnd}]`);
  }
  
  return { start: safeStart, end: safeEnd };
}

/**
 * Create a validated time horizon that prevents filtering issues
 */
export function createValidatedTimeHorizon(filteredMonths: Array<{ key: string; label: string }>): TimeHorizonResult {
  try {
    if (filteredMonths.length === 0) {
      // Fallback to current month
      const now = new Date();
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    }

    // Use month boundaries for better data matching
    const startDate = startOfMonth(new Date(filteredMonths[0].key + '-01'));
    const endDate = endOfMonth(new Date(filteredMonths[filteredMonths.length - 1].key + '-01'));
    
    // Validate the range
    const daysDiff = differenceInDays(endDate, startDate);
    
    if (daysDiff < 0) {
      console.warn(`⚠️ [TIME HORIZON] Invalid range detected, swapping dates`);
      return { start: endDate, end: startDate };
    }
    
    if (daysDiff === 0) {
      console.warn(`⚠️ [TIME HORIZON] Single-day range, expanding to monthly boundaries`);
      return {
        start: startDate,
        end: endOfMonth(addDays(startDate, 30))
      };
    }
    
    return { start: startDate, end: endDate };
  } catch (error) {
    console.error(`❌ [TIME HORIZON] Error creating time horizon:`, error);
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  }
}

/**
 * Normalize months to ensure they have both key and label properties
 */
export function normalizeMonths(filteredMonths: any[]): Array<{ key: string; label: string }> {
  return filteredMonths.map(month => ({
    key: month.key,
    label: month.label || format(new Date(month.key + '-01'), 'MMM yyyy')
  }));
}
