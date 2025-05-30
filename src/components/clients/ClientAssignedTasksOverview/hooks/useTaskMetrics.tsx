
import { useMemo } from 'react';
import { FormattedTask } from '../types';
import { TaskMetricsService } from '../services/taskMetricsService';

/**
 * Custom hook for task metrics calculation
 * 
 * Provides memoized metrics calculations that update when task data changes
 * Integrates with existing task filtering to provide real-time metrics
 */
export const useTaskMetrics = (tasks: FormattedTask[]) => {
  const metrics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return null;
    }
    
    return TaskMetricsService.calculateTaskMetrics(tasks);
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
    priorityMetrics: metrics?.tasksByPriority || []
  };
};
