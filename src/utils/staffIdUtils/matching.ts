
/**
 * Staff ID Matching Utilities
 * 
 * This module provides functions for finding matches between staff ID arrays,
 * including intersection analysis and comparison reporting for staff ID
 * filtering and search operations.
 */

import { normalizeStaffId } from './core';

/**
 * Find staff IDs that match between two arrays with detailed analysis
 * 
 * @param array1 - First array of staff IDs
 * @param array2 - Second array of staff IDs
 * @returns Object with matching and non-matching IDs
 */
export const findStaffIdMatches = (
  array1: (string | number | null | undefined)[],
  array2: (string | number | null | undefined)[]
): {
  matches: string[];
  onlyInArray1: string[];
  onlyInArray2: string[];
  totalMatches: number;
} => {
  const normalized1 = array1.map(id => normalizeStaffId(id)).filter(Boolean) as string[];
  const normalized2 = array2.map(id => normalizeStaffId(id)).filter(Boolean) as string[];
  
  const set1 = new Set(normalized1);
  const set2 = new Set(normalized2);
  
  const matches = normalized1.filter(id => set2.has(id));
  const onlyInArray1 = normalized1.filter(id => !set2.has(id));
  const onlyInArray2 = normalized2.filter(id => !set1.has(id));
  
  return {
    matches: Array.from(new Set(matches)), // Remove duplicates
    onlyInArray1: Array.from(new Set(onlyInArray1)),
    onlyInArray2: Array.from(new Set(onlyInArray2)),
    totalMatches: new Set(matches).size
  };
};
