
import React, { useState } from 'react';
import { TaskSelectionList } from './TaskSelectionList';
import { TaskSelectionPanel } from './TaskSelectionPanel';
import { DialogFooter } from './DialogFooter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CopyTaskStep, TaskFilterOption } from './types';
import { useQuery } from '@tanstack/react-query';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';

interface SelectTasksStepProps {
  clientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  step: CopyTaskStep;
  handleBack: () => void;
  handleNext: () => void;
}

export const SelectTasksStep: React.FC<SelectTasksStepProps> = ({
  clientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  step,
  handleBack,
  handleNext,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('all');

  // Fetch recurring tasks
  const { data: recurringTasks = [], isLoading: recurringLoading } = useQuery({
    queryKey: ['client', clientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(clientId),
    enabled: !!clientId,
  });

  // Fetch ad-hoc tasks
  const { data: adHocTasks = [], isLoading: adHocLoading } = useQuery({
    queryKey: ['client', clientId, 'adhoc-tasks'],
    queryFn: () => getClientAdHocTasks(clientId),
    enabled: !!clientId,
  });

  const isLoading = recurringLoading || adHocLoading;

  // Filter tasks based on search term and active filter
  const filteredTasks = [...recurringTasks, ...adHocTasks].filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Select Tasks to Copy</h2>
        <p className="text-muted-foreground">
          Choose the tasks you want to copy from this client to the destination client.
        </p>
      </div>

      {/* Search and filter controls */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <TaskSelectionPanel
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
        <TaskSelectionList
          tasks={filteredTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleSelection={handleToggleTaskSelection}
          isLoading={isLoading}
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
