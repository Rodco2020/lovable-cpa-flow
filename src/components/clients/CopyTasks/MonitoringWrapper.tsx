
import React, { useEffect } from 'react';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { useAnalytics } from './AnalyticsProvider';

interface MonitoringWrapperProps {
  children: React.ReactNode;
  componentName: string;
  operationId?: string;
  disabled?: boolean;
}

/**
 * A wrapper component that provides performance monitoring and analytics tracking
 * for critical components in the application. This enables production monitoring
 * without cluttering component code with monitoring logic.
 * 
 * Usage:
 * ```tsx
 * <MonitoringWrapper componentName="CopyTasksDialog" operationId="client-123">
 *   <MyCriticalComponent />
 * </MonitoringWrapper>
 * ```
 */
export const MonitoringWrapper: React.FC<MonitoringWrapperProps> = ({
  children,
  componentName,
  operationId,
  disabled = false,
}) => {
  const { startTiming, endTiming, metrics, logPerformance, getPerformanceReport } = usePerformanceMonitoring();
  const { trackTiming } = useAnalytics();

  // Monitor component mount and render performance
  useEffect(() => {
    if (disabled) return;

    const mountLabel = `${componentName}_mount`;
    startTiming(mountLabel);
    
    // Start monitoring rendering performance
    const renderFrames: number[] = [];
    let frameCount = 0;
    let lastTimestamp = performance.now();
    
    const checkFrame = (timestamp: number) => {
      const frameDuration = timestamp - lastTimestamp;
      renderFrames.push(frameDuration);
      lastTimestamp = timestamp;
      
      if (frameCount < 10) { // Monitor first 10 frames
        frameCount++;
        requestAnimationFrame(checkFrame);
      } else {
        // Calculate frame metrics
        const totalFrameDuration = renderFrames.reduce((sum, duration) => sum + duration, 0);
        const avgFrameDuration = totalFrameDuration / renderFrames.length;
        const maxFrameDuration = Math.max(...renderFrames);
        
        logPerformance(`${componentName}_avg_frame`, avgFrameDuration);
        logPerformance(`${componentName}_max_frame`, maxFrameDuration);
        
        // Report to analytics
        trackTiming('render_performance', `${componentName}_avg_frame`, avgFrameDuration);
        trackTiming('render_performance', `${componentName}_max_frame`, maxFrameDuration);
      }
    };
    
    requestAnimationFrame(checkFrame);
    
    return () => {
      const mountDuration = endTiming(mountLabel);
      logPerformance(mountLabel, mountDuration);
      trackTiming('component_lifecycle', mountLabel, mountDuration);
      
      // Generate comprehensive performance report on unmount
      const report = getPerformanceReport();
      console.debug(`[Performance] ${componentName} Report:`, report);
    };
  }, [componentName, disabled, startTiming, endTiming, logPerformance, getPerformanceReport, trackTiming]);
  
  // Report periodic performance metrics
  useEffect(() => {
    if (disabled) return;
    
    // Set up periodic reporting for long-lived components
    const reportInterval = setInterval(() => {
      const currentMemory = (performance as any).memory?.usedJSHeapSize;
      if (currentMemory) {
        trackTiming('memory_usage', `${componentName}_memory_mb`, currentMemory / (1024 * 1024));
      }
    }, 30000); // Report every 30 seconds
    
    return () => clearInterval(reportInterval);
  }, [componentName, disabled, trackTiming]);

  // Return children wrapped in a fragment to avoid adding DOM elements
  return <>{children}</>;
};
