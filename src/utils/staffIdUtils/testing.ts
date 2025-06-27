
/**
 * Staff ID Testing Utilities
 * 
 * This module provides comprehensive testing and validation functions for
 * staff ID utilities, including automated test suites and validation
 * reporting for ensuring robust functionality.
 */

import { normalizeStaffId, compareStaffIds, isStaffIdInArray } from './core';

/**
 * Test staff ID normalization and comparison functions with comprehensive validation
 * 
 * @returns Test results for validation with detailed reporting
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
