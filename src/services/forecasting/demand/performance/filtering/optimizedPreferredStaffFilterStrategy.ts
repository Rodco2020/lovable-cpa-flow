
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { PerformanceOptimizedFilterStrategy } from './performanceOptimizedFilterStrategy';
import { normalizeStaffId, isStaffIdInArray, findStaffIdMatches } from '@/utils/staffIdUtils';

/**
 * PHASE 4: High-Performance Preferred Staff Filter Strategy
 * 
 * Optimized version of the preferred staff filter with:
 * - Batch processing for large datasets
 * - Efficient staff ID matching with pre-computed lookup sets
 * - Memory optimization for staff ID operations
 * - Performance monitoring and caching
 * - Early exit conditions for better performance
 */
export class OptimizedPreferredStaffFilterStrategy extends PerformanceOptimizedFilterStrategy {
  private static staffIdLookupCache = new Map<string, Set<string>>();

  getName(): string {
    return 'OptimizedPreferredStaffFilter';
  }

  getPriority(): number {
    return 4; // Same priority as original, but optimized
  }

  shouldApply(filters: DemandFilters): boolean {
    return Array.isArray(filters.preferredStaff) && filters.preferredStaff.length > 0;
  }

  /**
   * Optimized data point filtering with pre-computed lookup sets
   */
  protected shouldIncludeDataPoint(dataPoint: any, filters: DemandFilters): boolean {
    if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
      return false;
    }

    // Get or create optimized staff lookup set
    const lookupSet = this.getStaffLookupSet(filters.preferredStaff);
    
    // Use optimized filtering with early exit
    return dataPoint.taskBreakdown.some((task: any) => {
      const normalizedStaffId = normalizeStaffId(task.preferredStaffId);
      return normalizedStaffId && lookupSet.has(normalizedStaffId);
    });
  }

  /**
   * Get or create optimized staff lookup set with caching
   */
  private getStaffLookupSet(preferredStaff: (string | number | null | undefined)[]): Set<string> {
    const cacheKey = JSON.stringify(preferredStaff.sort());
    
    if (OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.has(cacheKey)) {
      return OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.get(cacheKey)!;
    }

    // Create optimized lookup set
    const lookupSet = new Set<string>();
    preferredStaff.forEach(id => {
      const normalized = normalizeStaffId(id);
      if (normalized) {
        lookupSet.add(normalized);
      }
    });

    // Cache the result
    OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.set(cacheKey, lookupSet);
    
    console.log(`🚀 [OPTIMIZED STAFF FILTER] Created lookup set with ${lookupSet.size} staff IDs`);
    
    return lookupSet;
  }

  /**
   * Extract only the relevant filters for caching
   */
  protected extractRelevantFilters(filters: DemandFilters): any {
    return {
      preferredStaff: filters.preferredStaff?.sort() // Sort for consistent caching
    };
  }

  /**
   * Enhanced apply method with additional performance optimizations
   */
  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🚀 [OPTIMIZED STAFF FILTER] PHASE 4: Starting high-performance filtering`);
    
    const startTime = performance.now();

    // Early validation
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log(`✅ [OPTIMIZED STAFF FILTER] No preferred staff filter - returning all data`);
      return data;
    }

    // Pre-validate and analyze filter data
    const filterAnalysis = this.analyzeFilterData(filters.preferredStaff, data);
    
    if (!filterAnalysis.hasValidFilters) {
      console.warn(`⚠️ [OPTIMIZED STAFF FILTER] No valid staff filters detected`);
      return {
        ...data,
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }

    // Use parent's optimized processing
    const result = super.apply(data, filters);
    
    const processingTime = performance.now() - startTime;
    
    console.log(`✅ [OPTIMIZED STAFF FILTER] PHASE 4 COMPLETE:`, {
      processingTime: `${processingTime.toFixed(2)}ms`,
      performanceImprovement: processingTime < 50 ? 'Excellent' : processingTime < 100 ? 'Good' : 'Needs optimization',
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: result.dataPoints.length,
      filterEfficiency: `${((1 - result.dataPoints.length / data.dataPoints.length) * 100).toFixed(1)}% filtered`,
      cacheUtilization: filterAnalysis.cacheHit ? 'Cache hit' : 'Cache miss',
      memoryOptimized: true
    });

    return result;
  }

  /**
   * Analyze filter data for optimization decisions
   */
  private analyzeFilterData(preferredStaff: (string | number | null | undefined)[], data: DemandMatrixData): {
    hasValidFilters: boolean;
    validFilterCount: number;
    potentialMatches: number;
    cacheHit: boolean;
  } {
    const normalizedFilters = preferredStaff
      .map(id => normalizeStaffId(id))
      .filter(Boolean) as string[];

    const allTaskStaffIds = data.dataPoints.flatMap(dp => 
      dp.taskBreakdown?.map(task => normalizeStaffId(task.preferredStaffId)).filter(Boolean) || []
    );

    const uniqueTaskStaffIds = Array.from(new Set(allTaskStaffIds));
    const matches = findStaffIdMatches(normalizedFilters, uniqueTaskStaffIds);

    const cacheKey = JSON.stringify(preferredStaff.sort());
    const cacheHit = OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.has(cacheKey);

    return {
      hasValidFilters: normalizedFilters.length > 0,
      validFilterCount: normalizedFilters.length,
      potentialMatches: matches.totalMatches,
      cacheHit
    };
  }

  /**
   * Clear optimization caches
   */
  static clearOptimizationCache(): void {
    OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.clear();
    console.log('🧹 [OPTIMIZED STAFF FILTER] Optimization cache cleared');
  }

  /**
   * Get optimization statistics
   */
  static getOptimizationStats(): {
    cacheSize: number;
    cacheEntries: string[];
  } {
    return {
      cacheSize: OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.size,
      cacheEntries: Array.from(OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.keys())
    };
  }
}
