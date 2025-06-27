
/**
 * PHASE 4: Filter Performance Monitor
 * 
 * Comprehensive performance monitoring system for filter strategies
 * with real-time metrics, bottleneck detection, and optimization recommendations.
 */

interface FilterPerformanceMetrics {
  filterName: string;
  executionTime: number;
  dataPointsProcessed: number;
  dataPointsRetained: number;
  filterEfficiency: number;
  memoryUsage: {
    before: number;
    after: number;
    peak: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  timestamp: number;
}

interface PerformanceAlert {
  type: 'SLOW_EXECUTION' | 'HIGH_MEMORY' | 'LOW_EFFICIENCY' | 'CACHE_MISS_RATE';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  filterName: string;
  timestamp: number;
  metrics: Partial<FilterPerformanceMetrics>;
}

export class FilterPerformanceMonitor {
  private static instance: FilterPerformanceMonitor;
  private metrics: FilterPerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly MAX_ALERTS_HISTORY = 100;

  // Performance thresholds
  private readonly THRESHOLDS = {
    SLOW_EXECUTION: 200, // 200ms
    HIGH_MEMORY: 50 * 1024 * 1024, // 50MB
    LOW_EFFICIENCY: 0.1, // 10% data retained
    LOW_CACHE_HIT_RATE: 0.5 // 50% cache hit rate
  };

  private constructor() {}

  static getInstance(): FilterPerformanceMonitor {
    if (!FilterPerformanceMonitor.instance) {
      FilterPerformanceMonitor.instance = new FilterPerformanceMonitor();
    }
    return FilterPerformanceMonitor.instance;
  }

  /**
   * Record filter performance metrics
   */
  recordFilterMetrics(metrics: FilterPerformanceMetrics): void {
    // Add timestamp if not provided
    metrics.timestamp = metrics.timestamp || Date.now();

    // Store metrics
    this.metrics.push(metrics);
    this.trimMetricsHistory();

    // Check for performance issues
    this.checkPerformanceThresholds(metrics);

    // Log performance summary
    console.log(`📊 [FILTER PERF] ${metrics.filterName}:`, {
      executionTime: `${metrics.executionTime.toFixed(2)}ms`,
      efficiency: `${(metrics.filterEfficiency * 100).toFixed(1)}%`,
      dataPoints: `${metrics.dataPointsRetained}/${metrics.dataPointsProcessed}`,
      cacheHitRate: `${(metrics.cacheStats.hitRate * 100).toFixed(1)}%`,
      memoryDelta: `${((metrics.memoryUsage.after - metrics.memoryUsage.before) / 1024 / 1024).toFixed(2)}MB`
    });
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private checkPerformanceThresholds(metrics: FilterPerformanceMetrics): void {
    // Check execution time
    if (metrics.executionTime > this.THRESHOLDS.SLOW_EXECUTION) {
      this.addAlert({
        type: 'SLOW_EXECUTION',
        message: `Filter ${metrics.filterName} took ${metrics.executionTime.toFixed(2)}ms (threshold: ${this.THRESHOLDS.SLOW_EXECUTION}ms)`,
        severity: metrics.executionTime > this.THRESHOLDS.SLOW_EXECUTION * 2 ? 'HIGH' : 'MEDIUM',
        filterName: metrics.filterName,
        timestamp: Date.now(),
        metrics: { executionTime: metrics.executionTime }
      });
    }

    // Check memory usage
    const memoryDelta = metrics.memoryUsage.after - metrics.memoryUsage.before;
    if (memoryDelta > this.THRESHOLDS.HIGH_MEMORY) {
      this.addAlert({
        type: 'HIGH_MEMORY',
        message: `Filter ${metrics.filterName} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB memory (threshold: ${this.THRESHOLDS.HIGH_MEMORY / 1024 / 1024}MB)`,
        severity: memoryDelta > this.THRESHOLDS.HIGH_MEMORY * 2 ? 'HIGH' : 'MEDIUM',
        filterName: metrics.filterName,
        timestamp: Date.now(),
        metrics: { memoryUsage: metrics.memoryUsage }
      });
    }

    // Check filter efficiency
    if (metrics.filterEfficiency < this.THRESHOLDS.LOW_EFFICIENCY) {
      this.addAlert({
        type: 'LOW_EFFICIENCY',
        message: `Filter ${metrics.filterName} has low efficiency: ${(metrics.filterEfficiency * 100).toFixed(1)}% (threshold: ${this.THRESHOLDS.LOW_EFFICIENCY * 100}%)`,
        severity: 'LOW',
        filterName: metrics.filterName,
        timestamp: Date.now(),
        metrics: { filterEfficiency: metrics.filterEfficiency }
      });
    }

    // Check cache hit rate
    if (metrics.cacheStats.hitRate < this.THRESHOLDS.LOW_CACHE_HIT_RATE) {
      this.addAlert({
        type: 'CACHE_MISS_RATE',
        message: `Filter ${metrics.filterName} has low cache hit rate: ${(metrics.cacheStats.hitRate * 100).toFixed(1)}% (threshold: ${this.THRESHOLDS.LOW_CACHE_HIT_RATE * 100}%)`,
        severity: 'MEDIUM',
        filterName: metrics.filterName,
        timestamp: Date.now(),
        metrics: { cacheStats: metrics.cacheStats }
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    this.trimAlertsHistory();

    // Log alert
    const severity = alert.severity === 'HIGH' ? '🚨' : alert.severity === 'MEDIUM' ? '⚠️' : 'ℹ️';
    console.warn(`${severity} [FILTER ALERT] ${alert.message}`);
  }

  /**
   * Get performance summary for a specific filter
   */
  getFilterSummary(filterName: string): {
    totalExecutions: number;
    averageExecutionTime: number;
    totalDataPointsProcessed: number;
    averageEfficiency: number;
    recentAlerts: PerformanceAlert[];
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const filterMetrics = this.metrics.filter(m => m.filterName === filterName);
    const recentAlerts = this.alerts.filter(a => a.filterName === filterName);

    if (filterMetrics.length === 0) {
      return {
        totalExecutions: 0,
        averageExecutionTime: 0,
        totalDataPointsProcessed: 0,
        averageEfficiency: 0,
        recentAlerts: [],
        performanceGrade: 'F'
      };
    }

    const totalExecutions = filterMetrics.length;
    const averageExecutionTime = filterMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalExecutions;
    const totalDataPointsProcessed = filterMetrics.reduce((sum, m) => sum + m.dataPointsProcessed, 0);
    const averageEfficiency = filterMetrics.reduce((sum, m) => sum + m.filterEfficiency, 0) / totalExecutions;

    // Calculate performance grade
    let performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (averageExecutionTime > this.THRESHOLDS.SLOW_EXECUTION * 2) performanceGrade = 'F';
    else if (averageExecutionTime > this.THRESHOLDS.SLOW_EXECUTION) performanceGrade = 'D';
    else if (averageExecutionTime > this.THRESHOLDS.SLOW_EXECUTION * 0.5) performanceGrade = 'C';
    else if (averageExecutionTime > this.THRESHOLDS.SLOW_EXECUTION * 0.25) performanceGrade = 'B';

    return {
      totalExecutions,
      averageExecutionTime,
      totalDataPointsProcessed,
      averageEfficiency,
      recentAlerts,
      performanceGrade
    };
  }

  /**
   * Get overall performance dashboard
   */
  getPerformanceDashboard(): {
    totalFiltersMonitored: number;
    totalExecutions: number;
    overallAverageExecutionTime: number;
    recentAlerts: PerformanceAlert[];
    topPerformingFilters: string[];
    underperformingFilters: string[];
  } {
    const uniqueFilters = Array.from(new Set(this.metrics.map(m => m.filterName)));
    const totalExecutions = this.metrics.length;
    const overallAverageExecutionTime = totalExecutions > 0 
      ? this.metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalExecutions 
      : 0;

    const recentAlerts = this.alerts.slice(-10); // Last 10 alerts

    // Categorize filters by performance
    const filterPerformance = uniqueFilters.map(name => ({
      name,
      summary: this.getFilterSummary(name)
    }));

    const topPerformingFilters = filterPerformance
      .filter(f => f.summary.performanceGrade === 'A' || f.summary.performanceGrade === 'B')
      .map(f => f.name);

    const underperformingFilters = filterPerformance
      .filter(f => f.summary.performanceGrade === 'D' || f.summary.performanceGrade === 'F')
      .map(f => f.name);

    return {
      totalFiltersMonitored: uniqueFilters.length,
      totalExecutions,
      overallAverageExecutionTime,
      recentAlerts,
      topPerformingFilters,
      underperformingFilters
    };
  }

  /**
   * Clear all performance data
   */
  clearAllData(): void {
    this.metrics = [];
    this.alerts = [];
    console.log('🧹 [FILTER PERF] All performance data cleared');
  }

  /**
   * Trim metrics history to prevent memory leaks
   */
  private trimMetricsHistory(): void {
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
  }

  /**
   * Trim alerts history to prevent memory leaks
   */
  private trimAlertsHistory(): void {
    if (this.alerts.length > this.MAX_ALERTS_HISTORY) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS_HISTORY);
    }
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    metrics: FilterPerformanceMetrics[];
    alerts: PerformanceAlert[];
    exportedAt: number;
  } {
    return {
      metrics: [...this.metrics],
      alerts: [...this.alerts],
      exportedAt: Date.now()
    };
  }
}
