
/**
 * Metrics Calculator
 * 
 * Calculates performance and filtering metrics
 */

import { DemandMatrixData } from '@/types/demand';
import { FilteringMetrics } from './types';

export class MetricsCalculator {
  /**
   * Calculate filtering efficiency metrics
   */
  static calculateFilteringMetrics(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData
  ): FilteringMetrics {
    const originalCount = originalData.dataPoints.length;
    const filteredCount = filteredData.dataPoints.length;
    
    const dataReduction = originalCount > 0 
      ? ((originalCount - filteredCount) / originalCount) * 100 
      : 0;

    const filterEfficiency = originalCount > 0 
      ? (filteredCount / originalCount) * 100 
      : 100;

    // Simple processing speed metric (items per ms would need timing data)
    const processingSpeed = filteredCount;

    return {
      filterEfficiency,
      dataReduction,
      processingSpeed
    };
  }

  /**
   * Calculate data reduction percentage
   */
  static calculateDataReduction(originalCount: number, filteredCount: number): number {
    if (originalCount === 0) return 0;
    return Math.round(((originalCount - filteredCount) / originalCount) * 100);
  }

  /**
   * Generate filtering summary
   */
  static generateFilteringSummary(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData
  ): {
    originalCount: number;
    filteredCount: number;
    reductionPercentage: number;
    demandReduction: number;
  } {
    const originalCount = originalData.dataPoints.length;
    const filteredCount = filteredData.dataPoints.length;
    const reductionPercentage = this.calculateDataReduction(originalCount, filteredCount);
    
    const demandReduction = originalData.totalDemand > 0 
      ? Math.round(((originalData.totalDemand - filteredData.totalDemand) / originalData.totalDemand) * 100)
      : 0;

    return {
      originalCount,
      filteredCount,
      reductionPercentage,
      demandReduction
    };
  }
}
