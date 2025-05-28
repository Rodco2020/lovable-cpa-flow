
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { EditRecurringTaskContainer } from '../EditRecurringTaskContainer';
import { EditAdHocTaskContainer } from '../EditAdHocTaskContainer';
import ClientTaskManagementDialog from '../ClientTaskManagementDialog';
import { useTasksData } from './hooks/useTasksData';
import { useTaskFiltering } from './hooks/useTaskFiltering';
import { TaskFilters } from './components/TaskFilters';
import { TaskContentArea } from './components/TaskContentArea';
import { DeleteTaskDialog } from './components/DeleteTaskDialog';
import { deleteRecurringTaskAssignment, deleteTaskInstance } from '@/services/clientTask';

const ClientAssignedTasksOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Edit task modal state
  const [editRecurringTaskDialogOpen, setEditRecurringTaskDialogOpen] = useState(false);
  const [editAdHocTaskDialogOpen, setEditAdHocTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Delete task modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    name: string;
    type: 'Ad-hoc' | 'Recurring';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task Management Dialog state
  const [taskManagementDialogOpen, setTaskManagementDialogOpen] = useState(false);

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

  // Handle task edit
  const handleEditTask = (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => {
    setSelectedTaskId(taskId);
    
    if (taskType === 'Recurring') {
      setEditRecurringTaskDialogOpen(true);
    } else {
      setEditAdHocTaskDialogOpen(true);
    }
  };

  // Handle task delete initiation
  const handleDeleteTask = (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => {
    setTaskToDelete({
      id: taskId,
      name: taskName,
      type: taskType
    });
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    
    try {
      let success = false;
      
      if (taskToDelete.type === 'Recurring') {
        success = await deleteRecurringTaskAssignment(taskToDelete.id);
      } else {
        success = await deleteTaskInstance(taskToDelete.id);
      }

      if (success) {
        toast.success(`${taskToDelete.type} task deleted successfully`);
        handleEditComplete(); // Refresh the data
      } else {
        toast.error(`Failed to delete ${taskToDelete.type.toLowerCase()} task`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(`An error occurred while deleting the ${taskToDelete.type.toLowerCase()} task`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Combined reset that also resets the tab
  const handleResetAllFilters = () => {
    resetFilters();
    setActiveTab('all');
  };

  // Handle refresh from task management operations
  const handleTasksRefresh = () => {
    console.log('Refreshing tasks after management operation');
    handleEditComplete(); // This triggers a full data refresh
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Client-Assigned Tasks Overview</CardTitle>
            <CardDescription>View and manage all client tasks across your practice</CardDescription>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-3">
            <Button 
              onClick={() => setTaskManagementDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Tasks
            </Button>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="adhoc">Ad-hoc</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <TaskFilters
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={handleResetAllFilters}
            clients={clients}
            availableSkills={availableSkills}
            availablePriorities={availablePriorities}
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

      {/* Edit Task Dialogs */}
      <EditRecurringTaskContainer
        open={editRecurringTaskDialogOpen}
        onOpenChange={setEditRecurringTaskDialogOpen}
        taskId={selectedTaskId}
        onSaveComplete={handleEditComplete}
      />
      
      <EditAdHocTaskContainer
        open={editAdHocTaskDialogOpen}
        onOpenChange={setEditAdHocTaskDialogOpen}
        taskId={selectedTaskId}
        onSaveComplete={handleEditComplete}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        taskName={taskToDelete?.name || null}
        taskType={taskToDelete?.type || null}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Task Management Dialog */}
      <ClientTaskManagementDialog
        open={taskManagementDialogOpen}
        onOpenChange={setTaskManagementDialogOpen}
        onTasksRefresh={handleTasksRefresh}
      />
    </Card>
  );
};

export default ClientAssignedTasksOverview;
