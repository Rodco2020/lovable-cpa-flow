
import { MatrixData } from '../matrixUtils';
import { debugLog } from '../logger';

/**
 * Matrix Data Validator
 * Handles validation of matrix data to ensure it meets expected criteria
 */
export class MatrixDataValidator {
  /**
   * Validate matrix data to ensure it meets expected criteria
   */
  static validateMatrixData(matrixData: MatrixData): string[] {
    const issues: string[] = [];

    // Check for expected number of months (should be 12)
    if (matrixData.months.length !== 12) {
      issues.push(`Expected 12 months, got ${matrixData.months.length}`);
    }

    // Check for minimum expected skills
    if (matrixData.skills.length === 0) {
      issues.push('No skills found in matrix data');
    }

    // Check for data completeness
    const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
    if (matrixData.dataPoints.length !== expectedDataPoints) {
      issues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}. Skills: ${matrixData.skills.length}, Months: ${matrixData.months.length}`);
    }

    // Check for skills consistency in data points
    const dataPointSkills = new Set(matrixData.dataPoints.map(point => point.skillType));
    const matrixSkillsSet = new Set(matrixData.skills);
    
    const missingSkillsInData = matrixData.skills.filter(skill => !dataPointSkills.has(skill));
    const extraSkillsInData = Array.from(dataPointSkills).filter(skill => !matrixSkillsSet.has(skill));
    
    if (missingSkillsInData.length > 0) {
      issues.push(`Skills missing from data points: ${missingSkillsInData.join(', ')}`);
    }
    
    if (extraSkillsInData.length > 0) {
      issues.push(`Extra skills in data points: ${extraSkillsInData.join(', ')}`);
    }

    // Check for negative values
    const negativeValues = matrixData.dataPoints.filter(
      point => point.demandHours < 0 || point.capacityHours < 0
    );
    if (negativeValues.length > 0) {
      issues.push(`Found ${negativeValues.length} data points with negative values`);
    }

    // Check for unreasonable utilization values
    const unreasonableUtilization = matrixData.dataPoints.filter(
      point => point.utilizationPercent < 0 || point.utilizationPercent > 1000
    );
    if (unreasonableUtilization.length > 0) {
      issues.push(`Found ${unreasonableUtilization.length} data points with unreasonable utilization values`);
    }

    if (issues.length > 0) {
      debugLog('Matrix validation issues found:', issues);
    }

    return issues;
  }
}
