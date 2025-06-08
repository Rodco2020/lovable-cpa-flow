
import React from 'react';
import { ClientTaskDemand } from '@/types/demand';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface DemandMatrixCellProps {
  skillOrClient: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: ClientTaskDemand[];
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixCell: React.FC<DemandMatrixCellProps> = ({
  skillOrClient,
  month,
  monthLabel,
  demandHours,
  taskCount,
  clientCount,
  taskBreakdown,
  groupingMode
}) => {
  // Color coding based on demand intensity
  const getIntensityColor = (hours: number) => {
    if (hours === 0) return 'bg-gray-50 border-gray-200';
    if (hours <= 20) return 'bg-green-50 border-green-200';
    if (hours <= 50) return 'bg-yellow-50 border-yellow-200';
    if (hours <= 100) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const cellContent = (
    <div className={`p-3 border text-center cursor-pointer hover:shadow-md transition-shadow ${getIntensityColor(demandHours)}`}>
      <div className="text-sm font-semibold">
        {demandHours.toFixed(1)}h
      </div>
      <div className="text-xs text-muted-foreground">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
      </div>
      {groupingMode === 'skill' && clientCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {clientCount} client{clientCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );

  if (demandHours === 0) {
    return cellContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cellContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="p-0">
          <div className="bg-white border rounded-lg shadow-lg p-4 max-w-xs">
            <div className="text-sm font-semibold mb-2">
              {groupingMode === 'skill' ? 'Skill' : 'Client'}: {skillOrClient}
            </div>
            <div className="text-sm mb-2">
              Month: {monthLabel}
            </div>
            <div className="text-sm mb-3">
              <Badge variant="outline" className="mr-2">
                {demandHours.toFixed(1)} hours
              </Badge>
              <Badge variant="outline" className="mr-2">
                {taskCount} tasks
              </Badge>
              {groupingMode === 'skill' && (
                <Badge variant="outline">
                  {clientCount} clients
                </Badge>
              )}
            </div>
            
            {taskBreakdown.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-xs font-medium mb-2">Task Breakdown:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {taskBreakdown.slice(0, 5).map((task, index) => (
                    <div key={index} className="text-xs">
                      <div className="font-medium truncate" title={task.taskName}>
                        {task.taskName}
                      </div>
                      <div className="text-muted-foreground">
                        {groupingMode === 'skill' ? task.clientName : task.skillType} • {task.monthlyHours.toFixed(1)}h
                      </div>
                    </div>
                  ))}
                  {taskBreakdown.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {taskBreakdown.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
