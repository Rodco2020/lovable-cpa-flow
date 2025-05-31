
import { useMemo } from 'react';
import { FormattedTask } from '../types';
import { EnhancedTaskMetricsService } from '../services/enhancedTaskMetricsService';

/**
 * Custom hook for task metrics calculation
 * 
 * Now uses EnhancedTaskMetricsService for proper skill aggregation
 * Provides memoized metrics calculations that update when task data changes
 */
export const useTaskMetrics = (tasks: FormattedTask[]) => {
  const metrics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return null;
    }
    
    return EnhancedTaskMetricsService.calculateTaskMetrics(tasks);
  }, [tasks]);

  const isEmpty = !tasks || tasks.length === 0;

  return {
    metrics,
    isEmpty,
    // Convenience accessors for commonly used metrics
    totalTasks: metrics?.totalTasks || 0,
    totalHours: metrics?.totalEstimatedHours || 0,
    averageHours: metrics?.averageHoursPerTask || 0,
    skillMetrics: metrics?.requiredHoursBySkill || [],
    clientMetrics: metrics?.taskDistributionByClient || [],
    priorityMetrics: metrics?.tasksByPriority || [],
    
    // Debug helper function
    debugSkillProcessing: (tasks: FormattedTask[]) => 
      EnhancedTaskMetricsService.debugSkillProcessing(tasks)
  };
};
