
import React, { useState } from 'react';
import { DialogFooter } from './DialogFooter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CopyTaskStep, TaskFilterOption, TaskSelectionPanelFilterProps } from './types';
import { useQuery } from '@tanstack/react-query';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import TaskSelectionPanel from './TaskSelectionPanel';
import { RecurringTask, TaskInstance } from '@/types/task';

interface SelectTasksStepProps {
  clientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  step: CopyTaskStep;
  handleBack: () => void;
  handleNext: () => void;
  isTemplateBuilder?: boolean;
}

// This component is used to display filter options for the task selection
const TaskSelectionPanelFilter: React.FC<TaskSelectionPanelFilterProps> = ({
  activeFilter,
  setActiveFilter,
  recurringTasksCount,
  adHocTasksCount,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 text-xs rounded-full ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          All ({adHocTasksCount + recurringTasksCount})
        </button>
        <button
          onClick={() => setActiveFilter('adhoc')}
          className={`px-3 py-1 text-xs rounded-full ${
            activeFilter === 'adhoc'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Ad-hoc ({adHocTasksCount})
        </button>
        <button
          onClick={() => setActiveFilter('recurring')}
          className={`px-3 py-1 text-xs rounded-full ${
            activeFilter === 'recurring'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Recurring ({recurringTasksCount})
        </button>
      </div>
      <div className="flex justify-between text-xs">
        <span>
          Selected: {selectedCount} of {totalCount}
        </span>
        <div className="space-x-2">
          <button
            onClick={onSelectAll}
            className="text-primary hover:underline"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-primary hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>
    </div>
  );
};

export const SelectTasksStep: React.FC<SelectTasksStepProps> = ({
  clientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  step,
  handleBack,
  handleNext,
  isTemplateBuilder = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('all');

  // Fetch recurring tasks
  const { data: recurringTasks = [], isLoading: recurringLoading, error: recurringError } = useQuery({
    queryKey: ['client', clientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(clientId),
    enabled: !!clientId,
  });

  // Fetch ad-hoc tasks
  const { data: adHocTasks = [], isLoading: adHocLoading, error: adHocError } = useQuery({
    queryKey: ['client', clientId, 'adhoc-tasks'],
    queryFn: () => getClientAdHocTasks(clientId),
    enabled: !!clientId,
  });

  const isLoading = recurringLoading || adHocLoading;
  const hasError = recurringError || adHocError;

  // Filter tasks based on search term and active filter
  const filteredTasks = [...(recurringTasks as RecurringTask[]), ...(adHocTasks as TaskInstance[])].filter(task => {
    const matchesSearch = task?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') {
      return matchesSearch;
    } else if (activeFilter === 'recurring') {
      return matchesSearch && 'recurrencePattern' in task;
    } else if (activeFilter === 'adhoc') {
      return matchesSearch && !('recurrencePattern' in task);
    }
    return false;
  });

  const recurringTasksCount = recurringTasks.length;
  const adHocTasksCount = adHocTasks.length;
  
  const handleSelectAll = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTaskIds(allTaskIds);
  };
  
  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };
  
  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(
      selectedTaskIds.includes(taskId)
        ? selectedTaskIds.filter(id => id !== taskId)
        : [...selectedTaskIds, taskId]
    );
  };
  
  // Determine the display type based on active filter
  const displayType = activeFilter === 'adhoc' ? 'ad-hoc' : 'recurring';
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {isTemplateBuilder ? 'Select Tasks for Template' : 'Select Tasks to Copy'}
        </h2>
        <p className="text-muted-foreground">
          {isTemplateBuilder 
            ? 'Choose the tasks you want to convert into a reusable template.'
            : 'Choose the tasks you want to copy from this client to the destination client.'
          }
        </p>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TaskSelectionPanelFilter
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          recurringTasksCount={recurringTasksCount}
          adHocTasksCount={adHocTasksCount}
          selectedCount={selectedTaskIds.length}
          totalCount={filteredTasks.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      </div>

      {/* Task list */}
      <div className="border rounded-md">
        <TaskSelectionPanel
          tasks={filteredTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleTask={handleToggleTaskSelection}
          type={displayType}
          onSelectAll={handleSelectAll}
          isLoading={isLoading}
          error={hasError ? new Error('Failed to load tasks') : null}
        />
      </div>

      <DialogFooter
        step={step}
        handleBack={handleBack}
        handleNext={handleNext}
        disableNext={selectedTaskIds.length === 0}
        handleCopy={() => {}}
        isProcessing={false}
        isSuccess={false}
      />
    </div>
  );
};
