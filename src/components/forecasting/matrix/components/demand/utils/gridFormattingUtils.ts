
/**
 * Grid Formatting Utilities for Demand Matrix
 * 
 * Handles number formatting and display logic
 */

import { formatHours, formatCurrency, formatNumber } from '@/lib/numberUtils';

/**
 * Format hours for display with consistent rounding
 */
export const formatHoursDisplay = (hours: number): string => (hours > 0 ? formatHours(hours, 1) : '0h');

/**
 * Format currency for display
 */
export const formatCurrencyDisplay = (amount: number): string => (amount > 0 ? formatCurrency(amount) : '$0');

/**
 * Format hourly rate for display
 */
export const formatRateDisplay = (rate: number): string => (rate > 0 ? `$${formatNumber(rate, 2)}/h` : '$0/h');

/**
 * Format difference amount for display with + prefix for positive values
 */
export const formatDifferenceDisplay = (amount: number): string => {
  if (amount === 0) return '$0';
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount)}`;
};
