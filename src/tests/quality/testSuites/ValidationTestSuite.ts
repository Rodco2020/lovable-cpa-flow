
import { DemandMatrixData } from '@/types/demand';

/**
 * Validation Test Suite
 * 
 * Provides comprehensive validation tests for demand matrix data
 */
export class ValidationTestSuite {
  
  /**
   * Validate matrix structure
   */
  static validateMatrixStructure(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Data is null or undefined');
      return { isValid: false, errors };
    }
    
    // Check required properties
    if (!data.months || !Array.isArray(data.months)) {
      errors.push('Months array is missing or invalid');
    }
    
    if (!data.skills || !Array.isArray(data.skills)) {
      errors.push('Skills array is missing or invalid');
    }
    
    if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
      errors.push('DataPoints array is missing or invalid');
    }
    
    if (typeof data.totalDemand !== 'number') {
      errors.push('TotalDemand must be a number');
    }
    
    if (typeof data.totalTasks !== 'number') {
      errors.push('TotalTasks must be a number');
    }
    
    if (typeof data.totalClients !== 'number') {
      errors.push('TotalClients must be a number');
    }
    
    if (!data.skillSummary || typeof data.skillSummary !== 'object') {
      errors.push('SkillSummary is missing or invalid');
    }
    
    if (!data.clientTotals || !(data.clientTotals instanceof Map)) {
      errors.push('ClientTotals must be a Map');
    }
    
    if (!data.aggregationStrategy || typeof data.aggregationStrategy !== 'string') {
      errors.push('AggregationStrategy is missing or invalid');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * Validate matrix with fee rates
   */
  static validateMatrixWithFeeRates(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // First validate basic structure
    const structureValidation = this.validateMatrixStructure(data);
    if (!structureValidation.isValid) {
      return structureValidation;
    }
    
    // Check for fee rate related data
    if (data.skillFeeRates && !(data.skillFeeRates instanceof Map)) {
      errors.push('SkillFeeRates must be a Map when present');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * Validate revenue calculations
   */
  static validateRevenueCalculations(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // First validate basic structure
    const structureValidation = this.validateMatrixStructure(data);
    if (!structureValidation.isValid) {
      return structureValidation;
    }
    
    // Check revenue-related properties
    if (data.revenueTotals) {
      if (typeof data.revenueTotals.totalSuggestedRevenue !== 'number') {
        errors.push('RevenueTotals.totalSuggestedRevenue must be a number');
      }
      
      if (typeof data.revenueTotals.totalExpectedRevenue !== 'number') {
        errors.push('RevenueTotals.totalExpectedRevenue must be a number');
      }
      
      if (typeof data.revenueTotals.totalExpectedLessSuggested !== 'number') {
        errors.push('RevenueTotals.totalExpectedLessSuggested must be a number');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * Validate client totals
   */
  static validateClientTotals(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // First validate basic structure
    const structureValidation = this.validateMatrixStructure(data);
    if (!structureValidation.isValid) {
      return structureValidation;
    }
    
    // Validate client totals map
    if (data.clientTotals instanceof Map) {
      for (const [clientId, total] of data.clientTotals.entries()) {
        if (typeof clientId !== 'string') {
          errors.push(`Client ID must be a string, got: ${typeof clientId}`);
        }
        
        if (typeof total !== 'number') {
          errors.push(`Client total must be a number for client ${clientId}, got: ${typeof total}`);
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
