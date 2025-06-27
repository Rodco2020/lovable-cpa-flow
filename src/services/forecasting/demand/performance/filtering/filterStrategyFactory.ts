
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';
import { SkillFilterStrategy } from './skillFilterStrategy';
import { ClientFilterStrategy } from './clientFilterStrategy';
import { TimeHorizonFilterStrategy } from './timeHorizonFilterStrategy';
import { OptimizedPreferredStaffFilterStrategy } from './optimizedPreferredStaffFilterStrategy'; // Phase 4: Use optimized version
import { FilterPerformanceMonitor } from './filterPerformanceMonitor';

/**
 * PHASE 4: Enhanced Filter Strategy Factory with Performance Monitoring
 * 
 * Manages all available filter strategies with comprehensive performance tracking,
 * intelligent strategy selection, and optimization recommendations.
 */
export class FilterStrategyFactory {
  private static strategies: BaseFilterStrategy[] = [
    new SkillFilterStrategy(),
    new ClientFilterStrategy(),
    new TimeHorizonFilterStrategy(),
    new OptimizedPreferredStaffFilterStrategy() // Phase 4: Use optimized version
  ];

  private static performanceMonitor = FilterPerformanceMonitor.getInstance();

  /**
   * PHASE 4: High-performance filter application with comprehensive monitoring
   */
  static applyFilters(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🚀 [FILTER FACTORY] PHASE 4: Starting high-performance filter application`);

    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    // Sort strategies by priority (lower numbers first)
    const sortedStrategies = [...this.strategies].sort((a, b) => a.getPriority() - b.getPriority());

    // Apply each applicable strategy with individual performance monitoring
    let filteredData = data;
    const appliedFilters: string[] = [];
    const individualMetrics: any[] = [];

    for (const strategy of sortedStrategies) {
      if (strategy.shouldApply(filters)) {
        const strategyStartTime = performance.now();
        const strategyStartMemory = this.getMemoryUsage();
        
        const originalDataPoints = filteredData.dataPoints.length;
        filteredData = strategy.apply(filteredData, filters);
        const filteredDataPoints = filteredData.dataPoints.length;
        
        const strategyEndTime = performance.now();
        const strategyEndMemory = this.getMemoryUsage();
        const strategyExecutionTime = strategyEndTime - strategyStartTime;

        appliedFilters.push(strategy.getName());

        // Record individual strategy performance
        const strategyMetrics = {
          filterName: strategy.getName(),
          executionTime: strategyExecutionTime,
          dataPointsProcessed: originalDataPoints,
          dataPointsRetained: filteredDataPoints,
          filterEfficiency: originalDataPoints > 0 ? filteredDataPoints / originalDataPoints : 0,
          memoryUsage: {
            before: strategyStartMemory,
            after: strategyEndMemory,
            peak: Math.max(strategyStartMemory, strategyEndMemory)
          },
          cacheStats: {
            hits: 0, // Will be updated by strategy if applicable
            misses: 0,
            hitRate: 0
          },
          timestamp: Date.now()
        };

        individualMetrics.push(strategyMetrics);
        this.performanceMonitor.recordFilterMetrics(strategyMetrics);

        console.log(`✅ [FILTER FACTORY] Applied ${strategy.getName()}: ${originalDataPoints} → ${filteredDataPoints} data points (${strategyExecutionTime.toFixed(2)}ms)`);
      }
    }

    const totalTime = performance.now() - startTime;
    const finalMemory = this.getMemoryUsage();

    // Log comprehensive performance summary
    console.log(`🎯 [FILTER FACTORY] PHASE 4 COMPLETE:`, {
      totalProcessingTime: `${totalTime.toFixed(2)}ms`,
      appliedFilters: appliedFilters,
      totalFiltersApplied: appliedFilters.length,
      originalDataPoints: data.dataPoints.length,
      finalDataPoints: filteredData.dataPoints.length,
      overallFilterEfficiency: `${((filteredData.dataPoints.length / data.dataPoints.length) * 100).toFixed(1)}%`,
      memoryUsage: {
        initial: `${(initialMemory / 1024 / 1024).toFixed(2)}MB`,
        final: `${(finalMemory / 1024 / 1024).toFixed(2)}MB`,
        delta: `${((finalMemory - initialMemory) / 1024 / 1024).toFixed(2)}MB`
      },
      performanceGrade: this.calculatePerformanceGrade(totalTime, appliedFilters.length),
      individualMetrics: individualMetrics.map(m => ({
        filter: m.filterName,
        time: `${m.executionTime.toFixed(2)}ms`,
        efficiency: `${(m.filterEfficiency * 100).toFixed(1)}%`
      }))
    });

    return filteredData;
  }

  /**
   * Calculate performance grade based on execution time and complexity
   */
  private static calculatePerformanceGrade(totalTime: number, filtersApplied: number): string {
    const expectedTime = filtersApplied * 50; // 50ms per filter baseline
    const performance = expectedTime / totalTime;

    if (performance >= 2) return 'A+ (Excellent)';
    if (performance >= 1.5) return 'A (Very Good)';
    if (performance >= 1.2) return 'B (Good)';
    if (performance >= 1) return 'C (Acceptable)';
    if (performance >= 0.8) return 'D (Below Average)';
    return 'F (Needs Optimization)';
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * PHASE 4: Enhanced strategy registration with performance tracking
   */
  static registerStrategy(strategy: BaseFilterStrategy): void {
    // Remove existing strategy with same name if it exists
    this.strategies = this.strategies.filter(s => s.getName() !== strategy.getName());
    
    // Add new strategy
    this.strategies.push(strategy);
    
    console.log(`🔧 [FILTER FACTORY] PHASE 4: Registered optimized strategy: ${strategy.getName()}`);
  }

  /**
   * Get all registered strategies (for testing/debugging)
   */
  static getStrategies(): BaseFilterStrategy[] {
    return [...this.strategies];
  }

  /**
   * Get a specific strategy by name
   */
  static getStrategy(name: string): BaseFilterStrategy | undefined {
    return this.strategies.find(s => s.getName() === name);
  }

  /**
   * Check if any filters are active
   */
  static hasActiveFilters(filters: DemandFilters): boolean {
    return this.strategies.some(strategy => strategy.shouldApply(filters));
  }

  /**
   * Get list of active filter names
   */
  static getActiveFilterNames(filters: DemandFilters): string[] {
    return this.strategies
      .filter(strategy => strategy.shouldApply(filters))
      .map(strategy => strategy.getName());
  }

  /**
   * PHASE 4: Get comprehensive performance dashboard
   */
  static getPerformanceDashboard(): any {
    const dashboard = this.performanceMonitor.getPerformanceDashboard();
    return {
      ...dashboard,
      registeredStrategies: this.strategies.map(s => s.getName()),
      totalStrategiesRegistered: this.strategies.length
    };
  }

  /**
   * PHASE 4: Get filter performance summary
   */
  static getFilterPerformanceSummary(filterName?: string): any {
    if (filterName) {
      return this.performanceMonitor.getFilterSummary(filterName);
    }
    return this.performanceMonitor.getPerformanceDashboard();
  }

  /**
   * PHASE 4: Clear all performance data
   */
  static clearPerformanceData(): void {
    this.performanceMonitor.clearAllData();
    console.log('🧹 [FILTER FACTORY] Performance data cleared');
  }
}
