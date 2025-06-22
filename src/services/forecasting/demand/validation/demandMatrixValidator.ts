
/**
 * Demand Matrix Validator
 * 
 * Validates demand matrix data structure and content integrity
 */

import { DemandMatrixData } from '@/types/demand';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export class DemandMatrixValidator {
  /**
   * Validate demand matrix data structure
   */
  static validateDemandMatrix(data: DemandMatrixData): ValidationResult {
    const issues: string[] = [];

    if (!data) {
      issues.push('Matrix data is null or undefined');
      return { isValid: false, issues };
    }

    // Validate required properties
    if (!Array.isArray(data.months)) {
      issues.push('Months array is missing or invalid');
    }

    if (!Array.isArray(data.skills)) {
      issues.push('Skills array is missing or invalid');
    }

    if (!Array.isArray(data.dataPoints)) {
      issues.push('Data points array is missing or invalid');
    }

    if (!Array.isArray(data.skillSummary)) {
      issues.push('Skill summary array is missing or invalid');
    }

    // Validate numeric properties
    if (typeof data.totalDemand !== 'number') {
      issues.push('Total demand must be a number');
    }

    if (typeof data.totalTasks !== 'number') {
      issues.push('Total tasks must be a number');
    }

    if (typeof data.totalClients !== 'number') {
      issues.push('Total clients must be a number');
    }

    // Validate data consistency
    if (data.dataPoints && data.skills) {
      const skillsInData = new Set(data.dataPoints.map(point => point.skillType));
      const declaredSkills = new Set(data.skills);
      
      skillsInData.forEach(skill => {
        if (!declaredSkills.has(skill)) {
          issues.push(`Skill '${skill}' found in data points but not in skills array`);
        }
      });
    }

    // Validate data points structure
    if (data.dataPoints) {
      data.dataPoints.forEach((point, index) => {
        if (!point.month) {
          issues.push(`Data point ${index} missing month`);
        }
        if (!point.skillType) {
          issues.push(`Data point ${index} missing skillType`);
        }
        if (typeof point.demandHours !== 'number') {
          issues.push(`Data point ${index} demandHours must be a number`);
        }
        if (typeof point.taskCount !== 'number') {
          issues.push(`Data point ${index} taskCount must be a number`);
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate skill summary data
   */
  static validateSkillSummary(skillSummary: any[]): ValidationResult {
    const issues: string[] = [];

    if (!Array.isArray(skillSummary)) {
      issues.push('Skill summary must be an array');
      return { isValid: false, issues };
    }

    skillSummary.forEach((skill, index) => {
      if (!skill.skillType) {
        issues.push(`Skill summary ${index} missing skillType`);
      }
      if (typeof skill.totalDemand !== 'number') {
        issues.push(`Skill summary ${index} totalDemand must be a number`);
      }
      if (typeof skill.taskCount !== 'number') {
        issues.push(`Skill summary ${index} taskCount must be a number`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
