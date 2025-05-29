
import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentMounts: number;
  reRenders: number;
}

interface UsePerformanceMonitorProps {
  componentName: string;
  threshold?: number; // milliseconds
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = ({
  componentName,
  threshold = 100,
  onPerformanceIssue
}: UsePerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    reRenders: 0
  });

  const [startTime, setStartTime] = useState<number>(0);

  // Track component mount
  useEffect(() => {
    const mountTime = performance.now();
    setStartTime(mountTime);
    
    setMetrics(prev => ({
      ...prev,
      componentMounts: prev.componentMounts + 1
    }));

    // Track memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize
      }));
    }

    return () => {
      const unmountTime = performance.now();
      const totalRenderTime = unmountTime - mountTime;
      
      console.log(`${componentName} total lifetime: ${totalRenderTime.toFixed(2)}ms`);
    };
  }, [componentName]);

  // Track re-renders
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      reRenders: prev.reRenders + 1
    }));
  });

  const measureRender = useCallback(() => {
    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      setMetrics(prev => {
        const newMetrics = {
          ...prev,
          renderTime
        };

        // Check if performance threshold is exceeded
        if (renderTime > threshold && onPerformanceIssue) {
          onPerformanceIssue(newMetrics);
        }

        return newMetrics;
      });

      // Log performance in development
      if (process.env.NODE_ENV === 'development' && renderTime > threshold) {
        console.warn(
          `⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }
    };
  }, [componentName, threshold, onPerformanceIssue]);

  const logMetrics = useCallback(() => {
    console.table({
      Component: componentName,
      'Render Time (ms)': metrics.renderTime.toFixed(2),
      'Memory Usage (MB)': metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(2) : 'N/A',
      'Component Mounts': metrics.componentMounts,
      'Re-renders': metrics.reRenders
    });
  }, [componentName, metrics]);

  return {
    metrics,
    measureRender,
    logMetrics
  };
};
