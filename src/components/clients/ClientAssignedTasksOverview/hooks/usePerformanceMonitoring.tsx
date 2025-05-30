
import { useEffect, useRef, useState } from 'react';
import { FormattedTask } from '../types';

interface PerformanceMetrics {
  calculationTime: number;
  taskCount: number;
  memoryUsage?: number;
  renderTime: number;
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  threshold?: number; // milliseconds
  onSlowPerformance?: (metrics: PerformanceMetrics) => void;
}

/**
 * Performance Monitoring Hook
 * 
 * Monitors metrics calculation performance and provides optimization insights
 * Features:
 * - Tracks calculation times
 * - Monitors memory usage (when available)
 * - Provides performance warnings
 * - Helps identify performance bottlenecks
 */
export const usePerformanceMonitoring = (
  tasks: FormattedTask[],
  options: UsePerformanceMonitoringOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    threshold = 100, // 100ms threshold
    onSlowPerformance
  } = options;

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const calculationStartRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);

  // Start monitoring calculation performance
  const startCalculationMonitoring = () => {
    if (!enabled) return;
    calculationStartRef.current = performance.now();
    setIsMonitoring(true);
  };

  // End monitoring calculation performance
  const endCalculationMonitoring = () => {
    if (!enabled || calculationStartRef.current === 0) return;
    
    const calculationTime = performance.now() - calculationStartRef.current;
    const renderTime = performance.now() - renderStartRef.current;
    
    const metrics: PerformanceMetrics = {
      calculationTime,
      taskCount: tasks.length,
      renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    };

    setPerformanceMetrics(metrics);
    setIsMonitoring(false);

    // Check if performance is below threshold
    if (calculationTime > threshold && onSlowPerformance) {
      onSlowPerformance(metrics);
    }

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Metrics Performance');
      console.log(`📊 Calculation Time: ${calculationTime.toFixed(2)}ms`);
      console.log(`📈 Task Count: ${tasks.length}`);
      console.log(`🎨 Render Time: ${renderTime.toFixed(2)}ms`);
      if (metrics.memoryUsage) {
        console.log(`💾 Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
      if (calculationTime > threshold) {
        console.warn(`⚠️ Slow performance detected! Calculation took ${calculationTime.toFixed(2)}ms`);
      }
      console.groupEnd();
    }

    calculationStartRef.current = 0;
  };

  // Monitor render performance
  useEffect(() => {
    if (enabled) {
      renderStartRef.current = performance.now();
    }
  }, [tasks, enabled]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    if (!performanceMetrics) return [];

    const suggestions: string[] = [];

    if (performanceMetrics.calculationTime > threshold) {
      suggestions.push('Consider implementing data virtualization for large datasets');
      
      if (performanceMetrics.taskCount > 1000) {
        suggestions.push('Task count is high - consider pagination or filtering');
      }
    }

    if (performanceMetrics.renderTime > 50) {
      suggestions.push('Consider using React.memo for expensive components');
      suggestions.push('Implement loading states to improve perceived performance');
    }

    if (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage > 50 * 1024 * 1024) {
      suggestions.push('High memory usage detected - check for memory leaks');
    }

    return suggestions;
  };

  // Performance rating
  const getPerformanceRating = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!performanceMetrics) return 'good';

    const { calculationTime, renderTime } = performanceMetrics;
    const totalTime = calculationTime + renderTime;

    if (totalTime < 50) return 'excellent';
    if (totalTime < 100) return 'good';
    if (totalTime < 200) return 'fair';
    return 'poor';
  };

  return {
    performanceMetrics,
    isMonitoring,
    startCalculationMonitoring,
    endCalculationMonitoring,
    getOptimizationSuggestions,
    getPerformanceRating,
    enabled
  };
};
