import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  tasksCount: number;
  filteredTasksCount: number;
  memoryUsage?: number;
  timestamp: number;
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  sampleRate?: number; // Sample every N renders
  maxMetrics?: number; // Keep only last N metrics
}

/**
 * Performance Monitoring Hook - Phase 5
 * 
 * Monitors render performance, memory usage, and provides metrics
 * for large dataset optimization decisions.
 */
export const usePerformanceMonitoring = (
  taskCount: number,
  filteredTaskCount: number,
  options: UsePerformanceMonitoringOptions = {}
) => {
  const {
    enabled = true,
    sampleRate = 5,
    maxMetrics = 100
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Mark render start
  useEffect(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  });

  // Measure render completion
  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current++;
    
    // Sample only every Nth render to avoid performance impact
    if (renderCount.current % sampleRate !== 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    
    const newMetric: PerformanceMetrics = {
      renderTime,
      tasksCount: taskCount,
      filteredTasksCount: filteredTaskCount,
      timestamp: Date.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };

    setMetrics(prev => {
      const updated = [...prev, newMetric];
      return updated.slice(-maxMetrics); // Keep only recent metrics
    });
  }, [taskCount, filteredTaskCount, enabled, sampleRate, maxMetrics]);

  // Performance analysis
  const analysis = {
    averageRenderTime: metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length 
      : 0,
    maxRenderTime: metrics.length > 0 
      ? Math.max(...metrics.map(m => m.renderTime)) 
      : 0,
    isSlowRender: (threshold = 16) => // 16ms = 60fps threshold
      metrics.some(m => m.renderTime > threshold),
    needsVirtualization: taskCount > 1000,
    performanceGrade: (() => {
      const avgRender = metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length 
        : 0;
      
      if (avgRender < 5) return 'A';
      if (avgRender < 10) return 'B';
      if (avgRender < 16) return 'C';
      return 'D';
    })()
  };

  // Performance recommendations
  const recommendations = [];
  if (analysis.needsVirtualization) {
    recommendations.push('Consider implementing react-window for >1000 tasks');
  }
  if (analysis.maxRenderTime > 50) {
    recommendations.push('Optimize expensive calculations with useMemo');
  }
  if (analysis.averageRenderTime > 16) {
    recommendations.push('Add React.memo to prevent unnecessary re-renders');
  }

  // Clear metrics for memory management
  const clearMetrics = () => setMetrics([]);

  return {
    metrics,
    analysis,
    recommendations,
    clearMetrics,
    isMonitoring: enabled
  };
};

/**
 * Performance Alert Hook - Phase 5
 * 
 * Provides alerts when performance thresholds are exceeded
 */
export const usePerformanceAlerts = (
  performanceData: ReturnType<typeof usePerformanceMonitoring>
) => {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const newAlerts = [];
    
    if (performanceData.analysis.maxRenderTime > 100) {
      newAlerts.push('⚠️ Slow render detected (>100ms)');
    }
    
    if (performanceData.analysis.needsVirtualization) {
      newAlerts.push('📊 Large dataset detected - virtualization recommended');
    }
    
    if (performanceData.analysis.performanceGrade === 'D') {
      newAlerts.push('🔴 Poor performance grade - optimization needed');
    }

    setAlerts(newAlerts);
  }, [performanceData.analysis]);

  return alerts;
};