
/**
 * Filtering Validator for Performance Module
 */

export interface DataIntegrityCheck {
  isValid: boolean;
  issues: string[];
}

export class FilteringValidator {
  static validateData<T>(data: T[]): DataIntegrityCheck {
    const issues: string[] = [];

    if (!Array.isArray(data)) {
      issues.push('Data is not an array');
    }

    if (data.length === 0) {
      issues.push('Data array is empty');
    }

    // Check for null/undefined items
    const nullItems = data.filter(item => item == null).length;
    if (nullItems > 0) {
      issues.push(`Found ${nullItems} null/undefined items`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static validateFilters<T>(filters: Array<(item: T) => boolean>): DataIntegrityCheck {
    const issues: string[] = [];

    if (!Array.isArray(filters)) {
      issues.push('Filters is not an array');
    }

    if (filters.length === 0) {
      issues.push('No filters provided');
    }

    const invalidFilters = filters.filter(f => typeof f !== 'function').length;
    if (invalidFilters > 0) {
      issues.push(`Found ${invalidFilters} non-function filters`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
