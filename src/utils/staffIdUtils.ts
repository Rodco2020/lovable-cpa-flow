
/**
 * Staff ID Normalization Utilities
 * 
 * Provides consistent staff ID formatting across the application to prevent
 * data type mismatches in filtering and comparison operations.
 */

/**
 * Normalize staff ID to a consistent format for reliable comparisons
 * 
 * @param id - Staff ID in any format (string, number, null, undefined)
 * @returns Normalized staff ID as lowercase string, or undefined if invalid
 */
export const normalizeStaffId = (id: string | number | null | undefined): string | undefined => {
  if (id === null || id === undefined || id === '') {
    return undefined;
  }
  
  const stringId = String(id).trim();
  
  if (stringId === '' || stringId === 'null' || stringId === 'undefined') {
    return undefined;
  }
  
  return stringId.toLowerCase();
};

/**
 * Compare two staff IDs using normalized format
 * 
 * @param id1 - First staff ID
 * @param id2 - Second staff ID
 * @returns True if IDs match after normalization
 */
export const compareStaffIds = (
  id1: string | number | null | undefined,
  id2: string | number | null | undefined
): boolean => {
  const normalizedId1 = normalizeStaffId(id1);
  const normalizedId2 = normalizeStaffId(id2);
  
  // Both are undefined/null
  if (!normalizedId1 && !normalizedId2) {
    return true;
  }
  
  // One is undefined/null, other is not
  if (!normalizedId1 || !normalizedId2) {
    return false;
  }
  
  return normalizedId1 === normalizedId2;
};

/**
 * Check if a staff ID exists in an array of staff IDs
 * 
 * @param targetId - Staff ID to search for
 * @param staffIds - Array of staff IDs to search in
 * @returns True if targetId is found in the array
 */
export const isStaffIdInArray = (
  targetId: string | number | null | undefined,
  staffIds: (string | number | null | undefined)[]
): boolean => {
  const normalizedTarget = normalizeStaffId(targetId);
  
  if (!normalizedTarget) {
    return false;
  }
  
  return staffIds.some(id => {
    const normalizedId = normalizeStaffId(id);
    return normalizedId === normalizedTarget;
  });
};
