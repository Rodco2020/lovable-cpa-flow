
/**
 * Core Filtering Engine
 * 
 * Handles the main filtering operations while preserving exact functionality
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilteringResult, FilteringOptions, PerformanceStats, FilteringMetrics } from './types';
import { SynchronousFilterProcessor } from './synchronousFilterProcessor';
import { MetricsCalculator } from './metricsCalculator';

export class FilteringEngine {
  /**
   * Execute comprehensive filtering with validation and performance monitoring
   * 
   * This preserves the exact functionality from the original enhancedDataFilter.ts
   */
  static async executeFiltering(
    data: DemandMatrixData,
    filters: DemandFilters,
    options: FilteringOptions = {}
  ): Promise<FilteringResult> {
    const {
      enableValidation = true,
      enablePerformanceMonitoring = true,
      enableLogging = true,
      fallbackOnError = true
    } = options;

    const startTime = Date.now();

    if (enableLogging) {
      console.log(`🚀 [ENHANCED FILTER ENGINE] Starting comprehensive filtering:`, {
        originalDataPoints: data.dataPoints.length,
        filtersCount: Object.keys(filters).length,
        enableValidation,
        enablePerformanceMonitoring,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Execute synchronous filtering (preserves original logic)
      const filteredData = SynchronousFilterProcessor.processFilters(data, filters);

      // Calculate performance metrics
      const processingTime = Date.now() - startTime;
      let performanceStats: PerformanceStats | undefined;
      let filteringMetrics: FilteringMetrics | undefined;

      if (enablePerformanceMonitoring) {
        performanceStats = {
          totalProcessingTime: processingTime,
          filterSteps: [
            {
              name: 'complete-filtering',
              duration: processingTime,
              itemsProcessed: data.dataPoints.length
            }
          ]
        };

        filteringMetrics = MetricsCalculator.calculateFilteringMetrics(data, filteredData);
      }

      if (enableLogging) {
        console.log(`✅ [ENHANCED FILTER ENGINE] Filtering completed successfully:`, {
          originalDataPoints: data.dataPoints.length,
          filteredDataPoints: filteredData.dataPoints.length,
          processingTime: `${processingTime}ms`,
          filterEfficiency: filteringMetrics?.filterEfficiency ?? 'not-calculated'
        });
      }

      return {
        filteredData,
        success: true,
        performanceStats
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (enableLogging) {
        console.error(`❌ [ENHANCED FILTER ENGINE] Critical error:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: `${processingTime}ms`,
          fallbackOnError
        });
      }

      if (fallbackOnError) {
        // Return original data as fallback
        return {
          filteredData: data,
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown filtering error']
        };
      } else {
        throw error;
      }
    }
  }
}
