
/**
 * ENHANCED Staff ID Utilities with COMPREHENSIVE DEBUGGING
 * 
 * This utility provides staff ID normalization with detailed logging
 * to help diagnose the preferred staff filtering issue.
 */

/**
 * ENHANCED: Normalize staff ID with comprehensive debugging
 */
export function normalizeStaffId(staffId: any): string | null {
  console.group('🔍 [STAFF ID UTILS] normalizeStaffId function called');
  console.log('📋 Input analysis:', {
    inputValue: staffId,
    inputType: typeof staffId,
    isNull: staffId === null,
    isUndefined: staffId === undefined,
    isString: typeof staffId === 'string',
    isNumber: typeof staffId === 'number',
    toString: staffId?.toString?.(),
    length: staffId?.length
  });

  // Handle null/undefined
  if (staffId === null || staffId === undefined) {
    console.log('❌ Null/undefined input - returning null');
    console.groupEnd();
    return null;
  }

  // Handle empty strings
  if (typeof staffId === 'string' && staffId.trim() === '') {
    console.log('❌ Empty string input - returning null');
    console.groupEnd();
    return null;
  }

  // Convert to string and trim
  const normalizedId = String(staffId).trim();
  
  console.log('✅ Normalization complete:', {
    originalValue: staffId,
    normalizedValue: normalizedId,
    wasModified: staffId !== normalizedId,
    finalLength: normalizedId.length
  });
  
  console.groupEnd();
  return normalizedId;
}

/**
 * ENHANCED: Validate if a staff ID is properly formatted
 */
export function isValidStaffId(staffId: any): boolean {
  const normalized = normalizeStaffId(staffId);
  const isValid = normalized !== null && normalized.length > 0;
  
  console.log('🔍 [STAFF ID VALIDATION]:', {
    input: staffId,
    normalized,
    isValid,
    reason: !isValid ? 'Null, undefined, or empty after normalization' : 'Valid'
  });
  
  return isValid;
}
