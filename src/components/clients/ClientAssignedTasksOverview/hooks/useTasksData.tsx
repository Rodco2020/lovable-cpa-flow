
import { useEffect } from 'react';
import { useTaskDataFetching } from './useTaskDataFetching';

/**
 * Main hook for managing task data in the Client Assigned Tasks Overview
 * 
 * This hook orchestrates data fetching, state management, and provides
 * a clean interface for the component to consume task data.
 * 
 * Features:
 * - Fetches all clients and their associated tasks (recurring and ad-hoc)
 * - Provides formatted task data for display
 * - Generates filter options for skills and priorities
 * - Handles loading states and error management
 * - Provides refresh functionality for data updates
 * 
 * Architecture:
 * - Uses TaskDataService for all data fetching operations
 * - Uses TaskDataUtils for data transformation and validation
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

  // Initialize data fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Maintain the same interface as the original hook
  return {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    handleEditComplete: handleRefresh
  };
};
