
/**
 * Grid Layout Utilities for Demand Matrix
 * 
 * Handles layout calculations and grid structure logic
 */

/**
 * Get the display label for a row (skill or client)
 */
export const getRowLabel = (skillOrClient: string): string => {
  // For both skill and client modes, the value is already the display name
  return skillOrClient;
};

/**
 * Calculate grid template rows based on data
 */
export const calculateGridTemplateRows = (rowCount: number, additionalRows: number): string => {
  return `auto repeat(${rowCount + additionalRows}, auto)`;
};

/**
 * Log matrix rendering information for debugging
 */
export const logMatrixRendering = (groupingMode: 'skill' | 'client', rowItemsCount: number, monthsCount: number): void => {
  console.log(`🎯 [MATRIX GRID] Rendering ${groupingMode} matrix with ${rowItemsCount} ${groupingMode}s and ${monthsCount} months`);
};
