
import { MatrixData, MatrixValidationResult } from './types';
import { MATRIX_CONSTANTS } from './constants';
import { debugLog } from '../logger';

/**
 * Matrix Validator
 * Centralized validation logic for matrix data
 */
export class MatrixValidator {
  /**
   * Validate complete matrix data structure
   */
  static validateMatrixData(matrixData: MatrixData): MatrixValidationResult {
    const issues: string[] = [];
    
    try {
      // Validate months
      const monthIssues = this.validateMonths(matrixData.months);
      issues.push(...monthIssues);
      
      // Validate skills
      const skillIssues = this.validateSkills(matrixData.skills);
      issues.push(...skillIssues);
      
      // Validate data points
      const dataPointIssues = this.validateDataPoints(matrixData.dataPoints, matrixData.months, matrixData.skills);
      issues.push(...dataPointIssues);
      
      // Validate totals
      const totalIssues = this.validateTotals(matrixData);
      issues.push(...totalIssues);
      
      debugLog('Matrix validation completed', {
        issuesFound: issues.length,
        issues: issues.slice(0, 3) // Log first 3 issues only
      });
      
      return {
        isValid: issues.length === 0,
        issues
      };
      
    } catch (error) {
      const errorMessage = `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return {
        isValid: false,
        issues: [errorMessage]
      };
    }
  }
  
  /**
   * Validate months array
   */
  private static validateMonths(months: any[]): string[] {
    const issues: string[] = [];
    
    if (!months || !Array.isArray(months)) {
      issues.push('Months data is missing or not an array');
      return issues;
    }
    
    if (months.length < MATRIX_CONSTANTS.MIN_EXPECTED_MONTHS || 
        months.length > MATRIX_CONSTANTS.MAX_EXPECTED_MONTHS) {
      issues.push(`Expected ${MATRIX_CONSTANTS.MIN_EXPECTED_MONTHS}-${MATRIX_CONSTANTS.MAX_EXPECTED_MONTHS} months, found ${months.length}`);
    }
    
    // Validate month structure
    months.forEach((month, index) => {
      if (!month.key || !month.label || typeof month.index !== 'number') {
        issues.push(`Month at index ${index} has invalid structure`);
      }
    });
    
    return issues;
  }
  
  /**
   * Validate skills array
   */
  private static validateSkills(skills: any[]): string[] {
    const issues: string[] = [];
    
    if (!skills || !Array.isArray(skills)) {
      issues.push('Skills data is missing or not an array');
      return issues;
    }
    
    if (skills.length < MATRIX_CONSTANTS.MIN_EXPECTED_SKILLS) {
      issues.push(`Expected at least ${MATRIX_CONSTANTS.MIN_EXPECTED_SKILLS} skill, found ${skills.length}`);
    }
    
    // Check for duplicate skills
    const uniqueSkills = new Set(skills);
    if (uniqueSkills.size !== skills.length) {
      issues.push('Duplicate skills found');
    }
    
    return issues;
  }
  
  /**
   * Validate data points array
   */
  private static validateDataPoints(dataPoints: any[], months: any[], skills: any[]): string[] {
    const issues: string[] = [];
    
    if (!dataPoints || !Array.isArray(dataPoints)) {
      issues.push('Data points are missing or not an array');
      return issues;
    }
    
    // Check expected number of data points
    const expectedDataPoints = months.length * skills.length;
    if (dataPoints.length !== expectedDataPoints) {
      issues.push(`Expected ${expectedDataPoints} data points, found ${dataPoints.length}`);
    }
    
    // Check for negative values
    const negativeHours = dataPoints.filter(dp => 
      dp.demandHours < 0 || dp.capacityHours < 0
    );
    if (negativeHours.length > 0) {
      issues.push(`Found ${negativeHours.length} data points with negative hours`);
    }
    
    // Validate data point structure
    dataPoints.forEach((dp, index) => {
      if (!dp.skillType || !dp.month || !dp.monthLabel || 
          typeof dp.demandHours !== 'number' || 
          typeof dp.capacityHours !== 'number') {
        issues.push(`Data point at index ${index} has invalid structure`);
      }
    });
    
    return issues;
  }
  
  /**
   * Validate totals consistency
   */
  private static validateTotals(matrixData: MatrixData): string[] {
    const issues: string[] = [];
    
    // Calculate expected totals from data points
    const calculatedDemand = matrixData.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const calculatedCapacity = matrixData.dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const calculatedGap = calculatedDemand - calculatedCapacity;
    
    // Allow small floating point differences
    const tolerance = 0.01;
    
    if (Math.abs(matrixData.totalDemand - calculatedDemand) > tolerance) {
      issues.push('Total demand does not match sum of data points');
    }
    
    if (Math.abs(matrixData.totalCapacity - calculatedCapacity) > tolerance) {
      issues.push('Total capacity does not match sum of data points');
    }
    
    if (Math.abs(matrixData.totalGap - calculatedGap) > tolerance) {
      issues.push('Total gap does not match calculated gap');
    }
    
    return issues;
  }
}
