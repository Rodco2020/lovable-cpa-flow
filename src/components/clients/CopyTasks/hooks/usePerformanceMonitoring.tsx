import { useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  lastUpdate: number;
}

interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics;
  startTiming: (label: string) => void;
  endTiming: (label: string) => number;
  logPerformance: (operation: string, duration: number) => void;
  getPerformanceReport: () => Record<string, number>;
}

export const usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    lastUpdate: Date.now()
  });

  const timingMap = useRef<Map<string, number>>(new Map());
  const performanceLog = useRef<Record<string, number[]>>({});

  const startTiming = useCallback((label: string) => {
    timingMap.current.set(label, performance.now());
  }, []);

  const endTiming = useCallback((label: string): number => {
    const startTime = timingMap.current.get(label);
    if (startTime === undefined) {
      console.warn(`No start time found for timing label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    timingMap.current.delete(label);
    return duration;
  }, []);

  const logPerformance = useCallback((operation: string, duration: number) => {
    if (!performanceLog.current[operation]) {
      performanceLog.current[operation] = [];
    }
    
    performanceLog.current[operation].push(duration);
    
    // Keep only last 100 measurements to prevent memory leaks
    if (performanceLog.current[operation].length > 100) {
      performanceLog.current[operation] = performanceLog.current[operation].slice(-100);
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderTime: duration,
      lastUpdate: Date.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    }));

    // Log performance issues
    if (duration > 100) { // More than 100ms
      console.warn(`Performance Warning: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }, []);

  const getPerformanceReport = useCallback((): Record<string, number> => {
    const report: Record<string, number> = {};
    
    Object.entries(performanceLog.current).forEach(([operation, durations]) => {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      report[`${operation}_avg`] = Number(avg.toFixed(2));
      report[`${operation}_max`] = Number(max.toFixed(2));
      report[`${operation}_min`] = Number(min.toFixed(2));
      report[`${operation}_count`] = durations.length;
    });
    
    return report;
  }, []);

  return {
    metrics,
    startTiming,
    endTiming,
    logPerformance,
    getPerformanceReport
  };
};
