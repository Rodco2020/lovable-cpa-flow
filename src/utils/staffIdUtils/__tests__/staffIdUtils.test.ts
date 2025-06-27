
/**
 * Comprehensive Test Suite for Staff ID Utilities
 * 
 * This test suite validates all functionality of the refactored staff ID utilities
 * to ensure 100% backward compatibility and correct behavior across all modules.
 */

import {
  normalizeStaffId,
  compareStaffIds,
  isStaffIdInArray,
  validateStaffIdArray,
  findStaffIdMatches,
  testStaffIdUtilities
} from '../index';

describe('Staff ID Utilities - Refactored', () => {
  describe('normalizeStaffId', () => {
    it('should normalize string IDs to lowercase', () => {
      expect(normalizeStaffId('ABC-123')).toBe('abc-123');
      expect(normalizeStaffId('UUID-CAPS')).toBe('uuid-caps');
      expect(normalizeStaffId('MixedCase')).toBe('mixedcase');
    });

    it('should normalize numeric IDs to string', () => {
      expect(normalizeStaffId(123)).toBe('123');
      expect(normalizeStaffId(0)).toBe('0');
    });

    it('should handle null and undefined values', () => {
      expect(normalizeStaffId(null)).toBeUndefined();
      expect(normalizeStaffId(undefined)).toBeUndefined();
      expect(normalizeStaffId('')).toBeUndefined();
      expect(normalizeStaffId('  ')).toBeUndefined();
    });

    it('should handle string representations of null/undefined', () => {
      expect(normalizeStaffId('null')).toBeUndefined();
      expect(normalizeStaffId('undefined')).toBeUndefined();
    });
  });

  describe('compareStaffIds', () => {
    it('should match IDs after normalization', () => {
      expect(compareStaffIds('ABC-123', 'abc-123')).toBe(true);
      expect(compareStaffIds(123, '123')).toBe(true);
      expect(compareStaffIds('UUID', 'uuid')).toBe(true);
    });

    it('should not match different IDs', () => {
      expect(compareStaffIds('ABC-123', 'def-456')).toBe(false);
      expect(compareStaffIds(123, 456)).toBe(false);
    });

    it('should handle null/undefined comparisons', () => {
      expect(compareStaffIds(null, undefined)).toBe(true);
      expect(compareStaffIds(null, null)).toBe(true);
      expect(compareStaffIds(undefined, undefined)).toBe(true);
      expect(compareStaffIds('abc', null)).toBe(false);
      expect(compareStaffIds(null, 'abc')).toBe(false);
    });
  });

  describe('isStaffIdInArray', () => {
    it('should find matching IDs in arrays', () => {
      expect(isStaffIdInArray('ABC-123', ['abc-123', 'def-456'])).toBe(true);
      expect(isStaffIdInArray(123, [123, 456])).toBe(true);
    });

    it('should not find non-matching IDs', () => {
      expect(isStaffIdInArray('ABC-123', ['def-456', 'ghi-789'])).toBe(false);
      expect(isStaffIdInArray(123, [456, 789])).toBe(false);
    });

    it('should handle empty arrays and null values', () => {
      expect(isStaffIdInArray('ABC-123', [])).toBe(false);
      expect(isStaffIdInArray(null, ['abc-123'])).toBe(false);
      expect(isStaffIdInArray(undefined, ['abc-123'])).toBe(false);
    });
  });

  describe('validateStaffIdArray', () => {
    it('should validate clean arrays', () => {
      const result = validateStaffIdArray(['abc-123', 'def-456']);
      expect(result.isValid).toBe(true);
      expect(result.validIds).toEqual(['abc-123', 'def-456']);
      expect(result.invalidIds).toEqual([]);
      expect(result.duplicates).toEqual([]);
    });

    it('should detect invalid IDs', () => {
      const result = validateStaffIdArray(['abc-123', null, undefined, '']);
      expect(result.isValid).toBe(false);
      expect(result.validIds).toEqual(['abc-123']);
      expect(result.invalidIds).toEqual([null, undefined, '']);
    });

    it('should detect duplicates', () => {
      const result = validateStaffIdArray(['ABC-123', 'abc-123', 'def-456']);
      expect(result.isValid).toBe(false);
      expect(result.duplicates).toContain('abc-123');
    });
  });

  describe('findStaffIdMatches', () => {
    it('should find matches between arrays', () => {
      const result = findStaffIdMatches(
        ['ABC-123', 'def-456'],
        ['abc-123', 'ghi-789']
      );
      expect(result.matches).toContain('abc-123');
      expect(result.totalMatches).toBe(1);
    });

    it('should identify non-matching IDs', () => {
      const result = findStaffIdMatches(
        ['ABC-123', 'def-456'],
        ['abc-123', 'ghi-789']
      );
      expect(result.onlyInArray1).toContain('def-456');
      expect(result.onlyInArray2).toContain('ghi-789');
    });

    it('should handle empty arrays', () => {
      const result = findStaffIdMatches([], ['abc-123']);
      expect(result.matches).toEqual([]);
      expect(result.onlyInArray2).toContain('abc-123');
    });
  });

  describe('testStaffIdUtilities', () => {
    it('should run comprehensive tests and pass', () => {
      const testResult = testStaffIdUtilities();
      expect(testResult.allTestsPass).toBe(true);
      expect(testResult.testResults.normalization).toBe(true);
      expect(testResult.testResults.comparison).toBe(true);
      expect(testResult.testResults.arraySearch).toBe(true);
    });

    it('should provide detailed test results', () => {
      const testResult = testStaffIdUtilities();
      expect(testResult.testDetails).toBeDefined();
      expect(testResult.testDetails.normalization).toBeInstanceOf(Array);
      expect(testResult.testDetails.comparison).toBeInstanceOf(Array);
      expect(testResult.testDetails.arraySearch).toBeInstanceOf(Array);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across all functions', () => {
      const testIds = ['ABC-123', 123, 'def-456', null, undefined];
      const normalizedIds = testIds.map(normalizeStaffId).filter(Boolean);
      
      // Test that validation matches normalization results
      const validation = validateStaffIdArray(testIds);
      expect(validation.normalizedIds).toEqual(normalizedIds);
      
      // Test that comparison works with normalized results
      expect(compareStaffIds('ABC-123', normalizedIds[0])).toBe(true);
      expect(compareStaffIds(123, normalizedIds[1])).toBe(true);
    });
  });
});
