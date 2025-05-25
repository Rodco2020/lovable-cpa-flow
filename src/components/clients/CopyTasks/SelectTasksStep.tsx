
import React from 'react';
import { DialogFooter } from './DialogFooter';
import { CopyTaskStep } from './types';
import { SelectTasksStepHeader } from './SelectTasksStepHeader';
import { TaskSearchInput } from './TaskSearchInput';
import { TaskFilterPanel } from './TaskFilterPanel';
import { useTaskSelection } from './hooks/useTaskSelection';
import TaskSelectionPanel from './TaskSelectionPanel';

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
  const {
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    filteredTasks,
    recurringTasksCount,
    adHocTasksCount,
    displayType,
    isLoading,
    hasError
  } = useTaskSelection(clientId);
  
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
      <SelectTasksStepHeader isTemplateBuilder={isTemplateBuilder} />

      {/* Search and filter controls */}
      <div className="flex flex-col space-y-4">
        <TaskSearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <TaskFilterPanel
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
