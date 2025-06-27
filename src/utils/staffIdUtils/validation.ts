
/**
 * Staff ID Validation Utilities
 * 
 * This module provides validation and analysis functions for staff ID arrays,
 * including duplicate detection, normalization success tracking, and comprehensive
 * validation reporting for robust staff ID operations.
 */

import { normalizeStaffId } from './core';

/**
 * Validate an array of staff IDs with comprehensive analysis
 * 
 * @param staffIds - Array of staff IDs to validate
 * @returns Validation result with detailed analysis
 */
export const validateStaffIdArray = (
  staffIds: (string | number | null | undefined)[]
): {
  isValid: boolean;
  validIds: string[];
  invalidIds: (string | number | null | undefined)[];
  normalizedIds: string[];
  duplicates: string[];
} => {
  const validIds: string[] = [];
  const invalidIds: (string | number | null | undefined)[] = [];
  const normalizedIds: string[] = [];
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  staffIds.forEach(id => {
    const normalized = normalizeStaffId(id);
    if (normalized) {
      validIds.push(String(id));
      normalizedIds.push(normalized);
      
      if (seenIds.has(normalized)) {
        duplicates.push(normalized);
      } else {
        seenIds.add(normalized);
      }
    } else {
      invalidIds.push(id);
    }
  });

  return {
    isValid: invalidIds.length === 0 && duplicates.length === 0,
    validIds,
    invalidIds,
    normalizedIds,
    duplicates
  };
};
