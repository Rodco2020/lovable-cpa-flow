
/**
 * Enhanced Data Filter - Refactored
 * 
 * This refactored version maintains 100% backward compatibility while improving
 * code structure through modular architecture. All existing functionality is preserved.
 * 
 * PRESERVED FUNCTIONALITY:
 * - All filtering methods work exactly the same
 * - Same method signatures and return types
 * - Identical console logging and error handling
 * - Complete backward compatibility
 * 
 * IMPROVEMENTS:
 * - Modular architecture with focused responsibilities
 * - Better testability with isolated services
 * - Improved maintainability and code organization
 * - Clearer separation of concerns
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilteringEngine } from './filteringEngine';
import { SynchronousFilterProcessor } from './synchronousFilterProcessor';
import { ValidationService } from './validationService';
import { MetricsCalculator } from './metricsCalculator';
import { FilteringOptions, FilteringResult } from './types';
import { debugLog } from '../../logger';

export class EnhancedDataFilterRefactored {
  /**
   * Execute comprehensive filtering with validation and performance monitoring
   * 
   * This method preserves the exact functionality from the original enhancedDataFilter.ts
   */
  static async executeComprehensiveFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): Promise<FilteringResult> {
    // Delegate to the FilteringEngine while preserving exact behavior
    return FilteringEngine.executeFiltering(data, filters, options);
  }

  /**
   * Backward-compatible filtering method that uses the enhanced engine
   * 
   * This preserves the exact method signature and behavior from the original
   */
  static optimizeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: any = {}
  ): DemandMatrixData {
    debugLog('Enhanced filtering engine for backward compatibility', { filters });

    try {
      // Use the synchronous filtering processor (preserves original logic exactly)
      return SynchronousFilterProcessor.processFilters(data, filters);
    } catch (error) {
      console.error('❌ [ENHANCED FILTER] Fallback filtering error:', error);
      return data; // Return original data as fallback (preserves original behavior)
    }
  }

  /**
   * Validate filtering results (new method for enhanced validation)
   */
  static validateFilteringResult(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    filteredData: DemandMatrixData
  ) {
    return ValidationService.validateFilteringResult(originalData, filters, filteredData);
  }

  /**
   * Calculate filtering metrics (new method for enhanced metrics)
   */
  static calculateFilteringMetrics(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData
  ) {
    return MetricsCalculator.calculateFilteringMetrics(originalData, filteredData);
  }

  /**
   * Generate filtering summary (new method for enhanced reporting)
   */
  static generateFilteringSummary(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData
  ) {
    return MetricsCalculator.generateFilteringSummary(originalData, filteredData);
  }
}
