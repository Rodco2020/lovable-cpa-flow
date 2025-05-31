
import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixCellProps {
  skillType: string;
  month: string;
  demandHours: number;
  capacityHours: number;
  className?: string;
}

/**
 * Individual cell component for skill/month intersections in the capacity matrix
 * Displays demand vs capacity with color coding
 */
export const MatrixCell: React.FC<MatrixCellProps> = ({
  skillType,
  month,
  demandHours,
  capacityHours,
  className
}) => {
  // Calculate gap (negative = shortage, positive = surplus)
  const gap = capacityHours - demandHours;
  const utilizationPercent = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;
  
  // Color coding based on utilization
  const getCellColor = () => {
    if (utilizationPercent <= 50) return 'bg-green-100 border-green-200';
    if (utilizationPercent <= 80) return 'bg-yellow-100 border-yellow-200';
    if (utilizationPercent <= 100) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div 
      className={cn(
        "relative p-2 border text-xs min-h-[60px] flex flex-col justify-center",
        getCellColor(),
        className
      )}
      title={`${skillType} - ${month}: ${demandHours}h demand, ${capacityHours}h capacity`}
    >
      <div className="text-center space-y-1">
        <div className="font-medium text-gray-700">
          {demandHours}h / {capacityHours}h
        </div>
        <div className={cn(
          "text-xs font-medium",
          gap >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {gap >= 0 ? '+' : ''}{gap}h
        </div>
        <div className="text-xs text-gray-500">
          {utilizationPercent.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

export default MatrixCell;
