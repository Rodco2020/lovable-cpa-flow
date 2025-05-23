
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TaskSelectionPanel } from './TaskSelectionPanel';
import { TaskInstance, RecurringTask } from '@/types/task';

export type TaskTab = 'all' | 'ad-hoc' | 'recurring';
export type FilterOption = 'all' | 'high' | 'medium' | 'low';

interface SelectTasksStepProps {
  sourceClientName: string;
  activeTab: TaskTab;
  setActiveTab: (tab: TaskTab) => void;
  filterPriority: FilterOption;
  setFilterPriority: (priority: FilterOption) => void;
  totalSelectedTasks: number;
  
  // Ad-hoc task props
  filteredAdHocTasks: TaskInstance[];
  adHocTasks?: TaskInstance[];
  selectedAdHocTaskIds: Set<string>;
  toggleAdHocTask: (taskId: string) => void;
  selectAllAdHocTasks: () => void;
  adHocLoading: boolean;
  adHocError: unknown;
  
  // Recurring task props
  filteredRecurringTasks: RecurringTask[];
  recurringTasks?: RecurringTask[];
  selectedRecurringTaskIds: Set<string>;
  toggleRecurringTask: (taskId: string) => void;
  selectAllRecurringTasks: () => void;
  recurringLoading: boolean;
  recurringError: unknown;
}

/**
 * Second step of the copy client tasks dialog
 * Allows selecting which tasks to copy
 */
export const SelectTasksStep: React.FC<SelectTasksStepProps> = ({
  sourceClientName,
  activeTab,
  setActiveTab,
  filterPriority,
  setFilterPriority,
  totalSelectedTasks,
  filteredAdHocTasks,
  adHocTasks,
  selectedAdHocTaskIds,
  toggleAdHocTask,
  selectAllAdHocTasks,
  adHocLoading,
  adHocError,
  filteredRecurringTasks,
  recurringTasks,
  selectedRecurringTaskIds,
  toggleRecurringTask,
  selectAllRecurringTasks,
  recurringLoading,
  recurringError,
}) => {
  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Select tasks to copy from {sourceClientName}:
          </p>
          <Badge variant="outline" className="mt-1">
            {totalSelectedTasks} selected
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-gray-500">Filter by priority</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter tasks by priority level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Select 
            value={filterPriority} 
            onValueChange={(value) => setFilterPriority(value as FilterOption)}
          >
            <SelectTrigger className="w-[100px] h-8">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={value => setActiveTab(value as TaskTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="ad-hoc">Ad-hoc Tasks</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          {/* Ad-hoc Tasks */}
          {(activeTab === 'all' || activeTab === 'ad-hoc') && (
            <TaskSelectionPanel
              title="Ad-hoc Tasks"
              tasks={filteredAdHocTasks}
              selectedTaskIds={selectedAdHocTaskIds}
              onToggleTask={toggleAdHocTask}
              onSelectAll={selectAllAdHocTasks}
              isLoading={adHocLoading}
              error={adHocError}
              emptyMessage="No ad-hoc tasks available."
              filteredPriorityMessage={`No ${filterPriority} priority ad-hoc tasks available.`}
              allTasksLength={adHocTasks?.length || 0}
              type="ad-hoc"
            />
          )}
          
          {/* Recurring Tasks */}
          {(activeTab === 'all' || activeTab === 'recurring') && (
            <TaskSelectionPanel
              title="Recurring Tasks"
              tasks={filteredRecurringTasks}
              selectedTaskIds={selectedRecurringTaskIds}
              onToggleTask={toggleRecurringTask}
              onSelectAll={selectAllRecurringTasks}
              isLoading={recurringLoading}
              error={recurringError}
              emptyMessage="No recurring tasks available."
              filteredPriorityMessage={`No ${filterPriority} priority recurring tasks available.`}
              allTasksLength={recurringTasks?.length || 0}
              type="recurring"
            />
          )}
        </div>
      </Tabs>
    </div>
  );
};
