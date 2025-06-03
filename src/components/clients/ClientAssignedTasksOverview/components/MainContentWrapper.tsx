
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { ViewToggleSection } from './ViewToggleSection';
import { FilterDisplaySection } from './FilterDisplaySection';
import { ContentDisplaySection } from './ContentDisplaySection';
import { PerformanceMonitoringSection } from './PerformanceMonitoringSection';
import { FormattedTask, FilterState } from '../types';
import { AdvancedFilterState } from './AdvancedFilters';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';

interface MainContentWrapperProps {
  // View state
  activeView: 'tasks' | 'dashboard';
  onViewChange: (view: 'tasks' | 'dashboard') => void;
  
  // Filter state
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  advancedFilters: AdvancedFilterState;
  onAdvancedFiltersChange: (filters: AdvancedFilterState) => void;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  
  // Data
  tasksForMetrics: FormattedTask[];
  isLoading: boolean;
  error: string | null;
  formattedTasks: FormattedTask[];
  clients: Client[] | undefined;
  availableSkills: string[];
  availablePriorities: string[];
  staffOptions: StaffOption[];
  
  // Actions
  onEditTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => void;
  onDeleteTask: (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => void;
  
  // Performance monitoring
  getPerformanceRating: () => string;
  getOptimizationSuggestions: () => string[];
}

/**
 * MainContentWrapper Component
 * 
 * Wraps the main content area of the Client Assigned Tasks Overview,
 * including view toggles, filters, content display, and performance monitoring.
 */
export const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  activeView,
  onViewChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  advancedFilters,
  onAdvancedFiltersChange,
  filters,
  onFilterChange,
  onResetFilters,
  tasksForMetrics,
  isLoading,
  error,
  formattedTasks,
  clients,
  availableSkills,
  availablePriorities,
  staffOptions,
  onEditTask,
  onDeleteTask,
  getPerformanceRating,
  getOptimizationSuggestions
}) => {
  return (
    <CardContent>
      <div className="space-y-6">
        <ViewToggleSection
          activeView={activeView}
          onViewChange={onViewChange}
          showAdvancedFilters={showAdvancedFilters}
          onToggleAdvancedFilters={onToggleAdvancedFilters}
        />

        <FilterDisplaySection
          showAdvancedFilters={showAdvancedFilters}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={onAdvancedFiltersChange}
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
          clients={clients}
          availableSkills={availableSkills}
          availablePriorities={availablePriorities}
          staffOptions={staffOptions}
        />

        <ContentDisplaySection
          activeView={activeView}
          tasksForMetrics={tasksForMetrics}
          isLoading={isLoading}
          error={error}
          formattedTasks={formattedTasks}
          onResetFilters={onResetFilters}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />

        <PerformanceMonitoringSection
          getPerformanceRating={getPerformanceRating}
          getOptimizationSuggestions={getOptimizationSuggestions}
          tasksCount={tasksForMetrics.length}
        />
      </div>
    </CardContent>
  );
};
