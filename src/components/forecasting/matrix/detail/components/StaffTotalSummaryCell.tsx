
import React from 'react';
import { MonthlyStaffMetrics } from '@/types/demand';
import { getUtilizationColor } from '@/utils/utilizationColors';

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
