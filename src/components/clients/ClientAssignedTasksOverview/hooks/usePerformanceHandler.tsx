
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { FormattedTask } from '../types';
import { createScreenReaderAnnouncement } from '../utils/accessibilityUtils';

/**
 * Hook for managing performance monitoring in the Client Assigned Tasks Overview
 * 
 * Handles performance monitoring setup and slow performance notifications
 */
export const usePerformanceHandler = (finalFilteredTasks: FormattedTask[]) => {
  return usePerformanceMonitoring(
    finalFilteredTasks,
    {
      enabled: true,
      threshold: 150, // 150ms threshold for task processing
      onSlowPerformance: (metrics) => {
        console.warn('Slow performance detected in Client Tasks Overview:', metrics);
        createScreenReaderAnnouncement(
          'Performance warning: The application is running slowly. Consider reducing the number of displayed tasks.',
          'assertive'
        );
      }
    }
  );
};
