
import { useEffect } from 'react';
import { useTaskDataFetching } from './useTaskDataFetching';
import { useTaskMetrics } from './useTaskMetrics';

/**
 * Main hook for managing task data in the Client Assigned Tasks Overview
 * 
 * This hook orchestrates data fetching, state management, and provides
 * a clean interface for the component to consume task data and metrics.
 * 
 * Features:
 * - Fetches all clients and their associated tasks (recurring and ad-hoc)
 * - Provides formatted task data for display
 * - Generates filter options for skills and priorities
 * - Handles loading states and error management
 * - Provides refresh functionality for data updates
 * - NEW: Includes task metrics calculations
 * 
 * Architecture:
 * - Uses TaskDataService for all data fetching operations
 * - Uses TaskDataUtils for data transformation and validation
 * - Uses TaskMetricsService for metrics calculations
 * - Maintains the same interface as the original hook for backward compatibility
 */
export const useTasksData = () => {
  const {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    fetchData,
    handleRefresh
  } = useTaskDataFetching();

  // Calculate metrics for all tasks
  const taskMetrics = useTaskMetrics(formattedTasks);

  // Initialize data fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Extended interface with metrics
  return {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    handleEditComplete: handleRefresh,
    // New metrics functionality
    taskMetrics,
    getTaskMetrics: () => taskMetrics // For backward compatibility
  };
};
