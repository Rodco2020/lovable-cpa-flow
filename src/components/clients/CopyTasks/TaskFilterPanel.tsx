
import React from 'react';
import { TaskFilterOption } from './types';

interface TaskFilterPanelProps {
  activeFilter: TaskFilterOption;
  setActiveFilter: (filter: TaskFilterOption) => void;
  recurringTasksCount: number;
  adHocTasksCount: number;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
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
