
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useModalManagement } from './hooks/useModalManagement';
import { useTaskMetrics } from './hooks/useTaskMetrics';
import { useAdvancedFiltering } from './hooks/useAdvancedFiltering';
import { useExportFunctionality } from './hooks/useExportFunctionality';
import { usePerformanceHandler } from './hooks/usePerformanceHandler';
import { TaskOverviewHeader } from './components/TaskOverviewHeader';
import { MainContentWrapper } from './components/MainContentWrapper';
import { TaskModalsContainer } from './components/TaskModalsContainer';
import { MetricsProvider } from './providers/MetricsProvider';
import { MetricsErrorBoundary } from './components/MetricsErrorBoundary';
import { PrintView } from '@/components/export/PrintView';
import { AccessibilityHandlers } from './components/AccessibilityHandlers';

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
 * - Advanced filtering by client, skill, priority, status, and staff liaison
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
    staffOptions,
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
  const { getPerformanceRating, getOptimizationSuggestions } = usePerformanceHandler(finalFilteredTasks);

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

  // Event handlers using AccessibilityHandlers
  const handleResetAllFilters = () => {
    AccessibilityHandlers.handleResetAllFilters(resetFilters, resetAdvancedFilters, setActiveTab);
  };

  const handleViewChange = (view: 'tasks' | 'dashboard') => {
    AccessibilityHandlers.handleViewChange(view, setActiveView);
  };

  const handleTabChange = (tab: string) => {
    AccessibilityHandlers.handleTabChange(tab, setActiveTab);
  };

  const handleAdvancedFiltersToggle = () => {
    AccessibilityHandlers.handleAdvancedFiltersToggle(showAdvancedFilters, setShowAdvancedFilters);
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
          
          <MainContentWrapper
            activeView={activeView}
            onViewChange={handleViewChange}
            showAdvancedFilters={showAdvancedFilters}
            onToggleAdvancedFilters={handleAdvancedFiltersToggle}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={setAdvancedFilters}
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={handleResetAllFilters}
            tasksForMetrics={tasksForMetrics}
            isLoading={isLoading}
            error={error}
            formattedTasks={formattedTasks}
            clients={clients}
            availableSkills={availableSkills}
            availablePriorities={availablePriorities}
            staffOptions={staffOptions}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            getPerformanceRating={getPerformanceRating}
            getOptimizationSuggestions={getOptimizationSuggestions}
          />

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
