
/**
 * Demand Matrix Validator
 * 
 * Validates demand matrix data structure and integrity
 */

import { DemandMatrixData } from '@/types/demand';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DemandMatrixValidator {
  static validate(data: DemandMatrixData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required properties
    if (!data.months) {
      errors.push('Missing months array');
    } else if (!Array.isArray(data.months)) {
      errors.push('Months must be an array');
    }

    if (!data.skills) {
      errors.push('Missing skills array');
    } else if (!Array.isArray(data.skills)) {
      errors.push('Skills must be an array');
    }

    if (!data.dataPoints) {
      errors.push('Missing dataPoints array');
    } else if (!Array.isArray(data.dataPoints)) {
      errors.push('DataPoints must be an array');
    }

    if (!data.skillSummary) {
      errors.push('Missing skillSummary array');
    } else if (!Array.isArray(data.skillSummary)) {
      errors.push('SkillSummary must be an array');
    }

    // Check numeric properties
    if (typeof data.totalDemand !== 'number') {
      errors.push('TotalDemand must be a number');
    }

    if (typeof data.totalTasks !== 'number') {
      errors.push('TotalTasks must be a number');
    }

    if (typeof data.totalClients !== 'number') {
      errors.push('TotalClients must be a number');
    }

    // Warnings for empty data
    if (data.dataPoints?.length === 0) {
      warnings.push('No data points found');
    }

    if (data.skills?.length === 0) {
      warnings.push('No skills found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
