
/**
 * Number formatting and rounding utilities
 * Provides consistent number display across the application
 */

/**
 * Round a number to specified decimal places using proper rounding
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Format hours with consistent decimal places
 */
export function formatHours(hours: number, decimals: number = 1): string {
  const rounded = roundToDecimals(hours, decimals);
  return `${rounded.toFixed(decimals)}h`;
}

/**
 * Format percentage with consistent decimal places
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
  const rounded = roundToDecimals(percentage, decimals);
  return `${rounded.toFixed(decimals)}%`;
}

/**
 * Format a number for display with consistent decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const rounded = roundToDecimals(value, decimals);
  return rounded.toFixed(decimals);
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format capacity values specifically (hours with 1 decimal place)
 */
export function formatCapacity(hours: number): string {
  return formatHours(hours, 1);
}

/**
 * Format utilization percentage (1 decimal place)
 */
export function formatUtilization(percentage: number): string {
  return formatPercentage(percentage, 1);
}

/**
 * Safe division with rounding to avoid floating point precision issues
 */
export function safeDivide(numerator: number, denominator: number, decimals: number = 2): number {
  if (denominator === 0) return 0;
  const result = numerator / denominator;
  return roundToDecimals(result, decimals);
}

/**
 * Calculate utilization percentage with proper rounding
 */
export function calculateUtilization(demand: number, capacity: number): number {
  if (capacity === 0) return 0;
  const percentage = (demand / capacity) * 100;
  return roundToDecimals(percentage, 1);
}
