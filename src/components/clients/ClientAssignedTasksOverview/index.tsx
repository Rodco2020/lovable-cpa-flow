
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useModalManagement } from './hooks/useModalManagement';
import { useTaskMetrics } from './hooks/useTaskMetrics';
import { useAdvancedFiltering } from './hooks/useAdvancedFiltering';
import { useExportFunctionality } from './hooks/useExportFunctionality';
import { TaskOverviewHeader } from './components/TaskOverviewHeader';
import { ViewToggleSection } from './components/ViewToggleSection';
import { FilterDisplaySection } from './components/FilterDisplaySection';
import { ContentDisplaySection } from './components/ContentDisplaySection';
import { TaskModalsContainer } from './components/TaskModalsContainer';
import { PrintView } from '@/components/export/PrintView';

/**
 * Client Assigned Tasks Overview Component
 * 
 * Main component that displays and manages all client-assigned tasks across the practice.
 * Provides functionality for viewing, filtering, editing, and deleting both recurring and ad-hoc tasks.
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
 * 
 * Architecture:
 * - Uses custom hooks for data management, filtering, and modal state
 * - Modular component structure for maintainability
 * - Centralized modal management to reduce complexity
 * - Metrics integration with existing filtering system
 * - Export functionality integrated with existing data flow
 * - Advanced dashboard with charts and analytics
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
    <Card>
      <TaskOverviewHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
            onViewChange={setActiveView}
            showAdvancedFilters={showAdvancedFilters}
            onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
  );
};

export default ClientAssignedTasksOverview;
