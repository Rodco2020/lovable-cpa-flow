
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useModalManagement } from './hooks/useModalManagement';
import { useTaskMetrics } from './hooks/useTaskMetrics';
import { useAdvancedFiltering } from './hooks/useAdvancedFiltering';
import { useExportFunctionality } from './hooks/useExportFunctionality';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { TaskOverviewHeader } from './components/TaskOverviewHeader';
import { ViewToggleSection } from './components/ViewToggleSection';
import { FilterDisplaySection } from './components/FilterDisplaySection';
import { ContentDisplaySection } from './components/ContentDisplaySection';
import { TaskModalsContainer } from './components/TaskModalsContainer';
import { MetricsProvider } from './providers/MetricsProvider';
import { MetricsErrorBoundary } from './components/MetricsErrorBoundary';
import { PrintView } from '@/components/export/PrintView';
import { createScreenReaderAnnouncement } from './utils/accessibilityUtils';

/**
 * Client Assigned Tasks Overview Component - Phase 5: Final Integration and Polish
 * 
 * Enhanced with:
 * - Performance optimization with memoization and monitoring
 * - Accessibility improvements (ARIA labels, keyboard navigation, screen reader support)
 * - Error boundaries for graceful error handling
 * - Loading states with skeletons
 * - Responsive design optimizations
 * - Memory leak prevention
 * 
 * Key Features:
 * - Unified view of all client tasks (recurring and ad-hoc)
 * - Advanced filtering by client, skill, priority, and status
 * - Tab-based navigation (All/Recurring/Ad-hoc)
 * - Task management operations (edit, delete, bulk operations)
 * - Integration with task management dialog for creating new tasks
 * - Real-time task metrics that update with filtering
 * - Export and print functionality with multiple format support
 * - Advanced metrics dashboard with visualizations and trend analysis
 * - Performance monitoring and optimization suggestions
 * - Comprehensive accessibility support
 * 
 * Architecture:
 * - Uses custom hooks for data management, filtering, and modal state
 * - Modular component structure for maintainability
 * - Centralized modal management to reduce complexity
 * - Metrics integration with existing filtering system
 * - Export functionality integrated with existing data flow
 * - Advanced dashboard with charts and analytics
 * - Performance provider for centralized metrics calculations
 * - Error boundaries for graceful error handling
 */
const ClientAssignedTasksOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeView, setActiveView] = useState<'tasks' | 'dashboard'>('tasks');

  // Data and filtering hooks
  const {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    handleEditComplete
  } = useTasksData();

  const {
    filteredTasks,
    filters,
    updateFilter,
    resetFilters
  } = useTaskFiltering(formattedTasks, activeTab);

  // Advanced filtering hook
  const {
    showAdvancedFilters,
    setShowAdvancedFilters,
    advancedFilters,
    setAdvancedFilters,
    finalFilteredTasks,
    resetAdvancedFilters
  } = useAdvancedFiltering(filteredTasks);

  // Performance monitoring for the component
  const { getPerformanceRating, getOptimizationSuggestions } = usePerformanceMonitoring(
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

  // Modal management hook
  const {
    editRecurringTaskDialogOpen,
    setEditRecurringTaskDialogOpen,
    editAdHocTaskDialogOpen,
    setEditAdHocTaskDialogOpen,
    selectedTaskId,
    deleteDialogOpen,
    setDeleteDialogOpen,
    taskToDelete,
    isDeleting,
    taskManagementDialogOpen,
    setTaskManagementDialogOpen,
    handleEditTask,
    handleDeleteTask,
    handleDeleteConfirm,
    handleTasksRefresh
  } = useModalManagement(handleEditComplete);

  // Use final filtered tasks for metrics and export
  const tasksForMetrics = finalFilteredTasks;
  const filteredTaskMetrics = useTaskMetrics(tasksForMetrics);

  // Export functionality hook
  const {
    showPrintView,
    isExporting,
    exportData,
    getAppliedFilters,
    handleExport,
    handlePrint,
    handlePrintExecute
  } = useExportFunctionality(tasksForMetrics, clients, filters, activeTab);

  // Combined reset that also resets advanced filters
  const handleResetAllFilters = () => {
    resetFilters();
    resetAdvancedFilters();
    setActiveTab('all');
    
    // Announce filter reset to screen readers
    createScreenReaderAnnouncement(
      'All filters have been reset. Showing all tasks.',
      'polite'
    );
  };

  // Handle view changes with accessibility announcements
  const handleViewChange = (view: 'tasks' | 'dashboard') => {
    setActiveView(view);
    createScreenReaderAnnouncement(
      `Switched to ${view} view. ${view === 'dashboard' ? 'Showing metrics and charts.' : 'Showing task list.'}`,
      'polite'
    );
  };

  // Handle tab changes with accessibility announcements
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const tabName = tab === 'all' ? 'all tasks' : `${tab} tasks`;
    createScreenReaderAnnouncement(
      `Switched to ${tabName} tab.`,
      'polite'
    );
  };

  if (showPrintView) {
    return (
      <PrintView
        title="Client-Assigned Tasks Overview"
        data={exportData}
        dataType="tasks"
        appliedFilters={getAppliedFilters()}
        onPrint={handlePrintExecute}
      />
    );
  }
  
  return (
    <MetricsErrorBoundary>
      <MetricsProvider tasks={tasksForMetrics}>
        <Card>
          <TaskOverviewHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenTaskManagement={() => setTaskManagementDialogOpen(true)}
            onExport={handleExport}
            onPrint={handlePrint}
            isExporting={isExporting}
            hasData={exportData.length > 0}
          />
          
          <CardContent>
            <div className="space-y-6">
              <ViewToggleSection
                activeView={activeView}
                onViewChange={handleViewChange}
                showAdvancedFilters={showAdvancedFilters}
                onToggleAdvancedFilters={() => {
                  setShowAdvancedFilters(!showAdvancedFilters);
                  createScreenReaderAnnouncement(
                    `Switched to ${!showAdvancedFilters ? 'advanced' : 'simple'} filters.`,
                    'polite'
                  );
                }}
              />

              <FilterDisplaySection
                showAdvancedFilters={showAdvancedFilters}
                advancedFilters={advancedFilters}
                onAdvancedFiltersChange={setAdvancedFilters}
                filters={filters}
                onFilterChange={updateFilter}
                onResetFilters={handleResetAllFilters}
                clients={clients}
                availableSkills={availableSkills}
                availablePriorities={availablePriorities}
              />

              <ContentDisplaySection
                activeView={activeView}
                tasksForMetrics={tasksForMetrics}
                isLoading={isLoading}
                error={error}
                formattedTasks={formattedTasks}
                onResetFilters={handleResetAllFilters}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />

              {/* Development Performance Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Performance Rating: {getPerformanceRating()}</span>
                    <span>Tasks: {tasksForMetrics.length}</span>
                  </div>
                  {getOptimizationSuggestions().length > 0 && (
                    <div className="mt-2">
                      <strong>Optimization Suggestions:</strong>
                      <ul className="list-disc list-inside">
                        {getOptimizationSuggestions().map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <TaskModalsContainer
            editRecurringTaskDialogOpen={editRecurringTaskDialogOpen}
            setEditRecurringTaskDialogOpen={setEditRecurringTaskDialogOpen}
            editAdHocTaskDialogOpen={editAdHocTaskDialogOpen}
            setEditAdHocTaskDialogOpen={setEditAdHocTaskDialogOpen}
            selectedTaskId={selectedTaskId}
            handleEditComplete={handleEditComplete}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            taskToDelete={taskToDelete}
            isDeleting={isDeleting}
            handleDeleteConfirm={handleDeleteConfirm}
            taskManagementDialogOpen={taskManagementDialogOpen}
            setTaskManagementDialogOpen={setTaskManagementDialogOpen}
            handleTasksRefresh={handleTasksRefresh}
          />
        </Card>
      </MetricsProvider>
    </MetricsErrorBoundary>
  );
};

export default ClientAssignedTasksOverview;
