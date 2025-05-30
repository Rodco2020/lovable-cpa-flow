
import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { useModalManagement } from './hooks/useModalManagement';
import { useTaskMetrics } from './hooks/useTaskMetrics';
import { TaskOverviewHeader } from './components/TaskOverviewHeader';
import { TaskFilters } from './components/TaskFilters';
import { TaskMetricsPanel } from './components/TaskMetricsPanel';
import { TaskContentArea } from './components/TaskContentArea';
import { TaskModalsContainer } from './components/TaskModalsContainer';

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
 * - NEW: Real-time task metrics that update with filtering
 * 
 * Architecture:
 * - Uses custom hooks for data management, filtering, and modal state
 * - Modular component structure for maintainability
 * - Centralized modal management to reduce complexity
 * - Metrics integration with existing filtering system
 */
const ClientAssignedTasksOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

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

  // Calculate metrics for filtered tasks
  const filteredTaskMetrics = useTaskMetrics(filteredTasks);

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

  // Combined reset that also resets the tab
  const handleResetAllFilters = () => {
    resetFilters();
    setActiveTab('all');
  };
  
  return (
    <Card>
      <TaskOverviewHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTaskManagement={() => setTaskManagementDialogOpen(true)}
      />
      
      <CardContent>
        <div className="space-y-6">
          <TaskFilters
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={handleResetAllFilters}
            clients={clients}
            availableSkills={availableSkills}
            availablePriorities={availablePriorities}
          />
          
          {/* NEW: Task Metrics Panel */}
          <TaskMetricsPanel
            tasks={filteredTasks}
            isLoading={isLoading}
          />
          
          <TaskContentArea
            isLoading={isLoading}
            error={error}
            filteredTasks={filteredTasks}
            totalTasks={formattedTasks}
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
