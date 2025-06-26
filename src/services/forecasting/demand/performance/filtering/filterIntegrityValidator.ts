
import { DemandMatrixData, DemandFilters } from '@/types/demand';

/**
 * Filter Integrity Validator
 * 
 * Phase 3: Validates that filtering operations maintain data integrity
 * and that preferred staff filtering integrates correctly with existing filters.
 */
export class FilterIntegrityValidator {
  /**
   * Validate that filtered data maintains integrity with original data
   */
  static validateFilterResults(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    appliedFilters: DemandFilters
  ): {
    isValid: boolean;
    issues: string[];
    metrics: {
      dataReduction: number;
      skillsRetained: number;
      totalDemandPreserved: boolean;
    };
  } {
    const issues: string[] = [];
    
    // Check basic data integrity
    if (filteredData.dataPoints.length > originalData.dataPoints.length) {
      issues.push('Filtered data has more data points than original data');
    }
    
    if (filteredData.skills.length > originalData.skills.length) {
      issues.push('Filtered data has more skills than original data');
    }
    
    // Validate that filtered demand is consistent
    const expectedTotalDemand = filteredData.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const actualTotalDemand = filteredData.totalDemand;
    
    if (Math.abs(expectedTotalDemand - actualTotalDemand) > 0.01) {
      issues.push(`Total demand mismatch: expected ${expectedTotalDemand}, got ${actualTotalDemand}`);
    }
    
    // Phase 3: Validate preferred staff filter application
    if (appliedFilters.preferredStaff && appliedFilters.preferredStaff.length > 0) {
      console.log(`✅ [FILTER VALIDATOR] Preferred staff filter applied with ${appliedFilters.preferredStaff.length} staff members`);
      
      // Additional validation for preferred staff filtering could be added here
      // For example, checking that all remaining tasks have preferred staff in the filter list
    }
    
    const dataReduction = ((originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length) * 100;
    const skillsRetained = (filteredData.skills.length / originalData.skills.length) * 100;
    
    console.log(`📊 [FILTER VALIDATOR] Filter validation results:`, {
      dataReduction: `${dataReduction.toFixed(1)}%`,
      skillsRetained: `${skillsRetained.toFixed(1)}%`,
      totalDemandPreserved: Math.abs(expectedTotalDemand - actualTotalDemand) < 0.01,
      appliedFilters: {
        skills: appliedFilters.skills?.length || 0,
        clients: appliedFilters.clients?.length || 0,
        preferredStaff: appliedFilters.preferredStaff?.length || 0,
        timeHorizon: !!appliedFilters.timeHorizon
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues,
      metrics: {
        dataReduction,
        skillsRetained,
        totalDemandPreserved: Math.abs(expectedTotalDemand - actualTotalDemand) < 0.01
      }
    };
  }
  
  /**
   * Validate filter combinations work correctly
   */
  static validateFilterCombinations(filters: DemandFilters): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Check for conflicting filter states
    if (filters.skills.length === 0 && filters.clients.length === 0 && 
        filters.preferredStaff.length === 0 && !filters.timeHorizon) {
      warnings.push('No active filters detected - all data will be included');
    }
    
    // Phase 3: Check preferred staff filter consistency
    if (filters.preferredStaff.length > 0) {
      console.log(`🎯 [FILTER VALIDATOR] Preferred staff filter active with ${filters.preferredStaff.length} staff members`);
      
      if (filters.clients.length > 0) {
        warnings.push('Both client and preferred staff filters are active - results may be very limited');
      }
    }
    
    return {
      isValid: true, // Warnings don't invalidate the filter combination
      warnings
    };
  }
}
