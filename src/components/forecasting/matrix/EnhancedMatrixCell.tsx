
import React from 'react';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface EnhancedMatrixCellProps {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
  viewMode?: 'hours' | 'percentage';
  taskBreakdown?: Array<{
    taskName: string;
    clientName: string;
    hours: number;
  }>;
  staffAllocation?: Array<{
    staffName: string;
    allocatedHours: number;
  }>;
  className?: string;
}

/**
 * Enhanced matrix cell with improved color coding, tooltips, and interactive features
 */
export const EnhancedMatrixCell: React.FC<EnhancedMatrixCellProps> = ({
  skillType,
  month,
  monthLabel,
  demandHours,
  capacityHours,
  gap,
  utilizationPercent,
  viewMode = 'hours',
  taskBreakdown = [],
  staffAllocation = [],
  className
}) => {
  // Enhanced color coding based on gap and utilization
  const getCellColorScheme = () => {
    const absGap = Math.abs(gap);
    const severity = capacityHours > 0 ? absGap / capacityHours : 0;

    if (gap < 0) {
      // Shortage (red variants)
      if (severity > 0.5) return 'bg-red-100 border-red-300 text-red-900';
      if (severity > 0.2) return 'bg-red-50 border-red-200 text-red-800';
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else if (gap > 0) {
      // Surplus (green variants)
      if (severity > 0.5) return 'bg-green-100 border-green-300 text-green-900';
      if (severity > 0.2) return 'bg-green-50 border-green-200 text-green-800';
      return 'bg-blue-50 border-blue-200 text-blue-800';
    } else {
      // Balanced (neutral)
      return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Format display values based on view mode
  const getDisplayValues = () => {
    if (viewMode === 'percentage') {
      return {
        primary: `${utilizationPercent.toFixed(0)}%`,
        secondary: gap >= 0 ? `+${(gap / capacityHours * 100).toFixed(0)}%` : `${(gap / capacityHours * 100).toFixed(0)}%`
      };
    }
    return {
      primary: `${demandHours}h / ${capacityHours}h`,
      secondary: gap >= 0 ? `+${gap}h` : `${gap}h`
    };
  };

  const displayValues = getDisplayValues();
  const colorScheme = getCellColorScheme();

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          className={cn(
            "relative p-3 border text-xs min-h-[70px] flex flex-col justify-center cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
            colorScheme,
            className
          )}
        >
          <div className="text-center space-y-1">
            {/* Primary metric */}
            <div className="font-medium text-sm">
              {displayValues.primary}
            </div>
            
            {/* Gap indicator */}
            <div className={cn(
              "text-xs font-medium flex items-center justify-center gap-1",
              gap >= 0 ? "text-green-700" : "text-red-700"
            )}>
              {gap >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {displayValues.secondary}
            </div>
            
            {/* Utilization percentage (always shown) */}
            {viewMode === 'hours' && (
              <div className="text-xs opacity-75">
                {utilizationPercent.toFixed(0)}% util
              </div>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 p-4" side="top">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{skillType} - {monthLabel}</h4>
            <Badge variant={gap >= 0 ? 'success' : 'destructive'} className="text-xs">
              {gap >= 0 ? 'Surplus' : 'Shortage'}
            </Badge>
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Demand
              </div>
              <div className="font-medium">{demandHours}h</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                Capacity
              </div>
              <div className="font-medium">{capacityHours}h</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Gap</div>
              <div className={cn("font-medium", gap >= 0 ? "text-green-600" : "text-red-600")}>
                {gap >= 0 ? '+' : ''}{gap}h
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Utilization</div>
              <div className="font-medium">{utilizationPercent.toFixed(1)}%</div>
            </div>
          </div>
          
          {/* Task breakdown */}
          {taskBreakdown.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Contributing Tasks</h5>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {taskBreakdown.slice(0, 5).map((task, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="truncate flex-1">{task.clientName}: {task.taskName}</span>
                    <span className="font-medium ml-2">{task.hours}h</span>
                  </div>
                ))}
                {taskBreakdown.length > 5 && (
                  <div className="text-xs text-muted-foreground italic">
                    +{taskBreakdown.length - 5} more tasks
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Staff allocation */}
          {staffAllocation.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Staff Allocation</h5>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {staffAllocation.slice(0, 5).map((staff, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="truncate flex-1">{staff.staffName}</span>
                    <span className="font-medium ml-2">{staff.allocatedHours}h</span>
                  </div>
                ))}
                {staffAllocation.length > 5 && (
                  <div className="text-xs text-muted-foreground italic">
                    +{staffAllocation.length - 5} more staff
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedMatrixCell;
