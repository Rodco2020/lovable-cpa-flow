
/**
 * Grid Style Utilities for Demand Matrix
 * 
 * Handles color coding and styling logic for grid cells
 */

/**
 * Get color class for hours-based cells
 */
export const getHoursCellColorClass = (hours: number): string => {
  if (hours === 0) return 'bg-slate-50 text-slate-400';
  if (hours < 10) return 'bg-blue-50 text-blue-700';
  if (hours < 50) return 'bg-blue-100 text-blue-800';
  if (hours < 100) return 'bg-blue-200 text-blue-900';
  return 'bg-blue-300 text-blue-950 font-semibold';
};

/**
 * Get color class for revenue-based cells (expected revenue)
 */
export const getRevenueCellColorClass = (revenue: number): string => {
  if (revenue === 0) return 'bg-slate-50 text-slate-400';
  if (revenue < 1000) return 'bg-green-50 text-green-700';
  if (revenue < 5000) return 'bg-green-100 text-green-800';
  if (revenue < 20000) return 'bg-green-200 text-green-900';
  return 'bg-green-300 text-green-950 font-semibold';
};

/**
 * Get color class for suggested revenue cells
 */
export const getSuggestedRevenueCellColorClass = (revenue: number): string => {
  if (revenue === 0) return 'bg-slate-50 text-slate-400';
  if (revenue < 1000) return 'bg-emerald-50 text-emerald-700';
  if (revenue < 5000) return 'bg-emerald-100 text-emerald-800';
  if (revenue < 20000) return 'bg-emerald-200 text-emerald-900';
  return 'bg-emerald-300 text-emerald-950 font-semibold';
};

/**
 * Get color class for expected less suggested cells
 */
export const getExpectedLessSuggestedCellColorClass = (amount: number): string => {
  if (amount === 0) return 'bg-slate-50 text-slate-400';
  if (amount > 0) {
    // Positive values (expected exceeds suggested) - orange tones
    if (amount < 1000) return 'bg-orange-50 text-orange-700';
    if (amount < 5000) return 'bg-orange-100 text-orange-800';
    if (amount < 10000) return 'bg-orange-200 text-orange-900';
    return 'bg-orange-300 text-orange-950 font-semibold';
  } else {
    // Negative values (suggested exceeds expected) - red tones
    const absAmount = Math.abs(amount);
    if (absAmount < 1000) return 'bg-red-50 text-red-700';
    if (absAmount < 5000) return 'bg-red-100 text-red-800';
    if (absAmount < 10000) return 'bg-red-200 text-red-900';
    return 'bg-red-300 text-red-950 font-semibold';
  }
};

/**
 * Get color class for hourly rate cells
 */
export const getRateCellColorClass = (rate: number): string => {
  if (rate === 0) return 'bg-slate-50 text-slate-400';
  if (rate < 50) return 'bg-purple-50 text-purple-700';
  if (rate < 100) return 'bg-purple-100 text-purple-800';
  if (rate < 200) return 'bg-purple-200 text-purple-900';
  return 'bg-purple-300 text-purple-950 font-semibold';
};
