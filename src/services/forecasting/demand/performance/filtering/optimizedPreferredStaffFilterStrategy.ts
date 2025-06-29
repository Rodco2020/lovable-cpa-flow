
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
   * Optimized data point filtering with pre-computed lookup sets and COMPREHENSIVE DEBUGGING
   */
  protected shouldIncludeDataPoint(dataPoint: any, filters: DemandFilters): boolean {
    console.log(`🔍 [OPTIMIZED STAFF FILTER - DEBUG] Processing dataPoint:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.month,
      monthLabel: dataPoint.monthLabel,
      demandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      hasTaskBreakdown: !!dataPoint.taskBreakdown,
      taskBreakdownLength: dataPoint.taskBreakdown?.length || 0
    });

    if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
      console.log(`❌ [OPTIMIZED STAFF FILTER - DEBUG] No task breakdown found, excluding dataPoint`);
      return false;
    }

    // Get or create optimized staff lookup set
    const lookupSet = this.getStaffLookupSet(filters.preferredStaff);
    
    console.log(`🎯 [OPTIMIZED STAFF FILTER - DEBUG] Filter criteria:`, {
      originalPreferredStaff: filters.preferredStaff,
      normalizedLookupSet: Array.from(lookupSet),
      lookupSetSize: lookupSet.size
    });

    // Process each task in the breakdown with detailed logging
    let foundMatch = false;
    for (let i = 0; i < dataPoint.taskBreakdown.length; i++) {
      const task = dataPoint.taskBreakdown[i];
      
      console.log(`📋 [OPTIMIZED STAFF FILTER - DEBUG] Processing task ${i + 1}/${dataPoint.taskBreakdown.length}:`, {
        taskName: task.taskName,
        clientName: task.clientName,
        skillType: task.skillType,
        preferredStaffId: task.preferredStaffId,
        preferredStaffName: task.preferredStaffName,
        hasPreferredStaffId: !!task.preferredStaffId,
        hasPreferredStaffName: !!task.preferredStaffName
      });

      if (task.preferredStaffId) {
        const normalizedStaffId = normalizeStaffId(task.preferredStaffId);
        const isMatch = normalizedStaffId && lookupSet.has(normalizedStaffId);
        
        console.log(`🔍 [OPTIMIZED STAFF FILTER - DEBUG] Staff ID comparison:`, {
          originalStaffId: task.preferredStaffId,
          normalizedStaffId: normalizedStaffId,
          isInLookupSet: isMatch,
          lookupSetContains: Array.from(lookupSet),
          comparisonResult: isMatch ? 'MATCH FOUND' : 'NO MATCH'
        });

        if (isMatch) {
          console.log(`✅ [OPTIMIZED STAFF FILTER - DEBUG] MATCH FOUND! Task will be included:`, {
            taskName: task.taskName,
            clientName: task.clientName,
            matchedStaffId: normalizedStaffId,
            originalStaffId: task.preferredStaffId
          });
          foundMatch = true;
          break; // Early exit on first match
        }
      } else {
        console.log(`⚠️ [OPTIMIZED STAFF FILTER - DEBUG] Task has no preferredStaffId, skipping`);
      }
    }

    const finalResult = foundMatch;
    console.log(`🏁 [OPTIMIZED STAFF FILTER - DEBUG] Final decision for dataPoint:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.monthLabel,
      taskCount: dataPoint.taskBreakdown.length,
      foundMatch: foundMatch,
      willIncludeDataPoint: finalResult ? 'YES' : 'NO'
    });

    return finalResult;
  }

  /**
   * Get or create optimized staff lookup set with caching and enhanced logging
   */
  private getStaffLookupSet(preferredStaff: (string | number | null | undefined)[]): Set<string> {
    const cacheKey = JSON.stringify(preferredStaff.sort());
    
    console.log(`🏗️ [OPTIMIZED STAFF FILTER - DEBUG] Creating lookup set:`, {
      originalPreferredStaff: preferredStaff,
      cacheKey: cacheKey.substring(0, 100) + '...' // Truncate for readability
    });
    
    if (OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.has(cacheKey)) {
      const cachedSet = OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.get(cacheKey)!;
      console.log(`🎯 [OPTIMIZED STAFF FILTER - DEBUG] Using cached lookup set:`, Array.from(cachedSet));
      return cachedSet;
    }

    // Create optimized lookup set
    const lookupSet = new Set<string>();
    preferredStaff.forEach((id, index) => {
      const normalized = normalizeStaffId(id);
      console.log(`🔄 [OPTIMIZED STAFF FILTER - DEBUG] Normalizing staff ID ${index + 1}:`, {
        originalId: id,
        normalizedId: normalized,
        willAdd: !!normalized
      });
      
      if (normalized) {
        lookupSet.add(normalized);
      }
    });

    // Cache the result
    OptimizedPreferredStaffFilterStrategy.staffIdLookupCache.set(cacheKey, lookupSet);
    
    console.log(`🚀 [OPTIMIZED STAFF FILTER - DEBUG] Created and cached lookup set:`, {
      originalCount: preferredStaff.length,
      normalizedCount: lookupSet.size,
      finalLookupSet: Array.from(lookupSet)
    });
    
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
