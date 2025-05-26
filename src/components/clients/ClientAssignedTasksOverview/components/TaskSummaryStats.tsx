
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, FileCheck, CheckCircle } from 'lucide-react';
import { FormattedTask } from '../types';

interface TaskSummaryStatsProps {
  filteredTasks: FormattedTask[];
  totalTasks: FormattedTask[];
}

export const TaskSummaryStats: React.FC<TaskSummaryStatsProps> = ({ 
  filteredTasks, 
  totalTasks 
}) => {
  const recurringCount = totalTasks.filter(t => t.taskType === 'Recurring').length;
  const adHocCount = totalTasks.filter(t => t.taskType === 'Ad-hoc').length;
  const activeCount = totalTasks.filter(t => 
    (t.taskType === 'Recurring' && t.isActive === true) || 
    (t.taskType === 'Ad-hoc' && t.status !== 'Canceled')
  ).length;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <div className="text-sm text-muted-foreground">
        Showing {filteredTasks.length} of {totalTasks.length} total tasks
      </div>
      <div className="ml-auto flex flex-wrap gap-3">
        <Badge variant="outline" className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" /> 
          Recurring: {recurringCount}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <FileCheck className="h-3 w-3" /> 
          Ad-hoc: {adHocCount}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> 
          Active: {activeCount}
        </Badge>
      </div>
    </div>
  );
};
