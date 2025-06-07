
import React from 'react';
import { SummaryStatsProps } from '../types';
import { calculateTotalHours } from '../utils/printUtils';

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  matrixData,
  selectedSkills
}) => {
  const totalCapacity = calculateTotalHours(matrixData, selectedSkills, 'capacity');
  const totalDemand = calculateTotalHours(matrixData, selectedSkills, 'demand');
  const totalGap = calculateTotalHours(matrixData, selectedSkills, 'gap');

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Summary Statistics</h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="p-3 border rounded">
          <div className="font-medium">Total Capacity</div>
          <div className="text-lg">{totalCapacity.toFixed(1)}h</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-medium">Total Demand</div>
          <div className="text-lg">{totalDemand.toFixed(1)}h</div>
        </div>
        <div className="p-3 border rounded">
          <div className="font-medium">Overall Gap</div>
          <div className="text-lg">{totalGap.toFixed(1)}h</div>
        </div>
      </div>
    </div>
  );
};
