
import React from 'react';
import { MonthlyStaffMetrics } from '@/types/demand';

interface StaffTotalSummaryCellProps {
  staffName: string;
  totalHours: number;
  totalCapacityHours: number;
  utilizationPercentage: number;
}

export const StaffTotalSummaryCell: React.FC<StaffTotalSummaryCellProps> = ({
  staffName,
  totalHours,
  totalCapacityHours,
  utilizationPercentage
}) => {
  // Get utilization color coding based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-50 font-semibold'; // Over-utilized
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 font-medium'; // High utilization
    if (percentage >= 50) return 'text-green-600 bg-green-50'; // Good utilization
    return 'text-gray-500 bg-gray-50'; // Under-utilized
  };

  const gap = totalCapacityHours - totalHours;
  const gapColor = gap > 0 ? 'text-green-600' : gap < 0 ? 'text-red-600' : 'text-gray-500';
  const utilColor = getUtilizationColor(utilizationPercentage);

  // Create metrics object compatible with StaffMatrixCell styling
  const metrics: MonthlyStaffMetrics = {
    demandHours: totalHours,
    capacityHours: totalCapacityHours,
    gap,
    utilizationPercentage
  };

  if (totalCapacityHours === 0) {
    return <div className="text-center text-gray-400">-</div>;
  }

  return (
    <div className="text-center space-y-1 py-2">
      <div className="text-xs">
        {metrics.demandHours.toFixed(1)} / {metrics.capacityHours.toFixed(1)}
      </div>
      <div className={`text-xs font-medium ${gapColor}`}>
        {gap > 0 ? '+' : ''}{gap.toFixed(1)}
      </div>
      <div className={`text-xs font-semibold ${utilColor}`}>
        {metrics.utilizationPercentage.toFixed(0)}%
      </div>
    </div>
  );
};
