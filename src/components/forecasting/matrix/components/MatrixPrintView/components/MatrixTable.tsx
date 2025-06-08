
import React from 'react';
import { MatrixTableProps } from '../types';
import { getDataPoint } from '../utils/printUtils';

export const MatrixTable: React.FC<MatrixTableProps> = ({
  matrixData,
  filteredSkills,
  filteredMonths
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Capacity vs Demand Matrix</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Skill / Month</th>
            {filteredMonths.map(month => (
              <th key={month.key} className="border border-gray-300 p-2 min-w-[80px]">
                {month.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSkills.map(skill => (
            <React.Fragment key={skill}>
              {/* Capacity Row */}
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-blue-50">
                  {skill} (Capacity)
                </td>
                {filteredMonths.map(month => {
                  const dataPoint = getDataPoint(matrixData, skill, month.key);
                  return (
                    <td key={month.key} className="border border-gray-300 p-2 capacity-cell">
                      {dataPoint ? `${dataPoint.capacityHours.toFixed(1)}h` : '0h'}
                    </td>
                  );
                })}
              </tr>
              
              {/* Demand Row */}
              <tr>
                <td className="border border-gray-300 p-2 font-medium bg-orange-50">
                  {skill} (Demand)
                </td>
                {filteredMonths.map(month => {
                  const dataPoint = getDataPoint(matrixData, skill, month.key);
                  return (
                    <td key={month.key} className="border border-gray-300 p-2 demand-cell">
                      {dataPoint ? `${dataPoint.demandHours.toFixed(1)}h` : '0h'}
                    </td>
                  );
                })}
              </tr>
              
              {/* Gap Row */}
              <tr>
                <td className="border border-gray-300 p-2 font-medium">
                  {skill} (Gap)
                </td>
                {filteredMonths.map(month => {
                  const dataPoint = getDataPoint(matrixData, skill, month.key);
                  const gap = dataPoint?.gap || 0;
                  return (
                    <td 
                      key={month.key} 
                      className={`border border-gray-300 p-2 ${gap >= 0 ? 'gap-positive' : 'gap-negative'}`}
                    >
                      {dataPoint ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)}h` : '0h'}
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
