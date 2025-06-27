
import { useEffect, useState } from 'react';
import { FilterPerformanceMonitor } from '@/services/forecasting/demand/performance/filtering/filterPerformanceMonitor';
import { FilterStrategyFactory } from '@/services/forecasting/demand/performance/filtering/filterStrategyFactory';

/**
 * PHASE 4: Hook for monitoring filter performance in React components
 * 
 * Provides real-time performance metrics, alerts, and optimization recommendations
 * for the filtering pipeline.
 */
export const useFilterPerformanceMonitoring = (options: {
  enableRealTimeMonitoring?: boolean;
  alertThreshold?: number;
  autoOptimize?: boolean;
} = {}) => {
  const {
    enableRealTimeMonitoring = false,
    alertThreshold = 200, // 200ms
    autoOptimize = false
  } = options;

  const [performanceDashboard, setPerformanceDashboard] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  // Initialize performance monitoring
  useEffect(() => {
    if (enableRealTimeMonitoring) {
      setIsMonitoring(true);
      
      // Set up periodic performance updates
      const interval = setInterval(() => {
        updatePerformanceData();
      }, 2000); // Update every 2 seconds

      return () => {
        clearInterval(interval);
        setIsMonitoring(false);
      };
    }
  }, [enableRealTimeMonitoring]);

  /**
   * Update performance data from the monitor
   */
  const updatePerformanceData = () => {
    try {
      const dashboard = FilterStrategyFactory.getPerformanceDashboard();
      setPerformanceDashboard(dashboard);
      
      // Extract recent alerts
      if (dashboard.recentAlerts) {
        setRecentAlerts(dashboard.recentAlerts.slice(-5)); // Last 5 alerts
      }

      // Auto-optimization logic
      if (autoOptimize && dashboard.underperformingFilters?.length > 0) {
        console.log('🔧 [AUTO-OPTIMIZE] Detected underperforming filters:', dashboard.underperformingFilters);
        // Future: Implement auto-optimization strategies
      }
    } catch (error) {
      console.error('❌ [PERF MONITOR HOOK] Error updating performance data:', error);
    }
  };

  /**
   * Get performance summary for a specific filter
   */
  const getFilterSummary = (filterName: string) => {
    return FilterStrategyFactory.getFilterPerformanceSummary(filterName);
  };

  /**
   * Clear all performance data
   */
  const clearPerformanceData = () => {
    FilterStrategyFactory.clearPerformanceData();
    setPerformanceDashboard(null);
    setRecentAlerts([]);
  };

  /**
   * Check if performance is acceptable
   */
  const isPerformanceAcceptable = () => {
    if (!performanceDashboard) return true;
    
    return performanceDashboard.overallAverageExecutionTime < alertThreshold &&
           performanceDashboard.underperformingFilters?.length === 0;
  };

  /**
   * Get performance recommendations
   */
  const getPerformanceRecommendations = () => {
    if (!performanceDashboard) return [];

    const recommendations: string[] = [];

    if (performanceDashboard.overallAverageExecutionTime > alertThreshold) {
      recommendations.push('Consider enabling filter result caching to improve performance');
    }

    if (performanceDashboard.underperformingFilters?.length > 0) {
      recommendations.push(`Optimize these filters: ${performanceDashboard.underperformingFilters.join(', ')}`);
    }

    if (performanceDashboard.totalExecutions > 1000) {
      recommendations.push('Consider implementing filter result persistence for frequently used filter combinations');
    }

    return recommendations;
  };

  return {
    // Performance data
    performanceDashboard,
    recentAlerts,
    isMonitoring,
    
    // Actions
    updatePerformanceData,
    getFilterSummary,
    clearPerformanceData,
    
    // Analysis
    isPerformanceAcceptable: isPerformanceAcceptable(),
    performanceRecommendations: getPerformanceRecommendations(),
    
    // Metrics
    averageExecutionTime: performanceDashboard?.overallAverageExecutionTime || 0,
    totalFiltersMonitored: performanceDashboard?.totalFiltersMonitored || 0,
    totalExecutions: performanceDashboard?.totalExecutions || 0
  };
};
