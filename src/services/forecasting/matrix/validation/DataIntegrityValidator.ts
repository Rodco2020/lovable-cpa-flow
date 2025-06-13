
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { MatrixData, MatrixDataPoint } from '../types';
import { SkillType } from '@/types/task';

/**
 * Data Integrity Validation for Matrix Transformations
 * Provides comprehensive validation to detect data corruption
 */
export class DataIntegrityValidator {
  /**
   * Validate that transformed matrix preserves original demand data
   */
  static validateDemandPreservation(
    originalDemand: DemandMatrixData, 
    transformedMatrix: MatrixData
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate total demand preservation
    if (originalDemand.totalDemand !== transformedMatrix.totalDemand) {
      errors.push(
        `Total demand not preserved: original=${originalDemand.totalDemand}, transformed=${transformedMatrix.totalDemand}`
      );
    }
    
    // Validate skill count preservation
    if (originalDemand.skills.length !== transformedMatrix.skills.length) {
      warnings.push(
        `Skill count changed: original=${originalDemand.skills.length}, transformed=${transformedMatrix.skills.length}`
      );
    }
    
    // Validate skill-by-skill demand preservation
    const skillDemandErrors = this.validateSkillDemandPreservation(originalDemand, transformedMatrix);
    errors.push(...skillDemandErrors);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: {
        originalTotalDemand: originalDemand.totalDemand,
        transformedTotalDemand: transformedMatrix.totalDemand,
        skillsOriginal: originalDemand.skills.length,
        skillsTransformed: transformedMatrix.skills.length
      }
    };
  }
  
  /**
   * Validate skill demand preservation at granular level
   */
  private static validateSkillDemandPreservation(
    originalDemand: DemandMatrixData, 
    transformedMatrix: MatrixData
  ): string[] {
    const errors: string[] = [];
    
    // Create skill demand maps for comparison
    const originalSkillDemand = this.createSkillDemandMap(originalDemand.dataPoints);
    const transformedSkillDemand = this.createMatrixSkillDemandMap(transformedMatrix.dataPoints);
    
    // Check each original skill
    originalDemand.skills.forEach(skill => {
      const originalDemand = originalSkillDemand.get(String(skill).trim()) || 0;
      const transformedDemand = transformedSkillDemand.get(String(skill).trim()) || 0;
      
      if (originalDemand !== transformedDemand) {
        errors.push(
          `Skill '${skill}' demand not preserved: original=${originalDemand}, transformed=${transformedDemand}`
        );
      }
    });
    
    return errors;
  }
  
  /**
   * Create skill demand map from demand data points
   */
  private static createSkillDemandMap(dataPoints: DemandDataPoint[]): Map<string, number> {
    const skillDemandMap = new Map<string, number>();
    
    dataPoints.forEach(dp => {
      const skillKey = String(dp.skillType).trim();
      const currentDemand = skillDemandMap.get(skillKey) || 0;
      skillDemandMap.set(skillKey, currentDemand + dp.demandHours);
    });
    
    return skillDemandMap;
  }
  
  /**
   * Create skill demand map from matrix data points
   */
  private static createMatrixSkillDemandMap(dataPoints: MatrixDataPoint[]): Map<string, number> {
    const skillDemandMap = new Map<string, number>();
    
    dataPoints.forEach(dp => {
      const skillKey = String(dp.skillType).trim();
      const currentDemand = skillDemandMap.get(skillKey) || 0;
      skillDemandMap.set(skillKey, currentDemand + dp.demandHours);
    });
    
    return skillDemandMap;
  }
  
  /**
   * Validate skill mapping integrity
   */
  static validateSkillMapping(
    originalSkills: SkillType[], 
    transformedSkills: SkillType[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Create normalized skill sets for comparison
    const originalNormalized = new Set(originalSkills.map(s => String(s).trim()));
    const transformedNormalized = new Set(transformedSkills.map(s => String(s).trim()));
    
    // Check for missing skills
    originalNormalized.forEach(skill => {
      if (!transformedNormalized.has(skill)) {
        errors.push(`Skill '${skill}' missing from transformed data`);
      }
    });
    
    // Check for unexpected skills
    transformedNormalized.forEach(skill => {
      if (!originalNormalized.has(skill)) {
        warnings.push(`Unexpected skill '${skill}' found in transformed data`);
      }
    });
    
    // Check for whitespace corruption
    const whitespaceIssues = this.detectWhitespaceIssues(originalSkills, transformedSkills);
    warnings.push(...whitespaceIssues);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      details: {
        originalSkills: originalSkills.length,
        transformedSkills: transformedSkills.length,
        missingSkills: originalNormalized.size - transformedNormalized.size,
        extraSkills: transformedNormalized.size - originalNormalized.size
      }
    };
  }
  
  /**
   * Detect whitespace or formatting issues in skill keys
   */
  private static detectWhitespaceIssues(
    originalSkills: SkillType[], 
    transformedSkills: SkillType[]
  ): string[] {
    const issues: string[] = [];
    
    originalSkills.forEach(skill => {
      const original = String(skill);
      const trimmed = original.trim();
      
      if (original !== trimmed) {
        issues.push(`Skill '${skill}' has whitespace that may cause mapping issues`);
      }
    });
    
    transformedSkills.forEach(skill => {
      const transformed = String(skill);
      const trimmed = transformed.trim();
      
      if (transformed !== trimmed) {
        issues.push(`Transformed skill '${skill}' has whitespace issues`);
      }
    });
    
    return issues;
  }
  
  /**
   * Validate data flow integrity at checkpoint
   */
  static validateDataFlowCheckpoint(
    checkpointName: string,
    inputData: any,
    outputData: any,
    expectedTransformation: (input: any) => any
  ): ValidationResult {
    const errors: string[] = [];
    
    try {
      const expectedOutput = expectedTransformation(inputData);
      
      // Perform deep comparison for critical fields
      if (JSON.stringify(expectedOutput) !== JSON.stringify(outputData)) {
        errors.push(`Data flow corruption detected at checkpoint '${checkpointName}'`);
      }
    } catch (error) {
      errors.push(`Data flow validation failed at checkpoint '${checkpointName}': ${error}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      details: {
        checkpointName,
        inputDataType: typeof inputData,
        outputDataType: typeof outputData
      }
    };
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
}
