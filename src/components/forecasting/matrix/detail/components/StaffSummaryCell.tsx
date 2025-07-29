import React from 'react';
import { formatHours, formatNumber } from '@/lib/numberUtils';

interface StaffSummaryCellProps {
  demandHours: number;
  capacityHours: number;
  utilizationPercentage: number;
  className?: string;
}

export const StaffSummaryCell: React.FC<StaffSummaryCellProps> = ({
  demandHours,
  capacityHours,
  utilizationPercentage,
  className = ""
}) => {
  const gap = capacityHours - demandHours;
  
  // Get utilization color coding
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 font-semibold'; // Over-utilized
    if (percentage >= 80) return 'text-yellow-600 font-medium'; // High utilization
    if (percentage >= 50) return 'text-green-600'; // Good utilization
    return 'text-gray-500'; // Under-utilized
  };

  // Get gap color coding
  const getGapColor = (gapValue: number) => {
    if (gapValue < 0) return 'text-red-600 font-medium'; // Shortage
    if (gapValue > 0) return 'text-green-600'; // Surplus
    return 'text-gray-500'; // Balanced
  };

  const utilizationClass = getUtilizationColor(utilizationPercentage);
  const gapClass = getGapColor(gap);

  return (
    <div className={`text-center border-l-2 border-slate-300 bg-slate-50 rounded p-1 flex flex-col justify-center ${className}`}>
      {/* Line 1: Demand/Capacity */}
      <div className="text-xs text-gray-600 leading-tight">
        {formatHours(demandHours, 1)} / {formatHours(capacityHours, 1)}
      </div>
      
      {/* Line 2: Gap */}
      <div className={`text-xs leading-tight ${gapClass}`}>
        {gap >= 0 ? '+' : ''}{formatHours(gap, 1)}
      </div>
      
      {/* Line 3: Utilization */}
      <div className={`text-xs font-medium leading-tight ${utilizationClass}`}>
        {formatNumber(utilizationPercentage, 1)}%
      </div>
    </div>
  );
};