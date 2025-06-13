
import { MatrixData } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { debugLog } from '../../logger';

/**
 * Cross-Matrix Consistency Validator
 * 
 * Validates consistency between capacity and demand matrices to ensure
 * identical demand data display and accurate calculations across both views.
 */

export interface CrossMatrixValidationResult {
  isConsistent: boolean;
  demandConsistency: {
    totalDemandMatch: boolean;
    skillDemandMatch: boolean;
    monthlyDemandMatch: boolean;
    inconsistencies: string[];
  };
  capacityIntegrity: {
    calculationsAccurate: boolean;
    gapAnalysisConsistent: boolean;
    issues: string[];
  };
  performance: {
    validationTime: number;
    dataPointsCompared: number;
  };
}

export interface MatrixComparisonData {
  capacityMatrix: MatrixData;
  demandMatrix: DemandMatrixData;
}

export class CrossMatrixValidator {
  /**
   * Validate consistency between matrices
   */
  static validateMatrixConsistency(
    comparisonData: MatrixComparisonData
  ): CrossMatrixValidationResult {
    const startTime = Date.now();
    
    debugLog('Starting cross-matrix consistency validation');
    
    const demandConsistency = this.validateDemandConsistency(
      comparisonData.capacityMatrix,
      comparisonData.demandMatrix
    );
    
    const capacityIntegrity = this.validateCapacityIntegrity(
      comparisonData.capacityMatrix
    );
    
    const validationTime = Date.now() - startTime;
    const dataPointsCompared = comparisonData.capacityMatrix.dataPoints.length + 
                              comparisonData.demandMatrix.dataPoints.length;
    
    const result: CrossMatrixValidationResult = {
      isConsistent: demandConsistency.totalDemandMatch && 
                   demandConsistency.skillDemandMatch && 
                   demandConsistency.monthlyDemandMatch &&
                   capacityIntegrity.calculationsAccurate &&
                   capacityIntegrity.gapAnalysisConsistent,
      demandConsistency,
      capacityIntegrity,
      performance: {
        validationTime,
        dataPointsCompared
      }
    };
    
    debugLog('Cross-matrix validation completed', {
      isConsistent: result.isConsistent,
      validationTime,
      dataPointsCompared,
      totalInconsistencies: demandConsistency.inconsistencies.length,
      capacityIssues: capacityIntegrity.issues.length
    });
    
    return result;
  }

  /**
   * Validate demand data consistency between matrices
   */
  private static validateDemandConsistency(
    capacityMatrix: MatrixData,
    demandMatrix: DemandMatrixData
  ) {
    const inconsistencies: string[] = [];
    
    // 1. Total demand match
    const totalDemandMatch = Math.abs(capacityMatrix.totalDemand - demandMatrix.totalDemand) < 0.01;
    if (!totalDemandMatch) {
      inconsistencies.push(
        `Total demand mismatch: Capacity=${capacityMatrix.totalDemand}, Demand=${demandMatrix.totalDemand}`
      );
    }
    
    // 2. Skill-level demand match
    const skillDemandMap = new Map<string, number>();
    demandMatrix.dataPoints.forEach(dp => {
      const existing = skillDemandMap.get(dp.skillType) || 0;
      skillDemandMap.set(dp.skillType, existing + dp.demandHours);
    });
    
    const capacitySkillDemandMap = new Map<string, number>();
    capacityMatrix.dataPoints.forEach(dp => {
      const existing = capacitySkillDemandMap.get(dp.skillType) || 0;
      capacitySkillDemandMap.set(dp.skillType, existing + dp.demandHours);
    });
    
    let skillDemandMatch = true;
    for (const [skill, demandHours] of skillDemandMap) {
      const capacityDemandHours = capacitySkillDemandMap.get(skill) || 0;
      if (Math.abs(demandHours - capacityDemandHours) > 0.01) {
        inconsistencies.push(
          `Skill ${skill} demand mismatch: Demand=${demandHours}, Capacity=${capacityDemandHours}`
        );
        skillDemandMatch = false;
      }
    }
    
    // 3. Monthly demand match
    const monthlyDemandMap = new Map<string, number>();
    demandMatrix.dataPoints.forEach(dp => {
      const existing = monthlyDemandMap.get(dp.month) || 0;
      monthlyDemandMap.set(dp.month, existing + dp.demandHours);
    });
    
    const capacityMonthlyDemandMap = new Map<string, number>();
    capacityMatrix.dataPoints.forEach(dp => {
      const existing = capacityMonthlyDemandMap.get(dp.month) || 0;
      capacityMonthlyDemandMap.set(dp.month, existing + dp.demandHours);
    });
    
    let monthlyDemandMatch = true;
    for (const [month, demandHours] of monthlyDemandMap) {
      const capacityDemandHours = capacityMonthlyDemandMap.get(month) || 0;
      if (Math.abs(demandHours - capacityDemandHours) > 0.01) {
        inconsistencies.push(
          `Month ${month} demand mismatch: Demand=${demandHours}, Capacity=${capacityDemandHours}`
        );
        monthlyDemandMatch = false;
      }
    }
    
    return {
      totalDemandMatch,
      skillDemandMatch,
      monthlyDemandMatch,
      inconsistencies
    };
  }

  /**
   * Validate capacity calculation integrity
   */
  private static validateCapacityIntegrity(capacityMatrix: MatrixData) {
    const issues: string[] = [];
    
    // 1. Validate gap calculations
    let calculationsAccurate = true;
    let gapAnalysisConsistent = true;
    
    capacityMatrix.dataPoints.forEach(dp => {
      const expectedGap = dp.demandHours - dp.capacityHours;
      if (Math.abs(dp.gap - expectedGap) > 0.01) {
        issues.push(
          `Gap calculation error for ${dp.skillType}-${dp.month}: Expected=${expectedGap}, Actual=${dp.gap}`
        );
        calculationsAccurate = false;
        gapAnalysisConsistent = false;
      }
      
      // Validate utilization calculation
      const expectedUtilization = dp.capacityHours > 0 ? 
        Math.round((dp.demandHours / dp.capacityHours) * 100) : 0;
      
      if (Math.abs(dp.utilizationPercent - expectedUtilization) > 1) {
        issues.push(
          `Utilization calculation error for ${dp.skillType}-${dp.month}: Expected=${expectedUtilization}%, Actual=${dp.utilizationPercent}%`
        );
        calculationsAccurate = false;
      }
    });
    
    // 2. Validate total calculations
    const calculatedTotalDemand = capacityMatrix.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const calculatedTotalCapacity = capacityMatrix.dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const calculatedTotalGap = calculatedTotalDemand - calculatedTotalCapacity;
    
    if (Math.abs(capacityMatrix.totalDemand - calculatedTotalDemand) > 0.01) {
      issues.push(
        `Total demand calculation error: Expected=${calculatedTotalDemand}, Actual=${capacityMatrix.totalDemand}`
      );
      calculationsAccurate = false;
    }
    
    if (Math.abs(capacityMatrix.totalCapacity - calculatedTotalCapacity) > 0.01) {
      issues.push(
        `Total capacity calculation error: Expected=${calculatedTotalCapacity}, Actual=${capacityMatrix.totalCapacity}`
      );
      calculationsAccurate = false;
    }
    
    if (Math.abs(capacityMatrix.totalGap - calculatedTotalGap) > 0.01) {
      issues.push(
        `Total gap calculation error: Expected=${calculatedTotalGap}, Actual=${capacityMatrix.totalGap}`
      );
      calculationsAccurate = false;
      gapAnalysisConsistent = false;
    }
    
    return {
      calculationsAccurate,
      gapAnalysisConsistent,
      issues
    };
  }

  /**
   * Generate validation report
   */
  static generateValidationReport(result: CrossMatrixValidationResult): string {
    const report = [
      '=== CROSS-MATRIX CONSISTENCY VALIDATION REPORT ===',
      `Overall Status: ${result.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}`,
      `Validation Time: ${result.performance.validationTime}ms`,
      `Data Points Compared: ${result.performance.dataPointsCompared}`,
      '',
      '--- Demand Consistency ---',
      `Total Demand Match: ${result.demandConsistency.totalDemandMatch ? 'PASS' : 'FAIL'}`,
      `Skill Demand Match: ${result.demandConsistency.skillDemandMatch ? 'PASS' : 'FAIL'}`,
      `Monthly Demand Match: ${result.demandConsistency.monthlyDemandMatch ? 'PASS' : 'FAIL'}`,
      '',
      '--- Capacity Integrity ---',
      `Calculations Accurate: ${result.capacityIntegrity.calculationsAccurate ? 'PASS' : 'FAIL'}`,
      `Gap Analysis Consistent: ${result.capacityIntegrity.gapAnalysisConsistent ? 'PASS' : 'FAIL'}`,
      '',
      '--- Issues ---'
    ];
    
    if (result.demandConsistency.inconsistencies.length > 0) {
      report.push('Demand Inconsistencies:');
      result.demandConsistency.inconsistencies.forEach(issue => {
        report.push(`  - ${issue}`);
      });
      report.push('');
    }
    
    if (result.capacityIntegrity.issues.length > 0) {
      report.push('Capacity Issues:');
      result.capacityIntegrity.issues.forEach(issue => {
        report.push(`  - ${issue}`);
      });
    }
    
    if (result.isConsistent) {
      report.push('✅ All matrices are consistent and calculations are accurate!');
    } else {
      report.push('❌ Inconsistencies detected - review issues above');
    }
    
    return report.join('\n');
  }
}
