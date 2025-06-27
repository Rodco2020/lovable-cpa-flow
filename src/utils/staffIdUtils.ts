
/**
 * Staff ID Normalization Utilities - PHASE 3 ENHANCED
 * 
 * Provides consistent staff ID formatting across the application to prevent
 * data type mismatches in filtering and comparison operations.
 * 
 * PHASE 3 enhancements include comprehensive validation, testing utilities,
 * and enhanced comparison functions for robust staff ID operations.
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

/**
 * PHASE 3 ADDITION: Validate an array of staff IDs
 * 
 * @param staffIds - Array of staff IDs to validate
 * @returns Validation result with details
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

/**
 * PHASE 3 ADDITION: Find staff IDs that match between two arrays
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

/**
 * PHASE 3 ADDITION: Test staff ID normalization and comparison functions
 * 
 * @returns Test results for validation
 */
export const testStaffIdUtilities = (): {
  allTestsPass: boolean;
  testResults: { [testName: string]: boolean };
  testDetails: { [testName: string]: any };
} => {
  const testResults: { [testName: string]: boolean } = {};
  const testDetails: { [testName: string]: any } = {};

  // Test normalization
  const normalizationTests = [
    { input: 'ABC-123', expected: 'abc-123' },
    { input: 123, expected: '123' },
    { input: 'UUID-CAPS', expected: 'uuid-caps' },
    { input: null, expected: undefined },
    { input: undefined, expected: undefined },
    { input: '', expected: undefined },
    { input: '  ', expected: undefined }
  ];

  testResults.normalization = normalizationTests.every(test => 
    normalizeStaffId(test.input) === test.expected
  );
  testDetails.normalization = normalizationTests.map(test => ({
    ...test,
    actual: normalizeStaffId(test.input),
    passed: normalizeStaffId(test.input) === test.expected
  }));

  // Test comparison
  const comparisonTests = [
    { id1: 'ABC-123', id2: 'abc-123', expected: true },
    { id1: 'ABC-123', id2: 'def-456', expected: false },
    { id1: null, id2: undefined, expected: true },
    { id1: 'abc', id2: null, expected: false },
    { id1: 123, id2: '123', expected: true }
  ];

  testResults.comparison = comparisonTests.every(test => 
    compareStaffIds(test.id1, test.id2) === test.expected
  );
  testDetails.comparison = comparisonTests.map(test => ({
    ...test,
    actual: compareStaffIds(test.id1, test.id2),
    passed: compareStaffIds(test.id1, test.id2) === test.expected
  }));

  // Test array search
  const arrayTests = [
    { target: 'ABC-123', array: ['abc-123', 'def-456'], expected: true },
    { target: 'ABC-123', array: ['def-456', 'ghi-789'], expected: false },
    { target: null, array: ['abc-123'], expected: false },
    { target: 'ABC-123', array: [], expected: false }
  ];

  testResults.arraySearch = arrayTests.every(test => 
    isStaffIdInArray(test.target, test.array) === test.expected
  );
  testDetails.arraySearch = arrayTests.map(test => ({
    ...test,
    actual: isStaffIdInArray(test.target, test.array),
    passed: isStaffIdInArray(test.target, test.array) === test.expected
  }));

  const allTestsPass = Object.values(testResults).every(result => result);

  return {
    allTestsPass,
    testResults,
    testDetails
  };
};
