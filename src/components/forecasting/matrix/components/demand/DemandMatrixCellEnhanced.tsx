
import React from 'react';
import { ClientTaskDemand } from '@/types/demand';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { formatHours, formatNumber, roundToDecimals } from '@/lib/numberUtils';

interface DemandMatrixCellEnhancedProps {
  skillOrClient: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: ClientTaskDemand[];
  groupingMode: 'skill' | 'client';
  skillResolutionError?: string | null;
  isSkillResolved?: boolean;
}

/**
 * Phase 4: Enhanced Demand Matrix Cell Component
 * 
 * PHASE 4 ENHANCEMENTS:
 * - Enhanced skill name display with resolution status
 * - Improved tooltips with skill resolution information
 * - User-friendly error handling for skill resolution failures
 * - Enhanced logging and diagnostics
 * - Fallback displays for missing skills
 */
export const DemandMatrixCellEnhanced: React.FC<DemandMatrixCellEnhancedProps> = ({
  skillOrClient,
  month,
  monthLabel,
  demandHours,
  taskCount,
  clientCount,
  taskBreakdown,
  groupingMode,
  skillResolutionError = null,
  isSkillResolved = true
}) => {
  console.log('🎯 [PHASE 4 CELL] Enhanced matrix cell rendering:', {
    skillOrClient,
    month,
    isSkillResolved,
    hasError: !!skillResolutionError,
    demandHours: roundToDecimals(demandHours, 1)
  });

  // Round demand hours to prevent floating point precision issues
  const roundedDemandHours = roundToDecimals(demandHours, 1);

  // Phase 4: Enhanced color coding with skill resolution status
  const getIntensityColor = (hours: number, hasResolutionError: boolean) => {
    if (hasResolutionError) {
      return 'bg-amber-50 border-amber-300 text-amber-800';
    }
    
    if (hours === 0) return 'bg-gray-50 border-gray-200';
    if (hours <= 20) return 'bg-green-50 border-green-200';
    if (hours <= 50) return 'bg-yellow-50 border-yellow-200';
    if (hours <= 100) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  // Phase 4: Enhanced skill display name with resolution status
  const getDisplayName = () => {
    if (!isSkillResolved && groupingMode === 'skill') {
      return `${skillOrClient} (?)`;
    }
    return skillOrClient;
  };

  // Phase 4: Enhanced cell content with error indicators
  const cellContent = (
    <div className={`p-3 border text-center cursor-pointer hover:shadow-md transition-shadow ${getIntensityColor(roundedDemandHours, !!skillResolutionError)}`}>
      {/* Phase 4: Skill resolution error indicator */}
      {skillResolutionError && (
        <div className="mb-1">
          <AlertCircle className="h-3 w-3 text-amber-600 mx-auto" />
        </div>
      )}
      
      <div className="text-sm font-semibold">
        {formatHours(roundedDemandHours, 1)}
      </div>
      <div className="text-xs text-muted-foreground">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
      </div>
      {groupingMode === 'skill' && clientCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {clientCount} client{clientCount !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Phase 4: Skill resolution status indicator */}
      {groupingMode === 'skill' && !isSkillResolved && (
        <div className="text-xs text-amber-600 mt-1">
          Unresolved
        </div>
      )}
    </div>
  );

  if (roundedDemandHours === 0 && !skillResolutionError) {
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
            {/* Phase 4: Enhanced header with skill resolution status */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">
                {groupingMode === 'skill' ? 'Skill' : 'Client'}: {getDisplayName()}
              </div>
              {groupingMode === 'skill' && (
                <Badge 
                  variant={isSkillResolved ? 'default' : 'destructive'} 
                  className="text-xs ml-2"
                >
                  {isSkillResolved ? 'Resolved' : 'Unresolved'}
                </Badge>
              )}
            </div>
            
            <div className="text-sm mb-2">
              Month: {monthLabel}
            </div>

            {/* Phase 4: Skill resolution error display */}
            {skillResolutionError && (
              <Alert variant="destructive" className="mb-3 text-xs">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Skill Resolution Issue: {skillResolutionError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Phase 4: Enhanced metrics display */}
            <div className="text-sm mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <Badge variant="outline" className="mr-2">
                  {formatHours(roundedDemandHours, 1)}
                </Badge>
                <Users className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="mr-2">
                  {taskCount} tasks
                </Badge>
                {groupingMode === 'skill' && (
                  <>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <Badge variant="outline">
                      {clientCount} clients
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            {/* Phase 4: Enhanced task breakdown with skill information */}
            {taskBreakdown.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-xs font-medium mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Task Breakdown:
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {taskBreakdown.slice(0, 5).map((task, index) => (
                    <div key={index} className="text-xs">
                      <div className="font-medium truncate" title={task.taskName}>
                        {task.taskName}
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between">
                        <span>{groupingMode === 'skill' ? task.clientName : task.skillType}</span>
                        <span className="font-medium">{formatHours(task.monthlyHours, 1)}</span>
                      </div>
                    </div>
                  ))}
                  {taskBreakdown.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {taskBreakdown.length - 5} more tasks
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phase 4: Debugging information for diagnostics */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-muted-foreground">
                  Debug: {month} | Resolved: {isSkillResolved.toString()}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DemandMatrixCellEnhanced;
