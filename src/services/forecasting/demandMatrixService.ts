
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';
import { DemandMatrixOrchestrator } from './demand/demandMatrixOrchestrator';
import { DemandMatrixCacheService } from './demand/demandMatrixCacheService';
import { DemandMatrixValidationService } from './demand/demandMatrixValidationService';
import { PeriodProcessingService } from './demand/matrixTransformer/periodProcessingService';

/**
 * Demand Matrix Service - ENHANCED WITH CACHE INVALIDATION SUPPORT
 * 
 * This service now delegates to focused services for better maintainability:
 * - DemandMatrixOrchestrator: Coordination and business logic with cache invalidation
 * - DemandMatrixCacheService: Enhanced caching operations with aggregation strategy support
 * - DemandMatrixValidationService: Validation logic
 */
export class DemandMatrixService {
  /**
   * Generate demand matrix forecast with optional filters and cache invalidation
   * ENHANCED: Includes cache clearing for staff aggregation scenarios
   */
  static async generateDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    activeFilters?: {
      preferredStaff?: (string | number | null | undefined)[];
      skills?: string[];
      clients?: string[];
    }
  ): Promise<{ matrixData: DemandMatrixData }> {
    console.log(`🎯 [DEMAND MATRIX SERVICE] ========= SERVICE ENTRY POINT =========`);
    console.log(`🎯 [DEMAND MATRIX SERVICE] Service call parameters:`, {
      mode,
      activeFiltersProvided: !!activeFilters,
      preferredStaffCount: activeFilters?.preferredStaff?.length || 0,
      preferredStaffValues: activeFilters?.preferredStaff,
      skillsCount: activeFilters?.skills?.length || 0,
      clientsCount: activeFilters?.clients?.length || 0
    });

    // CRITICAL: Check if this is a staff aggregation request and clear cache preemptively
    const hasStaffFilter = activeFilters?.preferredStaff && activeFilters.preferredStaff.length > 0;
    
    if (hasStaffFilter) {
      console.log(`🚨 [DEMAND MATRIX SERVICE] STAFF FILTER DETECTED - Pre-clearing staff aggregation cache`);
      DemandMatrixCacheService.forceInvalidateStaffAggregationCache();
      
      // Also show current cache state for debugging
      const cacheStats = DemandMatrixCacheService.getCacheStats();
      console.log(`📊 [DEMAND MATRIX SERVICE] Cache state after clearing:`, cacheStats);
    }

    return DemandMatrixOrchestrator.generateDemandMatrix(mode, activeFilters);
  }

  /**
   * Validate demand matrix data
   */
  static validateDemandMatrixData(matrixData: DemandMatrixData): string[] {
    return DemandMatrixValidationService.validateDemandMatrixData(matrixData);
  }

  /**
   * Get demand matrix cache key with aggregation strategy support
   * ENHANCED: Now includes aggregation strategy for proper cache isolation
   */
  static getDemandMatrixCacheKey(
    mode: DemandMatrixMode, 
    startDate: Date,
    aggregationStrategy?: 'skill-based' | 'staff-based'
  ): string {
    return DemandMatrixCacheService.getDemandMatrixCacheKey(mode, startDate, aggregationStrategy);
  }

  /**
   * Clear demand matrix cache with optional strategy filtering
   * ENHANCED: Supports clearing specific aggregation strategy entries
   */
  static clearCache(aggregationStrategy?: 'skill-based' | 'staff-based'): void {
    DemandMatrixCacheService.clearCache(aggregationStrategy);
  }

  /**
   * Force clear staff aggregation cache - for troubleshooting
   * NEW: Direct access to force invalidation of staff-based cached data
   */
  static forceInvalidateStaffAggregationCache(): void {
    console.log(`🚨 [DEMAND MATRIX SERVICE] Force invalidating staff aggregation cache...`);
    DemandMatrixCacheService.forceInvalidateStaffAggregationCache();
  }

  /**
   * Get cache statistics with enhanced debugging
   */
  static getCacheStats() {
    return DemandMatrixCacheService.getCacheStats();
  }

  /**
   * Generate months with proper date boundaries for forecast calculations
   * PHASE 1 FIX: Use PeriodProcessingService for proper month generation
   */
  static generateMonthsWithDates(
    forecastStartDate: Date,
    forecastEndDate: Date
  ): Array<{ key: string; label: string; startDate: Date; endDate: Date }> {
    console.log(`📅 [DEMAND MATRIX SERVICE] Generating months with date boundaries:`, {
      forecastStartDate: forecastStartDate.toISOString(),
      forecastEndDate: forecastEndDate.toISOString()
    });

    // Generate month sequence from start to end date
    const startPeriod = `${forecastStartDate.getFullYear()}-${String(forecastStartDate.getMonth() + 1).padStart(2, '0')}`;
    const endDate = new Date(forecastEndDate);
    const monthCount = Math.ceil((endDate.getTime() - forecastStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000)) + 1;
    
    const periods = PeriodProcessingService.generatePeriodSequence(startPeriod, monthCount);
    
    const monthsWithDates = periods.map(period => {
      const { startDate, endDate } = PeriodProcessingService.getPeriodDateRange(period);
      
      return {
        key: period,
        label: PeriodProcessingService.formatPeriodLabel(period),
        startDate,
        endDate
      };
    });

    console.log(`✅ [DEMAND MATRIX SERVICE] Generated ${monthsWithDates.length} months with dates:`, 
      monthsWithDates.map(m => ({
        key: m.key,
        label: m.label,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate.toISOString()
      }))
    );

    return monthsWithDates;
  }
}
