
import { MonthInfo } from '@/types/demand';

export interface MonthRangeValidation {
  start: number;
  end: number;
}

export interface TimeHorizonResult {
  start: Date;
  end: Date;
}

/**
 * Validation utilities for demand matrix filtering
 */

export function validateMonthRange(
  monthRange: { start: number; end: number },
  totalMonths: number
): MonthRangeValidation {
  const start = Math.max(0, Math.min(monthRange.start, totalMonths - 1));
  const end = Math.max(start, Math.min(monthRange.end, totalMonths - 1));
  
  return { start, end };
}

export function createValidatedTimeHorizon(months: MonthInfo[]): TimeHorizonResult {
  if (months.length === 0) {
    const now = new Date();
    return {
      start: now,
      end: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    };
  }

  // Use existing dates if available, otherwise create from keys
  const startMonth = months[0];
  const endMonth = months[months.length - 1];
  
  const start = startMonth.startDate || new Date(startMonth.key + '-01');
  const end = endMonth.endDate || new Date(endMonth.key + '-01');
  
  return { start, end };
}

export function normalizeMonths(months: any[]): MonthInfo[] {
  return months.map((month, index) => ({
    key: month.key || `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`,
    label: month.label || `Month ${index + 1}`,
    index: month.index !== undefined ? month.index : index,
    startDate: month.startDate,
    endDate: month.endDate
  }));
}
