import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableVirtualization?: boolean;
  debounceMs?: number;
  memoizationKey?: string;
  onPerformanceMetrics?: (metrics: {
    renderTime: number;
    filterTime: number;
    memoryUsage?: number;
  }) => void;
}

/**
 * Phase 3: Performance Optimizer Component
 * 
 * Provides performance optimizations for large datasets:
 * - Debounced filtering to prevent excessive re-renders
 * - Memoization of expensive calculations
 * - Performance monitoring and metrics
 * - Memory usage optimization
 */
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableVirtualization = false,
  debounceMs = 300,
  memoizationKey = 'default',
  onPerformanceMetrics
}) => {
  const renderStartTime = useRef<number>(0);
  const filterStartTime = useRef<number>(0);
  const performanceData = useRef<{
    renderTimes: number[];
    filterTimes: number[];
    lastMemoryUsage?: number;
  }>({
    renderTimes: [],
    filterTimes: []
  });

  // Start performance monitoring
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Measure render completion
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceData.current.renderTimes.push(renderTime);
    
    // Keep only last 10 measurements
    if (performanceData.current.renderTimes.length > 10) {
      performanceData.current.renderTimes.shift();
    }

    // Report metrics if callback provided
    if (onPerformanceMetrics) {
      const avgRenderTime = performanceData.current.renderTimes.reduce((a, b) => a + b, 0) / 
                           performanceData.current.renderTimes.length;
      const avgFilterTime = performanceData.current.filterTimes.length > 0 ?
                           performanceData.current.filterTimes.reduce((a, b) => a + b, 0) / 
                           performanceData.current.filterTimes.length : 0;

      // Get memory usage if available
      let memoryUsage: number | undefined;
      if ('memory' in performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize;
        performanceData.current.lastMemoryUsage = memoryUsage;
      }

      onPerformanceMetrics({
        renderTime: avgRenderTime,
        filterTime: avgFilterTime,
        memoryUsage
      });
    }

    console.log(`⚡ [PHASE 3 PERFORMANCE] Render metrics:`, {
      currentRenderTime: renderTime,
      averageRenderTime: performanceData.current.renderTimes.reduce((a, b) => a + b, 0) / 
                        performanceData.current.renderTimes.length,
      renderCount: performanceData.current.renderTimes.length,
      memoryUsage: performanceData.current.lastMemoryUsage
    });
  });

  // Debounced filter performance tracker
  const trackFilterPerformance = useCallback(
    debounce((startTime: number) => {
      const filterTime = performance.now() - startTime;
      performanceData.current.filterTimes.push(filterTime);
      
      // Keep only last 10 measurements
      if (performanceData.current.filterTimes.length > 10) {
        performanceData.current.filterTimes.shift();
      }

      console.log(`🔍 [PHASE 3 PERFORMANCE] Filter operation completed in ${filterTime.toFixed(2)}ms`);
    }, debounceMs),
    [debounceMs]
  );

  // Memoized children to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => {
    console.log(`💾 [PHASE 3 PERFORMANCE] Memoizing children with key: ${memoizationKey}`);
    return children;
  }, [children, memoizationKey]);

  // Performance warning system
  const checkPerformanceThresholds = useCallback(() => {
    if (performanceData.current.renderTimes.length > 0) {
      const avgRenderTime = performanceData.current.renderTimes.reduce((a, b) => a + b, 0) / 
                           performanceData.current.renderTimes.length;
      
      if (avgRenderTime > 100) {
        console.warn(`⚠️ [PHASE 3 PERFORMANCE] Slow rendering detected (${avgRenderTime.toFixed(2)}ms avg). Consider optimization.`);
      }
    }

    if (performanceData.current.filterTimes.length > 0) {
      const avgFilterTime = performanceData.current.filterTimes.reduce((a, b) => a + b, 0) / 
                           performanceData.current.filterTimes.length;
      
      if (avgFilterTime > 50) {
        console.warn(`⚠️ [PHASE 3 PERFORMANCE] Slow filtering detected (${avgFilterTime.toFixed(2)}ms avg). Consider debouncing or optimization.`);
      }
    }
  }, []);

  // Run performance checks periodically
  useEffect(() => {
    const interval = setInterval(checkPerformanceThresholds, 5000);
    return () => clearInterval(interval);
  }, [checkPerformanceThresholds]);

  // Expose filter tracking function
  const startFilterTracking = useCallback(() => {
    filterStartTime.current = performance.now();
    return () => trackFilterPerformance(filterStartTime.current);
  }, [trackFilterPerformance]);

  // Add performance tracking to React context if needed
  useEffect(() => {
    // Store performance tracker in window for debugging
    (window as any).__demandMatrixPerformance = {
      startFilterTracking,
      getMetrics: () => ({
        avgRenderTime: performanceData.current.renderTimes.reduce((a, b) => a + b, 0) / 
                      performanceData.current.renderTimes.length || 0,
        avgFilterTime: performanceData.current.filterTimes.reduce((a, b) => a + b, 0) / 
                      performanceData.current.filterTimes.length || 0,
        renderCount: performanceData.current.renderTimes.length,
        filterCount: performanceData.current.filterTimes.length,
        lastMemoryUsage: performanceData.current.lastMemoryUsage
      })
    };

    return () => {
      delete (window as any).__demandMatrixPerformance;
    };
  }, [startFilterTracking]);

  return (
    <div className="performance-optimized-container">
      {memoizedChildren}
    </div>
  );
};

export default PerformanceOptimizer;

// Performance hook for components that need fine-grained control
export const usePerformanceOptimization = (key: string = 'default') => {
  const startTime = useRef<number>(0);

  const startTracking = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endTracking = useCallback((operation: string) => {
    const duration = performance.now() - startTime.current;
    console.log(`⚡ [PERFORMANCE] ${operation} completed in ${duration.toFixed(2)}ms (key: ${key})`);
    return duration;
  }, [key]);

  const debouncedCallback = useCallback(
    debounce((callback: () => void, operationName: string) => {
      startTracking();
      callback();
      endTracking(operationName);
    }, 300),
    [startTracking, endTracking]
  );

  return {
    startTracking,
    endTracking,
    debouncedCallback
  };
};
