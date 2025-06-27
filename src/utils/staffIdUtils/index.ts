
/**
 * Staff ID Normalization Utilities - Main Export
 * 
 * This is the main export file for the refactored staff ID utilities.
 * The utilities have been refactored into focused modules for improved maintainability:
 * 
 * - core.ts: Core normalization and comparison functions
 * - validation.ts: Array validation and analysis utilities
 * - matching.ts: Staff ID matching and search utilities
 * - testing.ts: Comprehensive testing and validation functions
 * 
 * All existing functionality is preserved with no changes to the public API.
 * This refactoring improves code organization while maintaining identical behavior.
 */

// Re-export core functions
export {
  normalizeStaffId,
  compareStaffIds,
  isStaffIdInArray
} from './core';

// Re-export validation functions
export {
  validateStaffIdArray
} from './validation';

// Re-export matching functions
export {
  findStaffIdMatches
} from './matching';

// Re-export testing functions
export {
  testStaffIdUtilities
} from './testing';
