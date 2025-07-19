
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MonthlyStaffMetrics } from '@/types/demand';
import { formatHours } from '@/lib/numberUtils';

interface StaffMatrixCellProps {
  staffName: string;
  month: string;
  metrics: MonthlyStaffMetrics | null;
}

export function StaffMatrixCell({ staffName, month, metrics }: StaffMatrixCellProps) {
  if (!metrics || (metrics.demandHours === 0 && metrics.capacityHours === 0)) {
    return (
      <div className="h-16 flex items-center justify-center text-muted-foreground bg-gray-50 border rounded">
        -
      </div>
    );
  }

  const { demandHours, capacityHours, gap, utilizationPercentage } = metrics;
  
  // Match exact color thresholds from MatrixCell
  const getColorClass = () => {
    if (utilizationPercentage <= 50) return 'bg-green-100 border-green-200';
    if (utilizationPercentage <= 80) return 'bg-yellow-100 border-yellow-200';
    if (utilizationPercentage <= 100) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const gapColorClass = gap >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`h-16 p-2 border rounded cursor-pointer transition-all hover:shadow-md ${getColorClass()}`}>
            <div className="text-center space-y-1 h-full flex flex-col justify-center">
              <div className="font-medium text-gray-700 text-xs">
                {formatHours(demandHours, 1)} / {formatHours(capacityHours, 1)}
              </div>
              <div className={`text-xs font-medium ${gapColorClass}`}>
                {gap >= 0 ? '+' : ''}{formatHours(Math.abs(gap), 1)}
              </div>
              <div className="text-xs text-gray-500">
                {utilizationPercentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            {staffName} - {month}: {formatHours(demandHours, 1)} demand, {formatHours(capacityHours, 1)} capacity
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
