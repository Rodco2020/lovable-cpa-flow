
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
import { PrintView } from '@/components/export/PrintView';
import { ExportService, ExportOptions, TaskExportData } from '@/services/export/exportService';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MetricsDashboard } from './components/MetricsDashboard';
import { AdvancedFilters, AdvancedFilterState } from './components/AdvancedFilters';

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
 * - NEW Phase 4: Advanced metrics dashboard with visualizations and trend analysis
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
  const [showPrintView, setShowPrintView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    skillFilters: [],
    clientFilters: [],
    priorityFilters: [],
    statusFilters: [],
    dateRange: { from: undefined, to: undefined },
    preset: null
  });
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

  // Apply advanced filters to the already filtered tasks
  const finalFilteredTasks = React.useMemo(() => {
    if (!showAdvancedFilters) return filteredTasks;

    let filtered = [...filteredTasks];

    // Apply multi-select filters
    if (advancedFilters.skillFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.skillFilters.some(skill => task.requiredSkills.includes(skill))
      );
    }

    if (advancedFilters.clientFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.clientFilters.includes(task.clientId)
      );
    }

    if (advancedFilters.priorityFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.priorityFilters.includes(task.priority)
      );
    }

    if (advancedFilters.statusFilters.length > 0) {
      filtered = filtered.filter(task => {
        return advancedFilters.statusFilters.some(status => {
          if (status === 'active') {
            return (task.taskType === 'Recurring' && task.isActive === true) || 
                   (task.taskType === 'Ad-hoc' && task.status !== 'Canceled');
          } else if (status === 'paused') {
            return (task.taskType === 'Recurring' && task.isActive === false) ||
                   (task.taskType === 'Ad-hoc' && task.status === 'Canceled');
          } else if (status === 'recurring') {
            return task.taskType === 'Recurring';
          } else if (status === 'adhoc') {
            return task.taskType === 'Ad-hoc';
          }
          return false;
        });
      });
    }

    // Apply date range filter
    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate;
        
        if (advancedFilters.dateRange.from && taskDate < advancedFilters.dateRange.from) {
          return false;
        }
        if (advancedFilters.dateRange.to && taskDate > advancedFilters.dateRange.to) {
          return false;
        }
        return true;
      });
    }

    // Apply preset-specific filters
    if (advancedFilters.preset === 'multi-skill') {
      filtered = filtered.filter(task => task.requiredSkills.length > 1);
    }

    return filtered;
  }, [filteredTasks, advancedFilters, showAdvancedFilters]);

  // Use final filtered tasks for metrics and export
  const tasksForMetrics = finalFilteredTasks;
  const filteredTaskMetrics = useTaskMetrics(tasksForMetrics);

  // Convert tasks to export format
  const exportData: TaskExportData[] = tasksForMetrics.map(task => ({
    id: task.id,
    clientName: task.clientName,
    taskName: task.taskName,
    taskType: task.taskType,
    status: task.status,
    priority: task.priority,
    estimatedHours: task.estimatedHours,
    requiredSkills: task.requiredSkills,
    nextDueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
    recurrencePattern: task.recurrencePattern ? 
      (typeof task.recurrencePattern === 'string' ? task.recurrencePattern : JSON.stringify(task.recurrencePattern)) 
      : undefined
  }));

  // Get applied filters for export
  const getAppliedFilters = () => {
    const appliedFilters: Record<string, any> = {};
    
    if (activeTab !== 'all') {
      appliedFilters['Task Type'] = activeTab === 'recurring' ? 'Recurring' : 'Ad-hoc';
    }
    
    if (filters.clientFilter && filters.clientFilter !== 'all') {
      const clientName = clients?.find(c => c.id === filters.clientFilter)?.legalName;
      if (clientName) {
        appliedFilters['Client'] = clientName;
      }
    }
    
    if (filters.skillFilter && filters.skillFilter !== 'all') {
      appliedFilters['Skill'] = filters.skillFilter;
    }
    
    if (filters.priorityFilter && filters.priorityFilter !== 'all') {
      appliedFilters['Priority'] = filters.priorityFilter;
    }
    
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      appliedFilters['Status'] = filters.statusFilter;
    }
    
    return appliedFilters;
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      const appliedFilters = options.includeFilters ? getAppliedFilters() : undefined;
      
      await ExportService.exportTasks(exportData, options, appliedFilters);
      
      toast.success(`Tasks exported successfully as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export tasks. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const handlePrintExecute = () => {
    window.print();
    setShowPrintView(false);
  };

  // Combined reset that also resets advanced filters
  const handleResetAllFilters = () => {
    resetFilters();
    setActiveTab('all');
    setAdvancedFilters({
      skillFilters: [],
      clientFilters: [],
      priorityFilters: [],
      statusFilters: [],
      dateRange: { from: undefined, to: undefined },
      preset: null
    });
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
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'tasks' | 'dashboard')}>
              <TabsList>
                <TabsTrigger value="tasks">Tasks View</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Simple Filters' : 'Advanced Filters'}
            </Button>
          </div>

          {/* Conditional Filter Display */}
          {showAdvancedFilters ? (
            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              clients={clients}
              availableSkills={availableSkills}
              availablePriorities={availablePriorities}
            />
          ) : (
            <TaskFilters
              filters={filters}
              onFilterChange={updateFilter}
              onResetFilters={handleResetAllFilters}
              clients={clients}
              availableSkills={availableSkills}
              availablePriorities={availablePriorities}
            />
          )}

          {/* Conditional Content Display */}
          {activeView === 'dashboard' ? (
            <MetricsDashboard
              tasks={tasksForMetrics}
              isLoading={isLoading}
            />
          ) : (
            <>
              <TaskMetricsPanel
                tasks={tasksForMetrics}
                isLoading={isLoading}
              />
              
              <TaskContentArea
                isLoading={isLoading}
                error={error}
                filteredTasks={tasksForMetrics}
                totalTasks={formattedTasks}
                onResetFilters={handleResetAllFilters}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            </>
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
  );
};

export default ClientAssignedTasksOverview;
